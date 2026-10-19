import mongoose from 'mongoose';
import { AYURVEDIC_DOSAGE_FORMS } from '../lib/constants.js';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category'],
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: 300,
    },
    images: {
      type: [String],
      default: [],
    },
    // Pricing & Tax (INR)
    mrp: {
      type: Number,
      required: [true, 'Please provide MRP'],
      min: [0, 'MRP must be positive'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide selling price'],
      min: [0, 'Selling price must be positive'],
    },
    taxRatePercent: {
      type: Number,
      default: 12, // Standard Ayurvedic GST rate (5% or 12%)
    },
    // Stock & Inventory
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    // Ayurvedic Attributes & Specs
    dosageForm: {
      type: String,
      trim: true,
      default: 'Churna (Powder)',
    },
    netQuantity: {
      type: String,
      default: '100g', // e.g. "60 Capsules", "200ml", "100g"
    },
    ingredients: [
      {
        name: { type: String, required: true },
        botanicalName: { type: String, default: '' },
        percentage: { type: String, default: '' },
        benefits: { type: String, default: '' },
      },
    ],
    usageInstructions: {
      type: String,
      default: 'As directed by an Ayurvedic physician.',
    },
    warnings: {
      type: String,
      default: 'Store in a cool dry place away from direct sunlight. Keep out of reach of children.',
    },
    storageInstructions: {
      type: String,
      default: 'Store in a cool, dry place. Keep lid tightly closed after each use.',
    },
    // Regulatory & AYUSH Compliance
    ayushLicenseNumber: {
      type: String,
      default: '',
    },
    batchNumber: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    manufacturingDate: {
      type: Date,
    },
    // Badges & Status
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    // Ratings & Reviews
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    // SEO
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
  },
  {
    timestamps: true,
  }
);

// Compound text search index for fast product search
ProductSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  'ingredients.name': 'text',
  sku: 'text',
});

// Fast filtering indexes
ProductSchema.index({ category: 1, status: 1, sellingPrice: 1 });
ProductSchema.index({ status: 1, isFeatured: 1 });
ProductSchema.index({ status: 1, isBestseller: 1 });

// Allow fresh compilation when schema updates in dev environment
if (mongoose.models && mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
