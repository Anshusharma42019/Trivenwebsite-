import { connectDB } from '../lib/mongodb.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';

export async function getProducts({
  page = 1,
  limit = 12,
  category = null,
  brand = null,
  search = null,
  minPrice = null,
  maxPrice = null,
  sort = 'newest',
  featured = null,
  bestseller = null,
  status = 'published',
  includeOutOfStock = true,
}) {
  await connectDB();

  const query = {};

  if (status) {
    query.status = status;
  }

  if (category) {
    // If category is slug or ObjectId
    let catDoc = null;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }
  }

  if (brand) {
    let brandDoc = null;
    if (brand.match(/^[0-9a-fA-F]{24}$/)) {
      query.brand = brand;
    } else {
      brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) {
        query.brand = brandDoc._id;
      }
    }
  }

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { sku: { $regex: search.trim(), $options: 'i' } },
      { 'ingredients.name': { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (minPrice !== null || maxPrice !== null) {
    query.sellingPrice = {};
    if (minPrice !== null) query.sellingPrice.$gte = Number(minPrice);
    if (maxPrice !== null) query.sellingPrice.$lte = Number(maxPrice);
  }

  if (featured === true) {
    query.isFeatured = true;
  }

  if (bestseller === true) {
    query.isBestseller = true;
  }

  if (!includeOutOfStock) {
    query.stock = { $gt: 0 };
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { sellingPrice: 1 };
  if (sort === 'price_desc') sortOption = { sellingPrice: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'bestseller') sortOption = { isBestseller: -1, rating: -1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return JSON.parse(JSON.stringify({
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  }));
}

export async function getProductBySlug(slug) {
  await connectDB();
  const product = await Product.findOne({ slug })
    .populate('category', 'name slug')
    .populate('brand', 'name slug manufacturerDetails')
    .lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export async function getProductById(id) {
  await connectDB();
  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}
