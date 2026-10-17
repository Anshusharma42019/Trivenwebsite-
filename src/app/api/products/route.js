import { getProducts, clearProductCache } from '@/services/productService';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { productSchema } from '@/validators/product';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';
    const bestseller = searchParams.get('bestseller') === 'true';
    const status = searchParams.get('status') || 'published';

    const result = await getProducts({
      page,
      limit,
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sort,
      featured,
      bestseller,
      status: status === 'all' ? null : status,
    });

    const cacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
    };

    return successResponse(result, 200, 'Success', cacheHeaders);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.PRODUCTS_MANAGE)) {
      return errorResponse('Unauthorized: Missing product management permissions.', 403);
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid product payload';
      return errorResponse(msg, 400);
    }

    await connectDB();

    const data = validation.data;
    const slug = data.slug || `${generateSlug(data.name)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingSku = await Product.findOne({ sku: data.sku.toUpperCase() });
    if (existingSku) {
      return errorResponse(`Product with SKU "${data.sku}" already exists.`, 409);
    }

    const product = await Product.create({
      ...data,
      sku: data.sku.toUpperCase(),
      slug,
    });

    // Record initial stock movement if stock > 0
    if (product.stock > 0) {
      await StockMovement.create({
        product: product._id,
        sku: product.sku,
        type: 'purchase',
        quantityDelta: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial stock on creation',
        performedBy: user._id,
        userEmail: user.email,
      });
    }

    await logAuditEvent({
      userId: user._id,
      userEmail: user.email,
      action: 'PRODUCT_CREATE',
      entity: 'Product',
      entityId: product._id,
      details: { name: product.name, sku: product.sku },
    });

    clearProductCache();

    return successResponse(product, 201, 'Product created successfully.');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
