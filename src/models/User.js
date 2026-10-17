import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'manager',
        'product_manager',
        'inventory_manager',
        'order_manager',
        'customer_support',
        'marketing_manager',
        'accountant',
        'customer',
      ],
      default: 'customer',
      index: true,
    },
    customPermissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
        type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    lastLoginAt: Date,
    customerNotes: [
      {
        note: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('validate', function (next) {
  if (!this.email || (typeof this.email === 'string' && !this.email.trim())) {
    this.email = undefined;
  }
  if (!this.phone || (typeof this.phone === 'string' && !this.phone.trim())) {
    this.phone = undefined;
  } else if (this.phone) {
    const digits = this.phone.replace(/[^0-9]/g, '');
    this.phone = digits.length >= 10 ? digits.slice(-10) : undefined;
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

