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

const writeUsers = (users) => {
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    fs.writeFileSync(tempPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const normEmail = normalizeEmail(email);
    const users = readUsers();

    if (users.some(u => normalizeEmail(u.email) === normEmail)) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: String(name).trim(),
      email: normEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    return res.status(201).json({ success: true, message: 'Account created successfully.', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
};
