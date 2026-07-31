const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

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

const comparePassword = async (password, storedHash) => {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }
  return password === storedHash;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password.' });
    }
    const normEmail = normalizeEmail(email);
    const users = readUsers();
    const user = users.find(u => normalizeEmail(u.email) === normEmail);

    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found. Please sign up first.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid password.' });
    }

    return res.status(200).json({ success: true, message: 'Logged in successfully.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};
