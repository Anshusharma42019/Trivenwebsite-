import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { checkoutSchema } from '@/validators/order';
import { createOrder } from '@/services/orderService';
import { createRazorpayOrder } from '@/services/paymentService';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid checkout information';
      return errorResponse(msg, 400);
    }

    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required. Please sign in to your Triven Ayurveda account to place an order.', 401);
    }

    const orderData = validation.data;

    const order = await createOrder({
      ...orderData,
      userId: user._id,
    });

    let paymentData = null;
    if (order.paymentMethod === 'razorpay') {
      try {
        paymentData = await createRazorpayOrder({
          amountInRupees: order.totalAmount,
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            customerEmail: order.customerDetails.email,
          },
        });

        // Store Razorpay order ID on order
        order.paymentDetails = {
          razorpayOrderId: paymentData.id,
        };
        await order.save();
      } catch (payErr) {
        return errorResponse(`Payment gateway error: ${payErr.message}`, 502);
      }
    }

    await logAuditEvent({
      userId: user?._id || null,
      userEmail: order.customerDetails.email,
      action: 'ORDER_PLACED',
      entity: 'Order',
      entityId: order._id,
      details: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
      },
    });

    return successResponse(
      {
        order,
        razorpayOrder: paymentData,
        razorpayKey: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      201,
      'Order placed successfully.'
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required to view orders.', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');

    await connectDB();

    const query = {};

    // If regular customer, show only their orders
    if (user.role === 'customer') {
      query.$or = [{ user: user._id }, { 'customerDetails.email': user.email }];
    } else {
      // Staff view: check permission
      if (!hasPermission(user, PERMISSIONS.ORDERS_VIEW)) {
        return errorResponse('Unauthorized: Missing order viewing permissions.', 403);
      }
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (search && search.trim()) {
        query.$or = [
          { orderNumber: { $regex: search.trim(), $options: 'i' } },
          { 'customerDetails.name': { $regex: search.trim(), $options: 'i' } },
          { 'customerDetails.email': { $regex: search.trim(), $options: 'i' } },
          { 'customerDetails.phone': { $regex: search.trim(), $options: 'i' } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return successResponse({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
