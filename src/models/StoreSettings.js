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
      default: 'Ayurveda Bhavan, Sector 12, Haridwar, Uttarakhand - 249401, India',
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
      default: 999, // Orders above ₹999 get free shipping
    },
    defaultShippingFee: {
      type: Number,
      default: 70, // Standard shipping charge
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    codFee: {
      type: Number,
      default: 40,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: '🌿 Authentic AYUSH Certified Formulations • Free Delivery on orders over ₹999' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
