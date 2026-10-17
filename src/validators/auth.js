import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z
      .string()
      .optional()
      .or(z.literal(''))
      .nullable(),
    email: z
      .string()
      .optional()
      .or(z.literal(''))
      .nullable(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(
    (data) => {
      const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const cleanEmail = (data.email || '').trim();
      const hasPhone = cleanPhone.length === 10;
      const hasEmail = cleanEmail.length > 0 && /^\S+@\S+\.\S+$/.test(cleanEmail);
      return hasPhone || hasEmail;
    },
    {
      message: 'Please provide either a valid 10-digit mobile number or an email address to register.',
      path: ['phone'],
    }
  );

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
    'super_admin',
    'admin',
    'manager',
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
