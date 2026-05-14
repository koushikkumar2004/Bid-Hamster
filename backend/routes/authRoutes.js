const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');
const {
  register, verifyEmail, resendOTP, login, adminLogin,
  forgotPassword, resetPassword, getMe, updateProfile,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);

module.exports = router;
