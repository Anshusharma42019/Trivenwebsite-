import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/errors';

export async function POST(request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return errorResponse('Coupon code is required', 400);
    }

    await connectDB();
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

    if (!coupon) {
      return errorResponse('Invalid coupon code', 404);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      return errorResponse('This coupon has expired', 400);
    }

    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      return errorResponse(`Minimum cart value for this coupon is ₹${coupon.minCartValue}`, 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('Coupon usage limit reached', 400);
    }

    const user = await getCurrentUser();
    if (user && coupon.perUserLimit) {
      const timesUsed = coupon.usedBy.filter((u) => u.email === user.email).length;
      if (timesUsed >= coupon.perUserLimit) {
        return errorResponse('You have already used this coupon maximum number of times', 400);
      }
    }

    let estimatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      estimatedDiscount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && estimatedDiscount > coupon.maxDiscountAmount) {
        estimatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      estimatedDiscount = Math.min(coupon.discountValue, cartTotal);
    }

    return successResponse({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      estimatedDiscount,
      minCartValue: coupon.minCartValue,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
