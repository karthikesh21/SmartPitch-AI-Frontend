const express = require("express");
const cors = require("cors");
const pitchRoutes = require("../server/routes/pitchRoutes");
const authRoutes = require("../server/routes/authRoutes");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Support both /api/auth and /auth rewrites in Vercel
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Support both /api/pitch and /pitch rewrites in Vercel
app.use("/api/pitch", pitchRoutes);
app.use("/pitch", pitchRoutes);

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

// Global error handler to catch exceptions and print clean JSON error
app.use((err, req, res, next) => {
  console.error("Vercel Serverless Function Error:", err);
  res.status(200).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

module.exports = app;
