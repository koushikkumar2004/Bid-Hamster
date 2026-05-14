const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      enum: ['Cars', 'Electronics', 'Fashion', 'Sports', 'Art', 'Collectibles', 'Other'],
      required: [true, 'Category is required'],
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
      default: 'Good',
    },
    startingBid: {
      type: Number,
      required: [true, 'Starting bid is required'],
      min: [1, 'Starting bid must be at least 1'],
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    bidIncrement: {
      type: Number,
      default: 1,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      max: [10, 'Auction duration cannot exceed 10 minutes'],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'cancelled'],
      default: 'active',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // auto-approve for now
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Auto-update status based on endTime
auctionSchema.methods.checkAndUpdateStatus = function () {
  if (this.status === 'active' && new Date() > this.endTime) {
    this.status = 'ended';
    return this.save();
  }
  return Promise.resolve(this);
};

auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ seller: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
