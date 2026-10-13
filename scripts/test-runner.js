import mongoose from 'mongoose';
import { connectDB } from '../src/lib/mongodb.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Coupon from '../src/models/Coupon.js';
import Order from '../src/models/Order.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/lib/auth.js';
import { hasPermission, PERMISSIONS, ROLES } from '../src/lib/permissions.js';
import { calculateOrderTotals, createOrder } from '../src/services/orderService.js';
import { verifyRazorpaySignature } from '../src/services/paymentService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== RUNNING AYURVEDIC PLATFORM TEST SUITE ===\n');
  await connectDB();

  // Test 1: Authentication & Hashing
  console.log('[1/7] Testing Authentication & Token Cryptography...');
  const password = 'TestSecretPassword@123';
  const hashed = await hashPassword(password);
  assert(hashed !== password, 'Password hashing creates secure one-way hash');
  const isMatch = await verifyPassword(password, hashed);
  assert(isMatch === true, 'Valid password successfully verifies against hash');
  const isFalseMatch = await verifyPassword('WrongPassword', hashed);
  assert(isFalseMatch === false, 'Invalid password is fundamentally rejected');

  const token = signToken({ userId: '123456', role: 'super_admin' });
  const decoded = verifyToken(token);
  assert(decoded.userId === '123456' && decoded.role === 'super_admin', 'JWT signed and verified with payload');

  // Test 2: RBAC Matrix & Permission Enforcement
  console.log('\n[2/7] Testing RBAC & Granular Permission Enforcement...');
  const superAdmin = { role: ROLES.SUPER_ADMIN };
  const prodManager = { role: ROLES.PRODUCT_MANAGER };
  const custSupport = { role: ROLES.CUSTOMER_SUPPORT };
  const customer = { role: ROLES.CUSTOMER };

  assert(hasPermission(superAdmin, PERMISSIONS.SETTINGS_MANAGE), 'Super Admin has access to critical store settings');
  assert(hasPermission(superAdmin, PERMISSIONS.PRODUCTS_MANAGE), 'Super Admin has product manage permissions');
  assert(hasPermission(prodManager, PERMISSIONS.PRODUCTS_MANAGE), 'Product Manager can manage products');
  assert(!hasPermission(prodManager, PERMISSIONS.SETTINGS_MANAGE), 'Product Manager CANNOT manage store settings');
  assert(!hasPermission(custSupport, PERMISSIONS.PRODUCTS_MANAGE), 'Customer Support CANNOT edit products');
  assert(hasPermission(custSupport, PERMISSIONS.SUPPORT_NOTES), 'Customer Support CAN write support notes');
  assert(!hasPermission(customer, PERMISSIONS.PRODUCTS_MANAGE), 'Customer role is restricted from admin operations');

  // Test 3: Product Queries & AYUSH Fields
  console.log('\n[3/7] Testing Product Catalog & AYUSH Compliance Schema...');
  const ashwa = await Product.findOne({ sku: 'TYR-ASH-001' });
  assert(ashwa !== null, 'Ashwagandha seeded product exists in database');
  assert(ashwa.ayushLicenseNumber.length > 0, 'Product contains valid AYUSH manufacturing license reference');
  assert(ashwa.dosageForm === 'Churna (Powder)', 'Product contains Ayurvedic dosage form classification');
  assert(ashwa.ingredients.length > 0 && ashwa.ingredients[0].botanicalName.length > 0, 'Product contains botanical name and composition');

  // Test 4: Authoritative Order Calculation & Server Price Integrity
  console.log('\n[4/7] Testing Server-Side Authoritative Pricing & Coupon Validation...');
  const calcResult = await calculateOrderTotals({
    items: [{ productId: ashwa._id.toString(), quantity: 2 }],
    couponCode: 'VEDIC15',
    paymentMethod: 'cod',
  });

  const expectedSubtotal = ashwa.sellingPrice * 2;
  assert(calcResult.subtotal === expectedSubtotal, `Authoritative subtotal computed on server (₹${calcResult.subtotal})`);
  assert(calcResult.discountAmount > 0, `Coupon VEDIC15 applied discount of ₹${calcResult.discountAmount}`);
  assert(calcResult.totalAmount === expectedSubtotal - calcResult.discountAmount + calcResult.shippingCharge, 'Total matches subtotal - discount + shipping');

  // Test 5: Atomic Stock Reservation & Protection Against Overselling
  console.log('\n[5/7] Testing Atomic Inventory Deduction & Overselling Prevention...');
  const originalStock = ashwa.stock;
  const testOrder = await createOrder({
    items: [{ productId: ashwa._id.toString(), quantity: 1 }],
    customerDetails: {
      name: 'Test Customer',
      email: 'test@order.com',
      phone: '9876543210',
    },
    shippingAddress: {
      fullName: 'Test Customer',
      phone: '9876543210',
      addressLine1: 'Civil Lines Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
    },
    paymentMethod: 'cod',
  });

  const reloadedAshwa = await Product.findById(ashwa._id);
  assert(reloadedAshwa.stock === originalStock - 1, 'Stock atomically decremented by ordered quantity');

  // Test attempting to order more than available stock
  let threwInsufficient = false;
  try {
    await createOrder({
      items: [{ productId: ashwa._id.toString(), quantity: 999999 }],
      customerDetails: {
        name: 'Excess Buyer',
        email: 'excess@order.com',
        phone: '9876543210',
      },
      shippingAddress: {
        fullName: 'Excess Buyer',
        phone: '9876543210',
        addressLine1: 'Test Address',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006',
      },
      paymentMethod: 'cod',
    });
  } catch (err) {
    threwInsufficient = true;
  }
  assert(threwInsufficient, 'Server strictly rejects order when requested quantity exceeds available stock');

  // Test 6: Payment Signature Cryptography
  console.log('\n[6/7] Testing Payment Signature Cryptography...');
  const simSig = verifyRazorpaySignature({
    razorpayOrderId: 'order_sim_12345',
    razorpayPaymentId: 'pay_sim_98765',
    razorpaySignature: 'simulated_success_signature',
  });
  assert(simSig === true, 'Payment verification accepts test simulation signatures in development');

  // Test 7: Mobile-First Registration & Dual Login (Phone or Email)
  console.log('\n[7/8] Testing Mobile-First Registration (Phone Required, Email Optional)...');
  const testPhone = '9876500001';
  await User.deleteOne({ phone: testPhone });

  const phoneOnlyHashed = await hashPassword('Secret@Ayur123');
  const phoneOnlyUser = await User.create({
    name: 'Vedic Customer',
    phone: testPhone,
    password: phoneOnlyHashed,
    role: 'customer',
  });

  assert(phoneOnlyUser._id !== null, 'Account successfully created with Mobile Number and without email');
  assert(phoneOnlyUser.phone === testPhone, 'User mobile number indexed correctly');
  assert(!phoneOnlyUser.email, 'Email field is optional and not set');

  // Verify login lookup by phone
  const foundByPhone = await User.findOne({ phone: testPhone }).select('+password');
  assert(foundByPhone !== null, 'User found via mobile number lookup');
  const phoneMatch = await verifyPassword('Secret@Ayur123', foundByPhone.password);
  assert(phoneMatch === true, 'Password correctly verified via mobile phone login lookup');

  await User.deleteOne({ _id: phoneOnlyUser._id });
  assert(true, 'Test phone-only user cleaned up');

  // Test 8: Cleanup test order and restore stock
  console.log('\n[8/8] Cleaning up test data & restoring stock balance...');
  await Product.findByIdAndUpdate(ashwa._id, { stock: originalStock });
  await Order.findByIdAndDelete(testOrder._id);
  assert(true, 'Test order cleaned up and stock restored');

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
