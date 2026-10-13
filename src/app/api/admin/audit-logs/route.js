import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasPermission(user, PERMISSIONS.AUDIT_LOGS_VIEW) && user.role !== ROLES.SUPER_ADMIN)) {
      return errorResponse('Unauthorized: Missing audit logs access permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const action = searchParams.get('action');

    await connectDB();
    const query = {};
    if (action) {
      query.action = action;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return successResponse({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
