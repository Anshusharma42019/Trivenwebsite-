import { clearSessionCookie } from '@/lib/auth';
import { successResponse } from '@/lib/errors';

export async function POST() {
  await clearSessionCookie();
  return successResponse(null, 200, 'Logged out successfully.');
}
