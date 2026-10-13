import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return successResponse(categories);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.CATEGORIES_MANAGE)) {
      return errorResponse('Unauthorized: Missing category management permissions.', 403);
    }

    const body = await request.json();
    if (!body.name) {
      return errorResponse('Category name is required', 400);
    }

    await connectDB();

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name: body.name,
      slug,
      description: body.description || '',
      image: body.image || '',
      parentCategory: body.parentCategory || null,
      sortOrder: body.sortOrder || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      seoTitle: body.seoTitle || body.name,
      seoDescription: body.seoDescription || body.description || '',
    });

    return successResponse(category, 201, 'Category created successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
