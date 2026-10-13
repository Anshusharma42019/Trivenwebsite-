import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET() {
  try {
    await connectDB();
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    return successResponse(settings);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasPermission(user, PERMISSIONS.SETTINGS_MANAGE) && user.role !== ROLES.SUPER_ADMIN)) {
      return errorResponse('Unauthorized: Only Super Admin can change critical store settings.', 403);
    }

    const body = await request.json();
    await connectDB();

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'STORE_SETTINGS_UPDATE',
      entity: 'StoreSettings',
      entityId: settings._id,
      details: { updatedKeys: Object.keys(body) },
    });

    return successResponse(settings, 200, 'Settings saved successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
