const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const axios = require('axios');

const CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019fbe8a-68c7-7f9e-a74e-fa48a3618fba';

let bcrypt = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.warn("Bcryptjs optional import fallback:", e.message);
}

const hashPassword = async (password) => {
  if (bcrypt) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (e) { }
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const comparePassword = async (password, storedHash) => {
  if (!storedHash) return false;
  const strHash = String(storedHash).trim();
  const strPass = String(password).trim();

  // 1. Check bcrypt hashes ($2a$, $2b$, $2y$, $2$)
  if (bcrypt && (strHash.startsWith('$2a$') || strHash.startsWith('$2b$') || strHash.startsWith('$2y$') || strHash.startsWith('$2$'))) {
    try {
      const match = await bcrypt.compare(strPass, strHash);
      if (match) return true;
    } catch (e) {
      console.warn("Bcrypt compare error:", e.message);
    }
  }

  // 2. Check salt:hash format (pbkdf2Sync)
  if (strHash.includes(':')) {
    try {
      const [salt, originalHash] = strHash.split(':');
      const hash = crypto.pbkdf2Sync(strPass, salt, 1000, 64, 'sha512').toString('hex');
      if (hash === originalHash) return true;
    } catch (e) { }
  }

  // 3. Plaintext match fallback for dev / initial seed users
  return strPass === strHash;
};

let inMemoryUsers = [];

const fetchCloudUsers = async () => {
  try {
    const res = await axios.get(CLOUD_DB_URL, { timeout: 3500 });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { }
  return [];
};

const syncCloudUsers = async (users) => {
  try {
    await axios.put(CLOUD_DB_URL, users, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 4000
    });
  } catch (e) { }
};

const readUsersSync = () => {
  let seedUsers = [];
  try {
    const bundled = require('../data/users.json');
    if (Array.isArray(bundled)) {
      seedUsers = bundled;
    }
  } catch (e) { }

  let tempUsers = [];
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    if (fs.existsSync(tempPath)) {
      const data = fs.readFileSync(tempPath, 'utf8');
      tempUsers = JSON.parse(data || '[]');
    }
  } catch (e) { }

  const userMap = new Map();
  seedUsers.forEach(u => { if (u && u.email) userMap.set(u.email.trim().toLowerCase(), u); });
  tempUsers.forEach(u => { if (u && u.email) userMap.set(u.email.trim().toLowerCase(), u); });
  inMemoryUsers.forEach(u => { if (u && u.email) userMap.set(u.email.trim().toLowerCase(), u); });

  inMemoryUsers = Array.from(userMap.values());
  return inMemoryUsers;
};

const readUsersAsync = async () => {
  const localUsers = readUsersSync();
  const cloudUsers = await fetchCloudUsers();

  const userMap = new Map();
  localUsers.forEach(u => { if (u && u.email) userMap.set(u.email.trim().toLowerCase(), u); });
  cloudUsers.forEach(u => { if (u && u.email) userMap.set(u.email.trim().toLowerCase(), u); });

  inMemoryUsers = Array.from(userMap.values());
  return inMemoryUsers;
};

const writeUsers = async (users) => {
  inMemoryUsers = users;
  try {
    const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
    fs.writeFileSync(tempPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) { }

  await syncCloudUsers(users);
};

const normalizeEmail = (email) => {
  return email ? String(email).trim().toLowerCase() : '';
};

const findUserByEmail = async (email) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();
  return users.find(u => normalizeEmail(u.email) === normEmail);
};

const getAllUsers = async () => {
  const users = await readUsersAsync();
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt
  }));
};

const createUser = async ({ name, email, password }) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();

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
  await writeUsers(users);

  return { id: newUser.id, name: newUser.name, email: newUser.email };
};

const verifyUserPassword = async (email, password) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();
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

const setOTP = async (email, otp) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();
  const index = users.findIndex(u => normalizeEmail(u.email) === normEmail);
  if (index >= 0) {
    users[index].otp = String(otp).trim();
    users[index].otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await writeUsers(users);
  }
};

const getOTPData = async (email) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();
  const user = users.find(u => normalizeEmail(u.email) === normEmail);
  if (user && user.otp) {
    return { otp: user.otp, expiresAt: user.otpExpiresAt };
  }
  return null;
};

const verifyOTPCode = async (email, otp) => {
  const normEmail = normalizeEmail(email);
  const users = await readUsersAsync();
  const user = users.find(u => normalizeEmail(u.email) === normEmail);

  if (!user || !user.otp) {
    return { valid: false, error: 'No OTP requested for this email or OTP expired.' };
  }

  if (Date.now() > (user.otpExpiresAt || 0)) {
    user.otp = null;
    await writeUsers(users);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (String(user.otp).trim() !== String(otp).trim()) {
    return { valid: false, error: 'Invalid OTP code.' };
  }

  return { valid: true };
};

const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const normEmail = normalizeEmail(email);
  const otpResult = await verifyOTPCode(normEmail, otp);
  if (!otpResult.valid) {
    return { success: false, error: otpResult.error };
  }

  const users = await readUsersAsync();
  const index = users.findIndex(u => normalizeEmail(u.email) === normEmail);
  if (index === -1) {
    return { success: false, error: 'User not found.' };
  }

  users[index].password = await hashPassword(newPassword);
  users[index].otp = null;
  users[index].updatedAt = new Date().toISOString();

  await writeUsers(users);

  return { success: true, message: 'Password updated successfully.' };
};

module.exports = {
  findUserByEmail,
  getAllUsers,
  createUser,
  verifyUserPassword,
  setOTP,
  getOTPData,
  verifyOTPCode,
  resetPasswordWithOTP,
  normalizeEmail
};
