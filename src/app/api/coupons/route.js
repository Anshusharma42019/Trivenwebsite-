import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { couponSchema } from '@/validators/coupon';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.MARKETING_MANAGE)) {
      return errorResponse('Unauthorized: Missing coupon management permissions.', 403);
    }

    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return successResponse(coupons);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.MARKETING_MANAGE)) {
      return errorResponse('Unauthorized: Missing coupon management permissions.', 403);
    }

    const body = await request.json();
    const validation = couponSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid coupon details';
      return errorResponse(msg, 400);
    }

    const data = validation.data;
    await connectDB();

    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      return errorResponse(`Coupon code "${data.code}" already exists.`, 409);
    }

    const coupon = await Coupon.create({
      ...data,
      expiryDate: new Date(data.expiryDate),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
    });

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'COUPON_CREATE',
      entity: 'Coupon',
      entityId: coupon._id,
      details: { code: coupon.code, discountValue: coupon.discountValue },
    });

    return successResponse(coupon, 201, 'Coupon created successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
