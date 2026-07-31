const fs = require('fs');
const path = require('path');
const os = require('os');

const normalizeEmail = (email) => (email ? String(email).trim().toLowerCase() : '');

const readUsers = () => {
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    if (fs.existsSync(tempPath)) {
      return JSON.parse(fs.readFileSync(tempPath, 'utf8') || '[]');
    }
  } catch (e) {}
  return [];
};

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
    const normEmail = normalizeEmail(email);
    const users = readUsers();
    const user = users.find(u => normalizeEmail(u.email) === normEmail);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please sign up first.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    return res.status(200).json({
      success: true,
      message: `OTP code generated for ${user.email}`,
      devOtp: otp
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};
