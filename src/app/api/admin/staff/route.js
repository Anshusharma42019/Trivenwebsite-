import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import { hashPassword } from '@/lib/auth';
import { createStaffSchema } from '@/validators/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required. Please log in as an administrator.', 401);
    }
    if (!hasPermission(user, PERMISSIONS.STAFF_MANAGE) && user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
      return errorResponse('Unauthorized: Staff management permissions required.', 403);
    }

    await connectDB();
    const staff = await User.find({ role: { $ne: ROLES.CUSTOMER } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(staff);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required. Please log in as an administrator.', 401);
    }
    if (!hasPermission(user, PERMISSIONS.STAFF_MANAGE) && user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
      return errorResponse('Unauthorized: Only Super Admin or Admin can onboard staff members.', 403);
    }

    const body = await request.json();
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid staff payload';
      return errorResponse(msg, 400);
    }

    const { name, email, password, phone, role, customPermissions } = validation.data;

    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse('User with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    const staffMember = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role,
      customPermissions: customPermissions || [],
      status: 'active',
    });

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'STAFF_ONBOARDED',
      entity: 'User',
      entityId: staffMember._id,
      details: { role, email: staffMember.email },
    });

    return successResponse(
      {
        id: staffMember._id,
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role,
      },
      201,
      'Staff account created successfully.'
    );
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
