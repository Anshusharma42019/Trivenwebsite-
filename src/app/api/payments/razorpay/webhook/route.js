import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { logAuditEvent } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    await connectDB();

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id || orderEntity?.payment_id;

      if (!razorpayOrderId) {
        return NextResponse.json({ status: 'ignored_missing_order_id' }, { status: 200 });
      }

      const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
        order.paymentDetails.paidAt = new Date();
        order.statusHistory.push({
          status: 'confirmed',
          updatedAt: new Date(),
          updatedBy: 'Razorpay Webhook',
          note: `Webhook verified payment capture. ID: ${razorpayPaymentId}`,
        });
        await order.save();

        await logAuditEvent({
          userId: order.user || null,
          userEmail: order.customerDetails?.email,
          action: 'WEBHOOK_PAYMENT_CAPTURED',
          entity: 'Order',
          entityId: order._id,
          details: { razorpayOrderId, razorpayPaymentId, orderNumber: order.orderNumber },
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
