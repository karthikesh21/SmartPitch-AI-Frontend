const express = require('express');
const router = express.Router();
const userStore = require('../services/userStore');
const { sendOTPEmail } = require('../services/emailService');

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const user = await userStore.createUser({ name, email, password });
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return details
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password.' });
    }

    const result = await userStore.verifyUserPassword(email, password);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: result.user
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send 6-digit OTP code to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter your email address.' });
    }

    const user = userStore.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please sign up first.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    userStore.setOTP(email, otp);

    let emailResult = { sent: true, devMode: true };
    try {
      emailResult = await sendOTPEmail(user.email, otp);
    } catch (sendErr) {
      console.warn('Email dispatch warning:', sendErr.message);
    }

    return res.json({
      success: true,
      message: `OTP code generated for ${user.email}`,
      devOtp: otp
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to send OTP code.' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }

    const result = userStore.verifyOTPCode(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error during OTP verification.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using verified OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please fill in all fields.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    const result = await userStore.resetPasswordWithOTP(email, otp, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// @route   GET /api/auth/users
// @desc    Get list of registered users
router.get('/users', (req, res) => {
  try {
    const users = userStore.getAllUsers();
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
});

module.exports = router;
