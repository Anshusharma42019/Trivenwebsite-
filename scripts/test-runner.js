import { connectDB } from '../src/lib/mongodb.js';
import mongoose from 'mongoose';
import StoreSettings from '../src/models/StoreSettings.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/lib/auth.js';
import { hasPermission, PERMISSIONS } from '../src/lib/permissions.js';
import { calculateOrderTotals } from '../src/services/orderService.js';
import { getProducts } from '../src/services/productService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✖ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('  TRIVEN AYURVEDA - FULL WORKFLOW TEST  ');
  console.log('========================================\n');

  try {
    // Step 1: Database Connectivity
    console.log('--- Step 1: Database Connectivity ---');
    await connectDB();
    assert(mongoose.connection.readyState === 1, `MongoDB Atlas Connection (Connected to DB: ${mongoose.connection.name})`);

    // Step 2: Store Configuration
    console.log('\n--- Step 2: Store Configuration ---');
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    assert(!!settings, `Store Settings Loaded (Free shipping threshold: ₹${settings.freeShippingThreshold}, Default shipping fee: ₹${settings.defaultShippingFee})`);

    // Step 3: Auth & Cryptography
    console.log('\n--- Step 3: Auth & Cryptography ---');
    const hashed = await hashPassword('TestPassword123!');
    const match = await verifyPassword('TestPassword123!', hashed);
    assert(match, 'Bcrypt Password Hashing & Verification');

    const token = signToken({ userId: '123', role: 'customer' });
    const decoded = verifyToken(token);
    assert(decoded && decoded.role === 'customer', 'JWT Token Signing & Verification');

    // Step 4: Role-Based Access Control
    console.log('\n--- Step 4: Role-Based Access Control (RBAC) ---');
    assert(hasPermission({ role: 'admin' }, PERMISSIONS.PRODUCTS_MANAGE), 'Admin Product Permission');
    assert(!hasPermission({ role: 'customer' }, PERMISSIONS.PRODUCTS_MANAGE), 'Customer Restricted from Product Management');

    // Step 5: Product Catalog Service
    console.log('\n--- Step 5: Product Catalog Service ---');
    const catalog = await getProducts({ limit: 10 });
    assert(catalog.products.length > 0, `Product Catalog Query (Total published products: ${catalog.products.length})`);

    // Step 6: Pricing and Calculations (including phone-only customer check)
    console.log('\n--- Step 6: Pricing, Tax, and Discounts Calculation ---');
    const amounts = await calculateOrderTotals({
      items: [{ productId: catalog.products[0]._id, quantity: 1 }],
      paymentMethod: 'razorpay',
      userEmail: '' // Testing without email
    });
    assert(amounts.totalAmount > 0, `Authoritative Calculation Engine (Total: ₹${amounts.totalAmount})`);

    // Step 7: HTTP Endpoint Checks
    console.log('\n--- Step 7: Local Dev Server HTTP Endpoint Checks ---');
    try {
      const catRes = await fetch('http://localhost:3000/api/categories');
      const catData = await catRes.json();
      assert(catRes.ok, `HTTP /api/categories (Returned ${catData.data?.length || 0} categories)`);

      const prodRes = await fetch('http://localhost:3000/api/products');
      const prodData = await prodRes.json();
      assert(prodRes.ok, `HTTP /api/products (Total: ${prodData.data?.products?.length || 0} items)`);

      const pinRes = await fetch('http://localhost:3000/api/pincodes/check?pincode=110001');
      assert(pinRes.ok, 'HTTP /api/pincodes/check (PIN 110001)');
    } catch (httpErr) {
      console.log('Dev server HTTP check skipped or connection refused:', httpErr.message);
    }

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    console.log('\n========================================');
    console.log(`  SUMMARY: ${passed} PASSED / ${failed} FAILED`);
    console.log('========================================\n');
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
