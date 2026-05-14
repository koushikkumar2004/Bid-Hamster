const express = require('express');
const router = express.Router();
const { adminOnly } = require('../middleware/adminMiddleware');
const { getDashboardStats, getAllUsers, toggleBanUser, deleteUser, createAuction } = require('../controllers/adminController');
const { uploadAuctionImages } = require('../config/cloudinary');

router.get('/stats', adminOnly, getDashboardStats);
router.get('/users', adminOnly, getAllUsers);
router.patch('/users/:id/ban', adminOnly, toggleBanUser);
router.delete('/users/:id', adminOnly, deleteUser);
router.post('/create-auction', adminOnly, uploadAuctionImages.array('images', 5), createAuction);

module.exports = router;
