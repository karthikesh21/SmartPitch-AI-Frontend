const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

let inMemoryUsers = [];
const otpStore = new Map();

const readUsers = () => {
  if (inMemoryUsers.length > 0) return inMemoryUsers;
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    if (fs.existsSync(tempPath)) {
      const data = fs.readFileSync(tempPath, 'utf8');
      inMemoryUsers = JSON.parse(data || '[]');
      return inMemoryUsers;
    }
  } catch (e) {}
  return inMemoryUsers;
};

const writeUsers = (users) => {
  inMemoryUsers = users;
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    fs.writeFileSync(tempPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
};

const normalizeEmail = (email) => (email ? String(email).trim().toLowerCase() : '');

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
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

const createUser = async ({ name, email, password }) => {
  const normEmail = normalizeEmail(email);
  const users = readUsers();

  if (users.some(u => normalizeEmail(u.email) === normEmail)) {
    throw new Error('User already exists with this email');
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

  return { id: newUser.id, name: newUser.name, email: newUser.email };
};

const verifyUserPassword = async (email, password) => {
  const normEmail = normalizeEmail(email);
  const users = readUsers();
  const user = users.find(u => normalizeEmail(u.email) === normEmail);

  if (!user) {
    return { success: false, error: 'User not found. Please sign up first.' };
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return { success: false, error: 'Invalid password.' };
  }

  return {
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  };
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let action = req.query?.action;
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
      const user = await createUser({ name, email, password });
      return res.status(201).json({ success: true, message: 'Account created successfully.', user });
    }

    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please enter email and password.' });
      }
      const result = await verifyUserPassword(email, password);
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
      const normEmail = normalizeEmail(email);
      const users = readUsers();
      const user = users.find(u => normalizeEmail(u.email) === normEmail);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found. Please sign up first.' });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStore.set(normEmail, { otp, expiresAt });

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
      const normEmail = normalizeEmail(email);
      const data = otpStore.get(normEmail);
      if (!data || Date.now() > data.expiresAt) {
        return res.status(400).json({ success: false, error: 'OTP has expired or was not requested.' });
      }
      if (String(data.otp).trim() !== String(otp).trim()) {
        return res.status(400).json({ success: false, error: 'Invalid OTP code.' });
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
      const normEmail = normalizeEmail(email);
      const data = otpStore.get(normEmail);
      if (!data || String(data.otp).trim() !== String(otp).trim()) {
        return res.status(400).json({ success: false, error: 'Invalid or expired OTP code.' });
      }

      const users = readUsers();
      const index = users.findIndex(u => normalizeEmail(u.email) === normEmail);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      users[index].password = await hashPassword(newPassword);
      users[index].updatedAt = new Date().toISOString();
      writeUsers(users);
      otpStore.delete(normEmail);

      return res.json({ success: true, message: 'Password reset successfully.' });
    }

    if (action === 'users' && req.method === 'GET') {
      const users = readUsers();
      const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));
      return res.json({ success: true, count: safeUsers.length, users: safeUsers });
    }

    return res.status(404).json({ success: false, error: `Auth endpoint '/api/auth/${action}' not found.` });
  } catch (err) {
    console.error(`Auth error [${action}]:`, err);
    return res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
};
