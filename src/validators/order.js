import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Cart cannot be empty'),
  customerDetails: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  }),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Phone is required'),
    addressLine1: z.string().min(5, 'Street address is required'),
    addressLine2: z.string().optional().default(''),
    landmark: z.string().optional().default(''),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
    country: z.string().default('India'),
    addressType: z.string().optional().default('home'),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional()
      .nullable(),
  }),
  paymentMethod: z.enum(['cod', 'razorpay']),
  couponCode: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});
