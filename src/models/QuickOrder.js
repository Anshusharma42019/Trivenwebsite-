import mongoose from 'mongoose';

const QuickOrderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    disease: {
      type: String,
      required: [true, 'Bimari / health issue is required'],
      trim: true,
    },
    productName: {
      type: String,
      default: 'General Formulation / Direct COD Consultation',
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: 'cod', // Cash on Delivery
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      default: 'ad_campaign_quick_form',
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

QuickOrderSchema.index({ createdAt: -1 });

export default mongoose.models.QuickOrder || mongoose.model('QuickOrder', QuickOrderSchema);

