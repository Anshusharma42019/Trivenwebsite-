import { connectDB } from '@/lib/mongodb';
import Brand from '@/models/Brand';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { successResponse, errorResponse } from '@/lib/errors';

let cachedBrands = null;
let cachedBrandsTime = 0;
const BRANDS_TTL = 120 * 1000;
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=86400' };

export async function GET() {
  try {
    if (cachedBrands && Date.now() - cachedBrandsTime < BRANDS_TTL) {
      return successResponse(cachedBrands, 200, 'Success', CACHE_HEADERS);
    }

    await connectDB();
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
    cachedBrands = brands;
    cachedBrandsTime = Date.now();

    return successResponse(brands, 200, 'Success', CACHE_HEADERS);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, PERMISSIONS.BRANDS_MANAGE)) {
      return errorResponse('Unauthorized: Missing brand management permissions.', 403);
    }

    const body = await request.json();
    if (!body.name) {
      return errorResponse('Brand name is required', 400);
    }

    await connectDB();

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await Brand.create({
      name: body.name,
      slug,
      description: body.description || '',
      logo: body.logo || '',
      manufacturerDetails: body.manufacturerDetails || {},
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return successResponse(brand, 201, 'Brand created successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
