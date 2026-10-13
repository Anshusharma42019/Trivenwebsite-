import mongoose from 'mongoose';

const StockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'adjustment', 'damaged', 'expired'],
      required: true,
      index: true,
    },
    quantityDelta: {
      type: Number,
      required: true, // positive for additions, negative for deductions
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    batchNumber: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
    },
    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.StockMovement || mongoose.model('StockMovement', StockMovementSchema);
