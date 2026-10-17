/**
 * Role-Based Access Control (RBAC) System
 * Defines granular permissions and assigns default permissions to roles.
 */

export const PERMISSIONS = {
  // Products & Catalog
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_MANAGE: 'products:manage',
  CATEGORIES_MANAGE: 'categories:manage',
  BRANDS_MANAGE: 'brands:manage',

  // Inventory & Batches
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',

  // Orders & Fulfillment
  ORDERS_VIEW: 'orders:view',
  ORDERS_MANAGE: 'orders:manage',
  ORDERS_FULFILL: 'orders:fulfill',
  REFUNDS_MANAGE: 'refunds:manage',

  // Customers & Support
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_MANAGE: 'customers:manage',
  SUPPORT_NOTES: 'support:notes',

  // Marketing & CMS
  MARKETING_MANAGE: 'marketing:manage', // Coupons, Banners, SEO, CMS
  REVIEWS_MANAGE: 'reviews:manage',

  // Financials & Reports
  REPORTS_VIEW: 'reports:view',
  FINANCE_VIEW: 'finance:view',

  // Staff & Settings
  STAFF_MANAGE: 'staff:manage',
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_LOGS_VIEW: 'audit_logs:view',
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  PRODUCT_MANAGER: 'product_manager',
  INVENTORY_MANAGER: 'inventory_manager',
  ORDER_MANAGER: 'order_manager',
  CUSTOMER_SUPPORT: 'customer_support',
  MARKETING_MANAGER: 'marketing_manager',
  ACCOUNTANT: 'accountant',
  CUSTOMER: 'customer',
};

const MANAGER_PERMISSIONS = [
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.PRODUCTS_MANAGE,
  PERMISSIONS.CATEGORIES_MANAGE,
  PERMISSIONS.BRANDS_MANAGE,
  PERMISSIONS.INVENTORY_VIEW,
  PERMISSIONS.INVENTORY_ADJUST,
  PERMISSIONS.MARKETING_MANAGE,
  PERMISSIONS.REVIEWS_MANAGE,
  PERMISSIONS.REPORTS_VIEW,
  PERMISSIONS.FINANCE_VIEW,
  PERMISSIONS.ORDERS_VIEW,
  PERMISSIONS.ORDERS_MANAGE,
  PERMISSIONS.ORDERS_FULFILL,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.SUPPORT_NOTES,
];

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ADMIN]: MANAGER_PERMISSIONS,

  [ROLES.MANAGER]: MANAGER_PERMISSIONS,

  [ROLES.PRODUCT_MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.BRANDS_MANAGE,
    PERMISSIONS.REVIEWS_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
  ],

  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.ORDERS_VIEW,
  ],

  [ROLES.ORDER_MANAGER]: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.ORDERS_FULFILL,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.SUPPORT_NOTES,
    PERMISSIONS.REFUNDS_MANAGE,
  ],

  [ROLES.CUSTOMER_SUPPORT]: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.SUPPORT_NOTES,
    PERMISSIONS.REVIEWS_MANAGE,
  ],

  [ROLES.MARKETING_MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.MARKETING_MANAGE,
    PERMISSIONS.REVIEWS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REFUNDS_MANAGE,
  ],

  [ROLES.CUSTOMER]: [],
};

/**
 * Checks if a user has a specific permission.
 * Super Admin always has full access.
 */
export function hasPermission(user, requiredPermission) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  // Custom user permissions override / augment role permissions
  const effectivePermissions = new Set([
    ...(ROLE_PERMISSIONS[user.role] || []),
    ...(user.customPermissions || []),
  ]);

  return effectivePermissions.has(requiredPermission);
}

/**
 * Checks if user is authorized for any staff administration
 */
export function isStaff(user) {
  if (!user) return false;
  return user.role && user.role !== ROLES.CUSTOMER;
}
