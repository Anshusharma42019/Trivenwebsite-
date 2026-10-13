import { verifyRazorpaySignature } from '@/services/paymentService';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return errorResponse('Missing required payment verification parameters', 400);
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return errorResponse('Invalid payment signature verification failed.', 400);
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse('Order not found', 404);
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
    };

    order.statusHistory.push({
      status: 'confirmed',
      updatedAt: new Date(),
      updatedBy: 'Razorpay Gateway',
      note: `Online payment verified. Payment ID: ${razorpayPaymentId}`,
    });

    await order.save();

    await logAuditEvent({
      userId: order.user || null,
      userEmail: order.customerDetails.email,
      action: 'PAYMENT_VERIFIED',
      entity: 'Order',
      entityId: order._id,
      details: { razorpayPaymentId, orderNumber: order.orderNumber },
    });

    return successResponse(order, 200, 'Payment verified successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
