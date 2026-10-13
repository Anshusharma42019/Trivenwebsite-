import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    await connectDB();
    const reviews = await Review.find({ product: productId, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return successResponse(reviews);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('You must be logged in to post a review', 401);
    }

    const { productId, rating, title, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return errorResponse('Product ID, rating (1-5), and comment are required', 400);
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const review = await Review.create({
      product: productId,
      user: user._id,
      customerName: user.name,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: true,
      status: 'approved',
    });

    // Update aggregate rating on product
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    product.numReviews = allReviews.length;
    await product.save();

    return successResponse(review, 201, 'Review submitted successfully');
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
