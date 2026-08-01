const userStore = require('../../server/services/userStore');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const user = await userStore.createUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message || 'Failed to create account.' });
  }
};
