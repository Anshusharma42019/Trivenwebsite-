import { getCurrentUser, hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { checkoutSchema } from '@/validators/order';
import { createOrder } from '@/services/orderService';
import { createRazorpayOrder } from '@/services/paymentService';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';
import { sendMetaPurchaseCAPI } from '@/services/metaPixelService';

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid checkout information';
      return errorResponse(msg, 400);
    }

    const orderData = validation.data;
    const rawPhone = orderData.customerDetails?.phone || orderData.shippingAddress?.phone || '';
    const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, '');
    const cleanPhone = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : cleanPhoneDigits;
    const cleanEmail = orderData.customerDetails?.email && typeof orderData.customerDetails.email === 'string' && orderData.customerDetails.email.trim()
      ? orderData.customerDetails.email.toLowerCase().trim()
      : null;

    let user = await getCurrentUser();

    if (!user) {
      await connectDB();
      // Check if user already exists with this phone or email
      const userLookup = [];
      if (cleanPhone) {
        userLookup.push({ phone: cleanPhone });
        userLookup.push({ phone: rawPhone });
      }
      if (cleanEmail) {
        userLookup.push({ email: cleanEmail });
      }

      let existingUser = userLookup.length > 0 ? await User.findOne({ $or: userLookup }) : null;

      if (existingUser) {
        user = existingUser;
      } else {
        // Auto-create customer account so they can track orders anytime by logging in!
        // If a password was provided and is at least 6 characters, use it; otherwise default is their 10-digit mobile number
        const passwordToUse = orderData.password && typeof orderData.password === 'string' && orderData.password.trim().length >= 6
          ? orderData.password.trim()
          : (cleanPhone.length >= 6 ? cleanPhone : '123456');

        const hashedPassword = await hashPassword(passwordToUse);
        const newCustomerData = {
          name: (orderData.customerDetails?.name || orderData.shippingAddress?.fullName || 'Valued Customer').trim(),
          password: hashedPassword,
          role: 'customer',
          status: 'active',
          addresses: [
            {
              fullName: orderData.shippingAddress.fullName || orderData.customerDetails.name,
              phone: cleanPhone || orderData.shippingAddress.phone,
              addressLine1: orderData.shippingAddress.addressLine1,
              addressLine2: orderData.shippingAddress.addressLine2 || '',
              landmark: orderData.shippingAddress.landmark || '',
              city: orderData.shippingAddress.city,
              state: orderData.shippingAddress.state,
              pincode: orderData.shippingAddress.pincode,
              type: orderData.shippingAddress.addressType || 'home',
              isDefault: true,
            },
          ],
        };

        if (cleanPhone) newCustomerData.phone = cleanPhone;
        if (cleanEmail) newCustomerData.email = cleanEmail;

        user = await User.create(newCustomerData);
      }

      // Automatically sign in the customer via session cookie so they can view and track orders immediately
      try {
        const token = signToken({
          userId: user._id,
          phone: user.phone || '',
          email: user.email || '',
          role: user.role || 'customer',
        });
        await setSessionCookie(token);
      } catch (cookieErr) {
        console.warn('Could not set session cookie during guest checkout:', cookieErr.message);
      }
    }

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
            customerEmail: order.customerDetails?.email || '',
            customerPhone: order.customerDetails?.phone || '',
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
      userEmail: order.customerDetails?.email || user.email || user.phone || 'customer',
      action: 'ORDER_PLACED',
      entity: 'Order',
      entityId: order._id,
      details: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
      },
    });

    // For Cash on Delivery orders, order is confirmed immediately on backend
    if (order.paymentMethod === 'cod') {
      try {
        await sendMetaPurchaseCAPI(order, {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
          userAgent: request.headers.get('user-agent') || '',
        });
      } catch (metaErr) {
        console.error('Meta COD Purchase tracking error:', metaErr.message);
      }
    }

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
      const customerFilters = [{ user: user._id }];
      if (user.email && typeof user.email === 'string' && user.email.trim()) {
        customerFilters.push({ 'customerDetails.email': user.email.trim() });
      }
      if (user.phone && typeof user.phone === 'string' && user.phone.trim()) {
        const cleanDigits = user.phone.replace(/[^0-9]/g, '');
        const tenDigit = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
        customerFilters.push({ 'customerDetails.phone': user.phone.trim() });
        customerFilters.push({ 'shippingAddress.phone': user.phone.trim() });
        if (tenDigit) {
          customerFilters.push({ 'customerDetails.phone': tenDigit });
          customerFilters.push({ 'customerDetails.phone': `+91${tenDigit}` });
          customerFilters.push({ 'shippingAddress.phone': tenDigit });
          customerFilters.push({ 'shippingAddress.phone': `+91${tenDigit}` });
        }
      }
      query.$or = customerFilters;
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
