const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'NetBanking', 'Card', 'BankTransfer'],
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentGateway: {
    type: String,
    default: 'MockGateway',
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
