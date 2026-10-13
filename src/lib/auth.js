import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './mongodb.js';
import User from '../models/User.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ayurvedic_super_secure_jwt_secret_fallback_key';
const TOKEN_NAME = 'ayur_session_token';
const EXPIRY_DAYS = parseInt(process.env.SESSION_EXPIRY_DAYS || '7', 10);

/**
 * Hash plain text password using bcrypt
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Verify plain text password against hash
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Create a signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: `${EXPIRY_DAYS}d`,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, AUTH_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Dynamically import Next.js cookies API inside request context
 */
async function getCookieStore() {
  try {
    const { cookies } = await import('next/headers');
    return await cookies();
  } catch (e) {
    return null;
  }
}

/**
 * Set session cookie in response headers
 */
export async function setSessionCookie(token) {
  const cookieStore = await getCookieStore();
  if (cookieStore) {
    cookieStore.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EXPIRY_DAYS * 24 * 60 * 60,
    });
  }
}

/**
 * Remove session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await getCookieStore();
  if (cookieStore) {
    cookieStore.delete(TOKEN_NAME);
  }
}

/**
 * Get currently authenticated user from cookie
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await getCookieStore();
    if (!cookieStore) return null;

    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.status === 'suspended') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export { TOKEN_NAME };
