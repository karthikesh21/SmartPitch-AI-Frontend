const aiService = require('../../server/services/aiService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { product, audience, framework = 'AIDA' } = req.body || {};
    const result = await aiService.generatePitch(product, audience, framework);
    return res.status(200).json({ success: true, data: { pitch: result, framework } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to generate pitch", message: err.message });
  }
};
