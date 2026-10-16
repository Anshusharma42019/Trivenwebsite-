import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Triven Ayurveda',
    },
    tagline: {
      type: String,
      default: 'Pure Vedic Formulations for Modern Wellness',
    },
    supportEmail: {
      type: String,
      default: 'support@trivenayurveda.com',
    },
    supportPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      default: 'Triven Ayurveda Bhavan, Sector 12, New Delhi - 110001, India',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    freeShippingThreshold: {
      type: Number,
      default: 0, // 0 = 100% Free Shipping on all orders
    },
    defaultShippingFee: {
      type: Number,
      default: 0, // Free delivery
    },
    codEnabled: {
      type: Boolean,
      default: false, // Cash on delivery disabled by default
    },
    codFee: {
      type: Number,
      default: 0, // Zero extra COD charge
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'Authentic AYUSH Certified Formulations • Free Doorstep Delivery on All Orders' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
