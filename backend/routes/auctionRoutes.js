const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { uploadAuctionImages } = require('../config/cloudinary');
const {
  createAuction, getAuctions, getAuction, updateAuction, deleteAuction,
  toggleWatchlist, adminGetAuctions, adminUpdateAuction,
} = require('../controllers/auctionController');

// Public
router.get('/', getAuctions);
router.get('/:id', getAuction);

// Protected (User)
router.post('/', protect, uploadAuctionImages.array('images', 8), createAuction);
router.put('/:id', protect, updateAuction);
router.delete('/:id', protect, deleteAuction);
router.post('/:id/watchlist', protect, toggleWatchlist);

// Admin
router.get('/admin/all', adminOnly, adminGetAuctions);
router.patch('/admin/:id', adminOnly, adminUpdateAuction);

module.exports = router;
