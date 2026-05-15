const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, age, gender, phone } = req.body;

    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (age < 18) {
      return res.status(400).json({ success: false, message: 'You must be at least 18 years old.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      gender,
      phone: phone || '',
      isVerified: true,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify Email ──────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });
    if (!user.verificationCode || user.verificationCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (new Date() > user.verificationCodeExpire) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Resend OTP ────────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });

    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email in background
    sendOTPEmail(user.email, user.name, otp).catch(err => console.error('📧 Background Email Error (Resend):', err));
    res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email, role: 'user' }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    /* Skip verification check for faster login */
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, walletBalance: user.walletBalance, currency: user.currency, nationality: user.nationality },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin Login ───────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      message: 'Admin login successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    const otp = generateOTP();
    user.passwordResetCode = otp;
    user.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email in background
    sendPasswordResetEmail(email, { name: user.name, otp }).catch(err => console.error('📧 Background Email Error (ForgotPass):', err));
    res.json({ success: true, message: 'Password reset OTP sent to your email.', userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.passwordResetCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (new Date() > user.passwordResetExpire) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    user.password = newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Me ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist', 'title currentBid endTime images status');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, nationality, currency, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');

    if (currentPassword && newPassword) {
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }
      user.password = newPassword;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (nationality !== undefined) user.nationality = nationality;
    if (currency !== undefined) user.currency = currency;
    
    if (req.file) {
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    await user.save();
    
    // Remove password from returned user object
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, message: 'Profile updated!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
