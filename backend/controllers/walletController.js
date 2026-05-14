const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendDepositSuccessEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

exports.deposit = async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    
    // Validate minimum (e.g. 500 INR, or approx 6 USD equivalent)
    if (amount < 6 && currency !== 'INR') return res.status(400).json({ success: false, message: 'Minimum deposit equivalent to ₹500 required.' });
    if (amount < 500 && currency === 'INR') return res.status(400).json({ success: false, message: 'Minimum deposit is ₹500.' });

    const transactionId = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      currency,
      paymentMethod,
      transactionId,
      status: 'Pending',
    });

    res.json({ success: true, transactionId: transaction.transactionId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const transaction = await Transaction.findOne({ transactionId, userId: req.user._id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    if (transaction.status === 'Success') return res.status(400).json({ success: false, message: 'Transaction already processed.' });

    transaction.status = status === 'Success' ? 'Success' : 'Failed';
    await transaction.save();

    if (status === 'Success') {
      const user = await User.findById(req.user._id);
      
      user.walletBalance += transaction.amount;
      await user.save();

      // Send email
      if (sendDepositSuccessEmail) {
        await sendDepositSuccessEmail(user.email, {
          name: user.name,
          amount: transaction.amount,
          currency: transaction.currency,
          paymentMethod: transaction.paymentMethod,
          transactionId: transaction.transactionId,
          date: new Date(),
          newBalanceBase: user.walletBalance,
          userCurrency: user.currency,
        }).catch(console.error);
      }
      
      return res.json({ success: true, message: 'Payment processed', transaction, user });
    }

    res.json({ success: true, message: 'Payment processed', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
