const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { deposit, verifyPayment, getHistory } = require('../controllers/walletController');

router.post('/deposit', protect, deposit);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getHistory);

module.exports = router;
