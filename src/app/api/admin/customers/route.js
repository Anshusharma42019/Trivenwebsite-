import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.CUSTOMERS_VIEW)) {
      return errorResponse('Unauthorized: Missing customer viewing permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search');

    await connectDB();
    const query = { role: 'customer' };

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    // Enhance with order count
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({
          $or: [{ user: c._id }, { 'customerDetails.email': c.email }],
        });
        return {
          ...c,
          orderCount,
        };
      })
    );

    return successResponse({
      customers: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.CUSTOMERS_MANAGE)) {
      return errorResponse('Unauthorized: Missing customer management permissions.', 403);
    }

    const { customerId, status, note } = await request.json();
    if (!customerId) {
      return errorResponse('Customer ID is required', 400);
    }

    await connectDB();
    const customer = await User.findById(customerId);
    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    if (status) {
      customer.status = status;
    }

    if (note && note.trim()) {
      customer.customerNotes.push({
        note: note.trim(),
        createdBy: user._id,
        createdAt: new Date(),
      });
    }

    await customer.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'CUSTOMER_UPDATE',
      entity: 'User',
      entityId: customer._id,
      details: { status, hasNewNote: !!note },
    });

    return successResponse(customer, 200, 'Customer profile updated.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
