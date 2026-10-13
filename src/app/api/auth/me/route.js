import { getCurrentUser } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const effectivePermissions = [
      ...(ROLE_PERMISSIONS[user.role] || []),
      ...(user.customPermissions || []),
    ];

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: effectivePermissions,
        addresses: user.addresses || [],
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
