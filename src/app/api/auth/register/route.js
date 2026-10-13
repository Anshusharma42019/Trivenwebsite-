import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/validators/auth';
import { successResponse, errorResponse } from '@/lib/errors';

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid input data';
      return errorResponse(firstError, 400);
    }

    const { name, email, password, phone } = validation.data;
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return errorResponse('Please provide a valid 10-digit Indian mobile number.', 400);
    }

    await connectDB();

    // Check if an account already exists with this mobile number
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return errorResponse('An account with this mobile number already exists. Please sign in.', 409);
    }

    // Check email uniqueness only if an email was provided
    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.toLowerCase().trim() : undefined;
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return errorResponse('An account with this email address already exists.', 409);
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      status: 'active',
    });

    const token = signToken({
      userId: user._id,
      phone: user.phone,
      email: user.email || '',
      role: user.role,
    });

    await setSessionCookie(token);

    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          role: user.role,
        },
      },
      201,
      'Account created successfully.'
    );
  } catch (error) {
    return errorResponse(error.message || 'Registration failed', 500);
  }
}
