import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/validators/auth';
import { successResponse, errorResponse } from '@/lib/errors';
import { logAuditEvent } from '@/lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Invalid email or password format', 400);
    }

    const identifier = (
      body.identifier ||
      body.emailOrPhone ||
      body.email ||
      body.phone ||
      ''
    ).trim();
    const { password } = body;

    if (!identifier || !password) {
      return errorResponse('Please provide your mobile number or email and password', 400);
    }

    await connectDB();

    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      user = await User.findOne({ email: identifier.toLowerCase().trim() }).select('+password');
    } else {
      const cleanDigits = identifier.replace(/[^0-9]/g, '');
      const tenDigit = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
      user = await User.findOne({
        $or: [
          { phone: tenDigit },
          { phone: identifier },
          { email: identifier.toLowerCase().trim() },
        ],
      }).select('+password');
    }

    if (!user) {
      return errorResponse('Invalid mobile number/email or password.', 401);
    }

    if (user.status === 'suspended') {
      return errorResponse('Your account has been suspended. Please contact customer support.', 403);
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid mobile number/email or password.', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const normalizedRole = (user.role || 'customer').toLowerCase();

    const token = signToken({
      userId: user._id,
      phone: user.phone || '',
      email: user.email || '',
      role: normalizedRole,
    });

    await setSessionCookie(token);

    if (user.role !== 'customer') {
      await logAuditEvent({
        userId: user._id,
        userEmail: user.email || user.phone || 'staff',
        action: 'STAFF_LOGIN',
        entity: 'User',
        entityId: user._id,
      });
    }

    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone || '',
          email: user.email || '',
          role: user.role,
        },
      },
      200,
      'Logged in successfully.'
    );
  } catch (error) {
    return errorResponse(error.message || 'Login failed', 500);
  }
}
