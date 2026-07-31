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

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/pitch", pitchRoutes);
app.use("/pitch", pitchRoutes);

app.all(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString()
  });
});

app.all("*", (req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found", path: req.url });
});

module.exports = (req, res) => {
  return app(req, res);
};
