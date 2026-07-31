const userStore = require('../../server/services/userStore');
const { sendOTPEmail } = require('../../server/services/emailService');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine action from req.query.action or URL path
  let action = req.query.action;
  if (!action && req.url) {
    const parts = req.url.split('?')[0].split('/');
    action = parts[parts.length - 1];
  }

  try {
    if (action === 'signup' && req.method === 'POST') {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      }
      const user = await userStore.createUser({ name, email, password });
      return res.status(201).json({ success: true, message: 'Account created successfully.', user });
    }

    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please enter email and password.' });
      }
      const result = await userStore.verifyUserPassword(email, password);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json({ success: true, message: 'Logged in successfully.', user: result.user });
    }

    if (action === 'forgot-password' && req.method === 'POST') {
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

      try {
        await sendOTPEmail(user.email, otp);
      } catch (e) {}

      return res.json({
        success: true,
        message: `OTP code generated for ${user.email}`,
        devOtp: otp
      });
    }

    if (action === 'verify-otp' && req.method === 'POST') {
      const { email, otp } = req.body || {};
      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
      }
      const result = userStore.verifyOTPCode(email, otp);
      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.error });
      }
      return res.json({ success: true, message: 'OTP verified successfully.' });
    }

    if (action === 'reset-password' && req.method === 'POST') {
      const { email, otp, newPassword } = req.body || {};
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
      return res.json({ success: true, message: 'Password reset successfully.' });
    }

    if (action === 'users' && req.method === 'GET') {
      const users = userStore.getAllUsers();
      return res.json({ success: true, count: users.length, users });
    }

    return res.status(404).json({ success: false, error: `Auth endpoint '/api/auth/${action}' not found.` });
  } catch (err) {
    console.error(`Auth error [${action}]:`, err);
    return res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
};
