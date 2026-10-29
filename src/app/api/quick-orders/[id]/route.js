import { connectDB } from '@/lib/mongodb';
import QuickOrder from '@/models/QuickOrder';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'customer') {
      return errorResponse('Unauthorized access', 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    await connectDB();

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await QuickOrder.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!updated) {
      return errorResponse('Quick order not found', 404);
    }

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email || user.phone || 'staff',
      action: 'QUICK_ORDER_UPDATED',
      entity: 'QuickOrder',
      entityId: updated._id,
      details: { status: updated.status, customerPhone: updated.phone },
    });

    return successResponse(updated, 200, 'Order status updated successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'manager')) {
      return errorResponse('Unauthorized access', 403);
    }

    const { id } = await params;
    await connectDB();

    const deleted = await QuickOrder.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse('Quick order not found', 404);
    }

    return successResponse(null, 200, 'Lead deleted successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

