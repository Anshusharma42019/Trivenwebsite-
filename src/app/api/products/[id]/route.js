import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
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

    // Check SKU collision if SKU changed
    if (body.sku && body.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        sku: body.sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingSku) {
        return errorResponse(`Product with SKU "${body.sku}" already exists on another formulation.`, 409);
      }
      product.sku = body.sku.toUpperCase();
    }

    // Track stock change if stock is updated
    if (body.stock !== undefined && Number(body.stock) !== product.stock) {
      const newStock = Math.max(0, Number(body.stock));
      const delta = newStock - product.stock;
      await StockMovement.create({
        product: product._id,
        sku: product.sku,
        type: 'adjustment',
        quantityDelta: delta,
        previousStock: product.stock,
        newStock: newStock,
        reason: 'Manual stock update via product editor',
        performedBy: user._id,
        userEmail: user.email,
      });
      product.stock = newStock;
    }

    // Update all core fields cleanly
    if (body.name !== undefined) product.name = body.name.trim();
    if (body.category !== undefined && body.category) product.category = body.category;
    if (body.brand !== undefined) product.brand = body.brand || null;
    if (body.mrp !== undefined) product.mrp = Math.max(0, Number(body.mrp));
    if (body.sellingPrice !== undefined) product.sellingPrice = Math.max(0, Number(body.sellingPrice));
    if (body.lowStockThreshold !== undefined) product.lowStockThreshold = Math.max(1, Number(body.lowStockThreshold));
    if (body.dosageForm !== undefined) product.dosageForm = body.dosageForm;
    if (body.netQuantity !== undefined) product.netQuantity = body.netQuantity;
    if (body.description !== undefined) product.description = body.description;
    if (body.shortDescription !== undefined) product.shortDescription = body.shortDescription;
    if (body.images !== undefined) product.images = Array.isArray(body.images) ? body.images : [];
    if (body.ayushLicenseNumber !== undefined) product.ayushLicenseNumber = body.ayushLicenseNumber;
    if (body.batchNumber !== undefined) product.batchNumber = body.batchNumber;
    if (body.ingredients !== undefined) product.ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    if (body.usageInstructions !== undefined) product.usageInstructions = body.usageInstructions;
    if (body.warnings !== undefined) product.warnings = body.warnings;
    if (body.isFeatured !== undefined) product.isFeatured = Boolean(body.isFeatured);
    if (body.isBestseller !== undefined) product.isBestseller = Boolean(body.isBestseller);
    if (body.status !== undefined) product.status = body.status;

    await product.save();

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'PRODUCT_UPDATE',
      entity: 'Product',
      entityId: product._id,
      details: {
        productName: product.name,
        sku: product.sku,
        updatedFields: Object.keys(body),
      },
    });

    return successResponse(product, 200, 'Product formulation updated successfully.');
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
      return errorResponse('Product not found in database', 404);
    }

    const deletedName = product.name;
    const deletedSku = product.sku;

    // Permanently delete product from MongoDB
    await Product.findByIdAndDelete(id);

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'PRODUCT_DELETE_PERMANENT',
      entity: 'Product',
      entityId: id,
      details: {
        productName: deletedName,
        sku: deletedSku,
        deletedBy: user.email,
      },
    });

    return successResponse(
      null,
      200,
      `Product "${deletedName}" has been permanently deleted from database and website.`
    );
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
