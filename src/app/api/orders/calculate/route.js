import { calculateOrderTotals } from '@/services/orderService';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/errors';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, couponCode, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Cart items are required for calculation', 400);
    }

    const user = await getCurrentUser();

    const calculation = await calculateOrderTotals({
      items,
      couponCode: couponCode || null,
      paymentMethod: paymentMethod || 'cod',
      userId: user?._id || null,
      userEmail: user?.email || null,
    });

    return successResponse(calculation);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
