import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minCartValue: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  startDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
});
