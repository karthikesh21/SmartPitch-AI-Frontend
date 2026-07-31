const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Lazy route requiring to avoid top-level load exceptions
app.use("/api/auth", (req, res, next) => {
  try {
    const authRoutes = require("../server/routes/authRoutes");
    return authRoutes(req, res, next);
  } catch (err) {
    console.error("Auth route error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/auth", (req, res, next) => {
  try {
    const authRoutes = require("../server/routes/authRoutes");
    return authRoutes(req, res, next);
  } catch (err) {
    console.error("Auth route error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/api/pitch", (req, res, next) => {
  try {
    const pitchRoutes = require("../server/routes/pitchRoutes");
    return pitchRoutes(req, res, next);
  } catch (err) {
    console.error("Pitch route error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/pitch", (req, res, next) => {
  try {
    const pitchRoutes = require("../server/routes/pitchRoutes");
    return pitchRoutes(req, res, next);
  } catch (err) {
    console.error("Pitch route error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
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
