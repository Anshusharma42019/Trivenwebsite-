import { connectDB } from '../lib/mongodb.js';
import User from '../models/User.js';
import { hashPassword } from '../lib/auth.js';
import { logAuditEvent } from '../lib/logger.js';
import { ROLES } from '../lib/permissions.js';

export async function bootstrapSuperAdmin({ name, email, password, bootstrapToken }) {
  await connectDB();

  const serverToken = process.env.ADMIN_BOOTSTRAP_TOKEN || 'ayur-admin-setup-secret-2026';

  if (!bootstrapToken || bootstrapToken !== serverToken) {
    throw new Error('Invalid bootstrap authorization token.');
  }

  const existingSuperAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existingSuperAdmin) {
    throw new Error('Super Admin already exists. For security, bootstrap can only be executed once.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  const hashedPassword = await hashPassword(password);

  const superAdmin = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: ROLES.SUPER_ADMIN,
    status: 'active',
  });

  await logAuditEvent({
    userId: superAdmin._id,
    userEmail: superAdmin.email,
    action: 'BOOTSTRAP_SUPER_ADMIN',
    entity: 'User',
    entityId: superAdmin._id,
    details: { message: 'First Super Admin initialized via secure bootstrap' },
  });

  return {
    id: superAdmin._id,
    name: superAdmin.name,
    email: superAdmin.email,
    role: superAdmin.role,
  };
}

export async function hasSuperAdmin() {
  await connectDB();
  const count = await User.countDocuments({ role: ROLES.SUPER_ADMIN });
  return count > 0;
}
