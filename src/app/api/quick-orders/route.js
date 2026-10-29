import { connectDB } from '@/lib/mongodb';
import QuickOrder from '@/models/QuickOrder';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, disease, productName, source, address, city, pincode } = body;

    // Validate 3 Core Fields: Name, Number, Bimari
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return errorResponse('कृपया अपना पूरा नाम दर्ज करें (Please enter your name)', 400);
    }

    if (!phone || typeof phone !== 'string') {
      return errorResponse('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें (Please enter your mobile number)', 400);
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    if (cleanPhone.length !== 10) {
      return errorResponse('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें (Valid 10-digit mobile required)', 400);
    }

    if (!disease || typeof disease !== 'string' || disease.trim().length < 2) {
      return errorResponse('कृपया अपनी बीमारी / समस्या का नाम चुनें या लिखें (Please specify health issue)', 400);
    }

    await connectDB();

    const quickOrder = await QuickOrder.create({
      name: name.trim(),
      phone: cleanPhone,
      disease: disease.trim(),
      productName: productName?.trim() || 'Direct COD Order / Consultation',
      paymentMethod: 'cod',
      source: source?.trim() || 'ad_campaign_quick_form',
      address: address?.trim() || '',
      city: city?.trim() || '',
      pincode: pincode?.trim() || '',
      status: 'new',
    });

    return successResponse(
      {
        orderId: quickOrder._id,
        name: quickOrder.name,
        phone: quickOrder.phone,
        disease: quickOrder.disease,
        paymentMethod: 'cod',
      },
      201,
      'आपका आर्डर / परामर्श अनुरोध सफलतापूर्वक दर्ज हो गया है!'
    );
  } catch (error) {
    console.error('Quick Order submission error:', error);
    return errorResponse(error.message || 'Failed to submit quick order', 500);
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === 'customer') {
      return errorResponse('Unauthorized access', 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { disease: { $regex: q, $options: 'i' } },
        { productName: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      QuickOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      QuickOrder.countDocuments(query),
    ]);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Fetch Quick Orders error:', error);
    return errorResponse(error.message || 'Failed to fetch quick orders', 500);
  }
}

