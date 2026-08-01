const aiService = require('../../server/services/aiService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { productName, productDescription, targetRole, problem, valueProposition } = req.body || {};
    const data = await aiService.generateColdMailPitch({
      productName, productDescription, targetRole, problem, valueProposition
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to generate cold mail pitch", message: err.message });
  }
};
