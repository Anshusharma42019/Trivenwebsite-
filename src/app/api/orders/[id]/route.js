import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import { updateOrderStatusSchema } from '@/validators/order';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

// Valid status transitions state machine
const ALLOWED_TRANSITIONS = {
  pending: ['processing', 'confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    await connectDB();

    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('items.product', 'name images sku').lean();
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('items.product', 'name images sku').lean();
    }

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Access check: Only the order owner or staff with permissions can view
    if (user) {
      const isOwner =
        (order.user && String(order.user) === String(user._id)) ||
        order.customerDetails.email === user.email;

      if (!isOwner && !hasPermission(user, PERMISSIONS.ORDERS_VIEW)) {
        return errorResponse('Unauthorized to view this order', 403);
      }
    }

    return successResponse(order);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.ORDERS_MANAGE)) {
      return errorResponse('Unauthorized: Missing order management permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid status update parameters';
      return errorResponse(msg, 400);
    }

    const { status, note, trackingNumber, carrier } = validation.data;

    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // State machine validation
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (order.status !== status && !allowed.includes(status) && user.role !== 'super_admin') {
      return errorResponse(
        `Invalid status transition from '${order.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}.`,
        400
      );
    }

    const oldStatus = order.status;
    order.status = status;

    // If cancelled or returned, replenish inventory
    if ((status === 'cancelled' || status === 'returned') && oldStatus !== 'cancelled' && oldStatus !== 'returned') {
      for (const item of order.items) {
        const prod = await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { new: true });
        if (prod) {
          await StockMovement.create({
            product: prod._id,
            sku: prod.sku,
            type: status === 'cancelled' ? 'adjustment' : 'return',
            quantityDelta: item.quantity,
            previousStock: prod.stock - item.quantity,
            newStock: prod.stock,
            reason: `Order ${order.orderNumber} ${status}`,
            referenceOrder: order._id,
            performedBy: user._id,
            userEmail: user.email,
          });
        }
      }
    }

    // Update tracking if provided
    if (trackingNumber) {
      order.shipmentDetails.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.shipmentDetails.carrier = carrier;
    }
    if (status === 'shipped' && !order.shipmentDetails.shippedAt) {
      order.shipmentDetails.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.shipmentDetails.deliveredAt) {
      order.shipmentDetails.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    }

    // Record transition history
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: user.email,
      note: note || `Status updated to ${status}`,
    });

    await order.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'ORDER_STATUS_UPDATE',
      entity: 'Order',
      entityId: order._id,
      details: { from: oldStatus, to: status, orderNumber: order.orderNumber },
    });

    return successResponse(order, 200, `Order status updated to ${status}`);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
