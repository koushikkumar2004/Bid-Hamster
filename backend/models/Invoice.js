const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    pdfPublicId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1 });
invoiceSchema.index({ auction: 1 });
invoiceSchema.index({ invoiceId: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
