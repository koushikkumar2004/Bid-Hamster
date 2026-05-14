const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'You must be at least 18 years old'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      default: '',
      trim: true,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpire: Date,
    passwordResetCode: String,
    passwordResetExpire: Date,
    walletBalance: {
      type: Number,
      default: 0,
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
