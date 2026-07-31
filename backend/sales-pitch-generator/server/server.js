require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin"); // Add this

const pitchRoutes = require("./routes/pitchRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();


const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (typeof origin === 'string' && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ INITIALIZE FIREBASE ADMIN (for Storage)
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
  } catch (err) {
    console.warn("⚠️ Firebase Admin init warning:", err.message);
  }
}

// Make bucket available to routes if initialized
if (admin.apps.length && process.env.FIREBASE_STORAGE_BUCKET) {
  try {
    app.locals.bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
  } catch (e) {}
}

// Your routes
app.use("/api/auth", authRoutes);
app.use("/api/pitch", pitchRoutes);

app.get("/", (req, res) => {
  res.send("🚀 SmartPitch AI Server Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running!",
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  });
}