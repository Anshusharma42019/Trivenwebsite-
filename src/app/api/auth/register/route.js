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
    const rawPhoneDigits = (phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhoneDigits.length >= 10 ? rawPhoneDigits.slice(-10) : null;
    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.toLowerCase().trim() : null;

    if (!cleanPhone && !cleanEmail) {
      return errorResponse('Please provide either a valid 10-digit mobile number or an email address to register.', 400);
    }

    if (phone && phone.trim() && !cleanPhone) {
      return errorResponse('Mobile number must be a valid 10-digit number.', 400);
    }

    if (email && email.trim() && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return errorResponse('Please enter a valid email address.', 400);
    }

    await connectDB();

    // Check uniqueness for phone if provided
    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return errorResponse('An account with this mobile number already exists. Please sign in.', 409);
      }
    }

    // Check uniqueness for email if provided
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return errorResponse('An account with this email address already exists. Please sign in.', 409);
      }
    }

    const hashedPassword = await hashPassword(password);

    // Only set fields that are actually provided so sparse unique MongoDB indexes work
    const userData = {
      name: name.trim(),
      password: hashedPassword,
      role: 'customer',
      status: 'active',
    };
    if (cleanPhone) {
      userData.phone = cleanPhone;
    }
    if (cleanEmail) {
      userData.email = cleanEmail;
    }

    const user = await User.create(userData);

    const token = signToken({
      userId: user._id,
      phone: user.phone || '',
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
