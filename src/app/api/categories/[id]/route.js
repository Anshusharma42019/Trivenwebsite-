import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.CATEGORIES_MANAGE)) {
      return errorResponse('Unauthorized: Missing category management permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const category = await Category.findByIdAndUpdate(id, body, { new: true });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse(category, 200, 'Category updated successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.CATEGORIES_MANAGE)) {
      return errorResponse('Unauthorized: Missing category management permissions.', 403);
    }

    const { id } = await params;
    await connectDB();

    // Prevent deletion if products reference this category (Section 4.C)
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return errorResponse(
        `Cannot delete category: ${productCount} products are currently assigned to it. Archive or reassign them first.`,
        400
      );
    }

    await Category.findByIdAndDelete(id);
    return successResponse(null, 200, 'Category deleted successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
