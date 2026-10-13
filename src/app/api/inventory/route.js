import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import { stockAdjustmentSchema } from '@/validators/product';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.INVENTORY_VIEW)) {
      return errorResponse('Unauthorized: Missing inventory viewing permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'low_stock', 'out_of_stock', 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    await connectDB();

    const query = { status: { $ne: 'archived' } };
    if (filter === 'low_stock') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    } else if (filter === 'out_of_stock') {
      query.stock = 0;
    }

    const [products, movements] = await Promise.all([
      Product.find(query)
        .select('name sku stock lowStockThreshold mrp sellingPrice expiryDate batchNumber status')
        .sort({ stock: 1 })
        .limit(limit)
        .lean(),
      StockMovement.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const totalProducts = await Product.countDocuments({ status: { $ne: 'archived' } });
    const outOfStockCount = await Product.countDocuments({ stock: 0, status: { $ne: 'archived' } });
    const lowStockCount = await Product.countDocuments({
      $expr: { $and: [{ $lte: ['$stock', '$lowStockThreshold'] }, { $gt: ['$stock', 0] }] },
      status: { $ne: 'archived' },
    });

    return successResponse({
      products,
      movements,
      stats: {
        totalProducts,
        outOfStockCount,
        lowStockCount,
      },
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.INVENTORY_ADJUST)) {
      return errorResponse('Unauthorized: Missing inventory adjustment permissions.', 403);
    }

    const body = await request.json();
    const validation = stockAdjustmentSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid adjustment data';
      return errorResponse(msg, 400);
    }

    const { sku, quantityDelta, reason, type, batchNumber } = validation.data;

    await connectDB();
    const product = await Product.findOne({ sku: sku.toUpperCase() });

    if (!product) {
      return errorResponse(`Product with SKU ${sku} not found`, 404);
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantityDelta;

    if (newStock < 0) {
      return errorResponse(`Adjustment would result in negative stock (${newStock}). Current: ${previousStock}`, 400);
    }

    product.stock = newStock;
    if (batchNumber) {
      product.batchNumber = batchNumber;
    }
    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      sku: product.sku,
      type,
      quantityDelta,
      previousStock,
      newStock,
      batchNumber: batchNumber || product.batchNumber || '',
      reason,
      performedBy: user._id,
      userEmail: user.email,
    });

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'STOCK_ADJUSTMENT',
      entity: 'Product',
      entityId: product._id,
      details: { sku: product.sku, delta: quantityDelta, reason, previousStock, newStock },
    });

    return successResponse(
      {
        product,
        movement,
      },
      200,
      'Stock adjusted and audited successfully.'
    );
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
