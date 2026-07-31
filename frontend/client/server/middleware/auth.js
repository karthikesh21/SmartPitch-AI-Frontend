const firebaseConfig = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!firebaseConfig.auth) {
      return res.status(401).json({ error: 'Firebase authentication not configured' });
    }

    const decodedToken = await firebaseConfig.auth.verifyIdToken(token);
    
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token && firebaseConfig.auth) {
      const decodedToken = await firebaseConfig.auth.verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email
      };
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth: authMiddleware, optionalAuth };