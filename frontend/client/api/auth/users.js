const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let users = [];
    try {
      const tempPath = path.join(os.tmpdir(), 'smartpitch_users.json');
      if (fs.existsSync(tempPath)) {
        users = JSON.parse(fs.readFileSync(tempPath, 'utf8') || '[]');
      }
    } catch (e) {}

    const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }));
    return res.status(200).json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
