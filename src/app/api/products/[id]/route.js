import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category brand').lean();
    } else {
      product = await Product.findOne({ slug: id }).populate('category brand').lean();
    }

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.PRODUCTS_MANAGE)) {
      return errorResponse('Unauthorized: Missing product management permissions.', 403);
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Update allowable fields
    Object.assign(product, body);
    await product.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'PRODUCT_UPDATE',
      entity: 'Product',
      entityId: product._id,
      details: { updatedFields: Object.keys(body) },
    });

    return successResponse(product, 200, 'Product updated successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.PRODUCTS_MANAGE)) {
      return errorResponse('Unauthorized: Missing product management permissions.', 403);
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Soft-archive product instead of destructive deletion to preserve order history
    product.status = 'archived';
    await product.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'PRODUCT_ARCHIVE',
      entity: 'Product',
      entityId: product._id,
    });

    return successResponse(null, 200, 'Product safely archived.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
