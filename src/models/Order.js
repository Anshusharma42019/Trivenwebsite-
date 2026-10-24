import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true, // authoritative price at time of purchase
  },
  mrp: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, default: '' },
      phone: { type: String, required: true },
    },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
      addressType: { type: String, default: 'home' },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    // Financial Breakdown (authoritatively calculated on server)
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Workflow State Machine
    status: {
      type: String,
      enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay'],
      default: 'cod',
    },
    // Payment references
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
      failureReason: String,
    },
    // Meta (Facebook) Ads Conversion Tracking
    metaPurchaseTracked: {
      type: Boolean,
      default: false,
    },
    metaPurchaseTrackedAt: {
      type: Date,
      default: null,
    },
    // Logistics & Shipping
    shipmentDetails: {
      carrier: { type: String, default: 'Standard Express' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      shippedAt: Date,
      deliveredAt: Date,
      estimatedDelivery: Date,
    },
    // History & Status transitions
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: String,
        note: String,
      },
    ],
    // Cancellation & Return
    cancellationDetails: {
      reason: String,
      requestedAt: Date,
      approvedAt: Date,
      status: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
    },
    notes: [
      {
        note: String,
        addedBy: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
