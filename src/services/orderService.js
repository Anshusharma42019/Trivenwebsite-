import { connectDB } from '../lib/mongodb.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import StoreSettings from '../models/StoreSettings.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';

/**
 * Generates human-friendly sequential order number
 */
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AYUR-${year}-${random}`;
}

/**
 * Authoritatively calculates cart totals and validates stock on server
 */
export async function calculateOrderTotals({ items, couponCode, paymentMethod, userId = null, userEmail = null }) {
  await connectDB();

  let subtotal = 0;
  let taxAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found with ID: ${item.productId}`);
    }

    if (product.status !== 'published') {
      throw new Error(`Product "${product.name}" is currently unavailable for purchase.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
      );
    }

    const itemTotal = product.sellingPrice * item.quantity;
    subtotal += itemTotal;

    // Approximate GST embedded/applied based on product tax rate
    const taxPart = Math.round(itemTotal * (product.taxRatePercent / (100 + product.taxRatePercent)));
    taxAmount += taxPart;

    processedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      image: product.images && product.images[0] ? product.images[0] : '',
      quantity: item.quantity,
      unitPrice: product.sellingPrice,
      mrp: product.mrp,
      totalPrice: itemTotal,
    });
  }

  // Get Store settings
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = {
      freeShippingThreshold: 0,
      defaultShippingFee: 0,
      codFee: 0,
    };
  }

  // Shipping calculation
  let shippingCharge = subtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
  if (paymentMethod === 'cod' && settings.codFee) {
    shippingCharge += settings.codFee;
  }

  // Coupon validation & discount calculation
  let discountAmount = 0;
  let validCoupon = null;

  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      throw new Error(`Invalid or inactive coupon code: ${code}`);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      throw new Error(`Coupon code "${code}" has expired.`);
    }

    if (coupon.minCartValue && subtotal < coupon.minCartValue) {
      throw new Error(`Coupon requires a minimum cart value of ₹${coupon.minCartValue}.`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error(`Coupon "${code}" usage limit has been reached.`);
    }

    if (userEmail && coupon.perUserLimit) {
      const timesUsed = coupon.usedBy.filter((u) => u.email === userEmail).length;
      if (timesUsed >= coupon.perUserLimit) {
        throw new Error(`You have already reached the limit for coupon "${code}".`);
      }
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    validCoupon = coupon;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCharge);

  return {
    subtotal,
    discountAmount,
    couponCode: validCoupon ? validCoupon.code : null,
    validCoupon,
    shippingCharge,
    taxAmount,
    totalAmount,
    processedItems,
  };
}

/**
 * Places an order with atomic stock deduction
 */
export async function createOrder({
  items,
  customerDetails,
  shippingAddress,
  paymentMethod,
  couponCode = null,
  userId = null,
}) {
  await connectDB();

  // 1. Authoritative calculations & inventory pre-check
  const calculation = await calculateOrderTotals({
    items,
    couponCode,
    paymentMethod,
    userId,
    userEmail: customerDetails.email,
  });

  const orderNumber = generateOrderNumber();

  // 2. Atomic stock deduction with rollback safety
  const deductedProducts = [];
  try {
    for (const item of calculation.processedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Stock for "${item.name}" ran out just now. Please review your cart.`);
      }

      deductedProducts.push({
        productId: item.product,
        sku: item.sku,
        quantity: item.quantity,
        previousStock: updatedProduct.stock + item.quantity,
        newStock: updatedProduct.stock,
      });
    }
  } catch (stockError) {
    // Rollback any items that were already deducted
    for (const roll of deductedProducts) {
      await Product.findByIdAndUpdate(roll.productId, { $inc: { stock: roll.quantity } });
    }
    throw stockError;
  }

  // 3. Create Order document
  const order = new Order({
    orderNumber,
    user: userId || null,
    isGuest: !userId,
    customerDetails,
    shippingAddress,
    items: calculation.processedItems,
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    couponCode: calculation.couponCode,
    shippingCharge: calculation.shippingCharge,
    taxAmount: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    paymentStatus: 'pending',
    paymentMethod,
    statusHistory: [
      {
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        updatedAt: new Date(),
        updatedBy: 'System',
        note: `Order placed via ${paymentMethod.toUpperCase()}`,
      },
    ],
  });

  await order.save();

  // 4. Record stock movements
  for (const ded of deductedProducts) {
    await StockMovement.create({
      product: ded.productId,
      sku: ded.sku,
      type: 'sale',
      quantityDelta: -ded.quantity,
      previousStock: ded.previousStock,
      newStock: ded.newStock,
      reason: `Order ${orderNumber}`,
      referenceOrder: order._id,
      performedBy: userId || null,
      userEmail: customerDetails.email,
    });
  }

  // 5. Update coupon usage
  if (calculation.validCoupon) {
    await Coupon.findByIdAndUpdate(calculation.validCoupon._id, {
      $inc: { usedCount: 1 },
      $push: {
        usedBy: {
          user: userId || null,
          email: customerDetails.email,
          usedAt: new Date(),
          orderId: order._id,
        },
      },
    });
  }

  // 6. Automatically save shipping address to user's address book
  if (userId && shippingAddress && shippingAddress.addressLine1 && shippingAddress.pincode) {
    try {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        const addresses = userDoc.addresses || [];
        const isDuplicate = addresses.some(
          (a) =>
            a.pincode === shippingAddress.pincode &&
            a.addressLine1?.toLowerCase().trim() === shippingAddress.addressLine1?.toLowerCase().trim()
        );
        if (!isDuplicate) {
          addresses.push({
            fullName: shippingAddress.fullName || customerDetails.name,
            phone: shippingAddress.phone || customerDetails.phone,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            type: shippingAddress.addressType || 'home',
            isDefault: addresses.length === 0,
          });
          userDoc.addresses = addresses;
          await userDoc.save();
        }
      }
    } catch (saveAddrErr) {
      console.error('Failed to auto-save address to user book', saveAddrErr);
    }
  }

  return order;
}
