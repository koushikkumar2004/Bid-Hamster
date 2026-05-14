const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [1, 'Bid amount must be at least 1'],
    },
    invoiceId: {
      type: String,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    isWinningBid: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bidSchema.index({ auctionId: 1, amount: -1 });
bidSchema.index({ bidder: 1 });

module.exports = mongoose.model('Bid', bidSchema);
