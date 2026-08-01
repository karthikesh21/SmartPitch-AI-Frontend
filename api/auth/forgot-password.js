const userStore = require('../../server/services/userStore');

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

    const user = userStore.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please sign up first.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    userStore.setOTP(email, otp);

    return res.status(200).json({
      success: true,
      message: `OTP code generated for ${user.email}`,
      devOtp: otp
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};
