const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getBidHistory, getMyBids, getWonAuctions, adminGetBids } = require('../controllers/bidController');

router.get('/history', protect, getBidHistory);
router.get('/my-bids', protect, getMyBids);
router.get('/won', protect, getWonAuctions);
router.get('/admin/all', adminOnly, adminGetBids);

module.exports = router;
