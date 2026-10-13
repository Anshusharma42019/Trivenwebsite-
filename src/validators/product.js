import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  slug: z.string().optional(),
  sku: z.string().min(2, 'SKU is required').max(50),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  images: z.array(z.string()).default([]),
  mrp: z.number().positive('MRP must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  taxRatePercent: z.number().nonnegative().default(12),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  dosageForm: z.string().optional(),
  netQuantity: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        botanicalName: z.string().optional(),
        percentage: z.string().optional(),
        benefits: z.string().optional(),
      })
    )
    .optional(),
  usageInstructions: z.string().optional(),
  warnings: z.string().optional(),
  storageInstructions: z.string().optional(),
  ayushLicenseNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  manufacturingDate: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  sku: z.string().min(1),
  quantityDelta: z.number().int(),
  reason: z.string().min(3, 'A clear reason for stock adjustment is required'),
  type: z.enum(['purchase', 'adjustment', 'damaged', 'expired', 'return']),
  batchNumber: z.string().optional(),
});
