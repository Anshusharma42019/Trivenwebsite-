import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const filter = isAdmin ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return successResponse(banners);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.MARKETING_MANAGE)) {
      return errorResponse('Unauthorized to manage promotional banners', 403);
    }

    const body = await request.json();
    await connectDB();

    if (!body.title || !body.imageUrl) {
      return errorResponse('Banner title and image URL are required', 400);
    }

    const banner = await Banner.create({
      title: body.title,
      subtitle: body.subtitle || '',
      badge: body.badge || 'Authentic Ayurveda',
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl || '/products',
      ctaText: body.ctaText || 'Explore Remedy',
      isActive: body.isActive !== undefined ? body.isActive : true,
      sortOrder: Number(body.sortOrder || 0),
    });

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'BANNER_CREATED',
      entity: 'Banner',
      entityId: banner._id,
      details: { title: banner.title },
    });

    return successResponse(banner, 201, 'Banner created successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
