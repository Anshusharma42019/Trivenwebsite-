import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .refine((val) => /^[0-9]{10}$/.test(val.replace(/[^0-9]/g, '').slice(-10)), {
      message: 'Please enter a valid 10-digit mobile number',
    }),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  identifier: z.string().optional(),
  emailOrPhone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Staff passwords must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum([
    'admin',
    'product_manager',
    'inventory_manager',
    'order_manager',
    'customer_support',
    'marketing_manager',
    'accountant',
  ]),
  customPermissions: z.array(z.string()).optional(),
});

export const bootstrapSuperAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  bootstrapToken: z.string().min(6),
});
