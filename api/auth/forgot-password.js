const userStore = require('../../server/services/userStore');
const { sendOTPEmail } = require('../../server/services/emailService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter your email address.' });
    }

    const user = await userStore.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please sign up first.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await userStore.setOTP(user.email, otp);

    // Send email via nodemailer / email service
    let emailResult = { sent: true, devMode: true };
    try {
      emailResult = await sendOTPEmail(user.email, otp);
    } catch (mailErr) {
      console.warn('Email dispatch warning:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: emailResult.devMode
        ? `OTP code generated for ${user.email}`
        : `OTP code sent to ${user.email}`,
      devOtp: emailResult.devMode ? otp : null,
      devMode: emailResult.devMode
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};
