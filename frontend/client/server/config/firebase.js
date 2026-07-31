const admin = require("firebase-admin");

let db = null;
let auth = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      db = admin.firestore();
      auth = admin.auth();
    }
  } else {
    db = admin.firestore();
    auth = admin.auth();
  }
} catch (err) {
  console.warn("⚠️ Firebase init warning:", err.message);
}

// Fallback dummy db object to prevent runtime errors if Firebase is disabled
const safeDb = db || {
  collection: () => ({
    add: async () => ({ id: 'mock_id' }),
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  })
};

module.exports = safeDb;
module.exports.db = safeDb;
module.exports.auth = auth;