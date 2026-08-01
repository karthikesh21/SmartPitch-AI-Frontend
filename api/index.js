const express = require("express");
const cors = require("cors");
const userStore = require("../server/services/userStore");
const aiService = require("../server/services/aiService");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Auth endpoints
app.post(["/api/auth/signup", "/auth/signup"], async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    const user = await userStore.createUser({ name, email, password });
    return res.status(201).json({ success: true, message: 'Account created successfully.', user });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message || 'Signup failed' });
  }
});

app.post(["/api/auth/login", "/auth/login"], async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email and password.' });
    }
    const result = await userStore.verifyUserPassword(email, password);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json({ success: true, message: 'Logged in successfully.', user: result.user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

app.post(["/api/auth/forgot-password", "/auth/forgot-password"], async (req, res) => {
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
    return res.json({ success: true, message: `OTP code generated for ${user.email}`, devOtp: otp });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(["/api/auth/verify-otp", "/auth/verify-otp"], (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }
    const result = userStore.verifyOTPCode(email, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.error });
    }
    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(["/api/auth/reset-password", "/auth/reset-password"], async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/auth/users", "/auth/users"], (req, res) => {
  try {
    const users = userStore.getAllUsers();
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pitch endpoints
app.post(["/api/pitch/generate", "/pitch/generate"], async (req, res) => {
  try {
    const { product, audience, framework = 'AIDA' } = req.body || {};
    const result = await aiService.generatePitch(product, audience, framework);
    return res.json({ success: true, data: { pitch: result, framework } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(["/api/pitch/cold-mail", "/pitch/cold-mail"], async (req, res) => {
  try {
    const { productName, productDescription, targetRole, problem, valueProposition } = req.body || {};
    const data = await aiService.generateColdMailPitch({ productName, productDescription, targetRole, problem, valueProposition });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.send("🚀 SmartPitch AI Server Running");
});

app.use((err, req, res, next) => {
  console.error("Vercel Serverless Function Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

module.exports = (req, res) => {
  return app(req, res);
};
