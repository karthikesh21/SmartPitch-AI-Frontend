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
app.use("/api/pitch", pitchRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.send("🚀 SmartPitch AI Server Running");
});

module.exports = app;
