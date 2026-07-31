const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// In-memory OTP cache: { [normalizedEmail]: { otp: '123456', expiresAt: timestamp } }
const otpStore = new Map();

// Helper to safely read users
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const dir = path.dirname(USERS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

// Helper to safely write users
const writeUsers = (users) => {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
};

const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : '';
};

const findUserByEmail = (email) => {
  const normEmail = normalizeEmail(email);
  const users = readUsers();
  return users.find(u => normalizeEmail(u.email) === normEmail);
};

const createUser = async ({ name, email, password }) => {
  const normEmail = normalizeEmail(email);
  const users = readUsers();

  if (users.some(u => normalizeEmail(u.email) === normEmail)) {
    throw new Error('User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    email: normEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  return { id: newUser.id, name: newUser.name, email: newUser.email };
};

const verifyUserPassword = async (email, password) => {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User not found. Please sign up first.' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, error: 'Invalid password.' };
  }

  return {
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  };
};

const setOTP = (email, otp) => {
  const normEmail = normalizeEmail(email);
  // OTP valid for 10 minutes (600,000 ms)
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(normEmail, { otp: String(otp), expiresAt });
};

const getOTPData = (email) => {
  const normEmail = normalizeEmail(email);
  return otpStore.get(normEmail);
};

const verifyOTPCode = (email, otp) => {
  const normEmail = normalizeEmail(email);
  const data = otpStore.get(normEmail);
  if (!data) {
    return { valid: false, error: 'No OTP requested for this email or OTP expired.' };
  }

  if (Date.now() > data.expiresAt) {
    otpStore.delete(normEmail);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (String(data.otp).trim() !== String(otp).trim()) {
    return { valid: false, error: 'Invalid OTP code.' };
  }

  return { valid: true };
};

const resetPasswordWithOTP = async (email, otp, newPassword) => {
  const normEmail = normalizeEmail(email);
  const otpResult = verifyOTPCode(normEmail, otp);
  if (!otpResult.valid) {
    return { success: false, error: otpResult.error };
  }

  const users = readUsers();
  const index = users.findIndex(u => normalizeEmail(u.email) === normEmail);
  if (index === -1) {
    return { success: false, error: 'User not found.' };
  }

  const salt = await bcrypt.genSalt(10);
  users[index].password = await bcrypt.hash(newPassword, salt);
  users[index].updatedAt = new Date().toISOString();

  writeUsers(users);
  otpStore.delete(normEmail);

  return { success: true, message: 'Password updated successfully.' };
};

module.exports = {
  findUserByEmail,
  createUser,
  verifyUserPassword,
  setOTP,
  getOTPData,
  verifyOTPCode,
  resetPasswordWithOTP,
  normalizeEmail
};
