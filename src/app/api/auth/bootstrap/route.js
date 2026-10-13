import { bootstrapSuperAdmin, hasSuperAdmin } from '@/services/bootstrapService';
import { bootstrapSuperAdminSchema } from '@/validators/auth';
import { successResponse, errorResponse } from '@/lib/errors';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function GET() {
  try {
    const initialized = await hasSuperAdmin();
    return successResponse({
      isInitialized: initialized,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = bootstrapSuperAdminSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid bootstrap payload';
      return errorResponse(msg, 400);
    }

    const superAdmin = await bootstrapSuperAdmin(validation.data);

    // Auto-login newly created Super Admin
    const token = signToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      role: superAdmin.role,
    });
    await setSessionCookie(token);

    return successResponse(
      { user: superAdmin },
      201,
      'Super Admin bootstrapped successfully. Store master control initialized.'
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
