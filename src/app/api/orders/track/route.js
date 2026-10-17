import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = (searchParams.get('orderNumber') || '').trim();
    const phone = (searchParams.get('phone') || '').trim();

    if (!orderNumber || !phone) {
      return errorResponse('Please provide both Order Number and Mobile Number to track.', 400);
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const tenDigit = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    await connectDB();

    // Find order by orderNumber or _id and verify mobile number
    let order;
    if (orderNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderNumber).populate('items.product', 'name images sku').lean();
    } else {
      order = await Order.findOne({ orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') } })
        .populate('items.product', 'name images sku')
        .lean();
    }

    if (!order) {
      return errorResponse('No order found with this Order Number. Please check and try again.', 404);
    }

    // Verify phone matches customerDetails.phone or shippingAddress.phone
    const orderCustomerPhone = (order.customerDetails?.phone || '').replace(/[^0-9]/g, '');
    const orderShippingPhone = (order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');

    const phoneMatches =
      orderCustomerPhone.includes(tenDigit) ||
      orderShippingPhone.includes(tenDigit) ||
      tenDigit.includes(orderCustomerPhone.slice(-10)) ||
      tenDigit.includes(orderShippingPhone.slice(-10));

    if (!phoneMatches) {
      return errorResponse('Mobile number does not match the records for this Order Number.', 403);
    }

    return successResponse(order, 200, 'Order tracking retrieved successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
