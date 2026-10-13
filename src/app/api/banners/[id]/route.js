import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const banner = await Banner.findById(id).lean();
    if (!banner) {
      return errorResponse('Banner not found', 404);
    }
    return successResponse(banner);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.MARKETING_MANAGE)) {
      return errorResponse('Unauthorized to update banners', 403);
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const banner = await Banner.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!banner) {
      return errorResponse('Banner not found', 404);
    }

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'BANNER_UPDATED',
      entity: 'Banner',
      entityId: banner._id,
      details: { title: banner.title, isActive: banner.isActive },
    });

    return successResponse(banner, 200, 'Banner updated successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.MARKETING_MANAGE)) {
      return errorResponse('Unauthorized to delete banners', 403);
    }

    const { id } = await params;
    await connectDB();

    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return errorResponse('Banner not found', 404);
    }

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'BANNER_DELETED',
      entity: 'Banner',
      entityId: banner._id,
      details: { title: banner.title },
    });

    return successResponse(null, 200, 'Banner deleted successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
