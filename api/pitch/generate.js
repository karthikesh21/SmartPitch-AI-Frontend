const aiService = require('../../server/services/aiService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const { product, audience, framework = 'AIDA' } = body;

  try {
    const result = await aiService.generatePitch(product, audience, framework);
    return res.status(200).json({ success: true, data: { pitch: result, framework } });
  } catch (err) {
    console.warn("Generate pitch AI warning, using fallback:", err.message);
    const mockPitch = aiService.getMockPitch(product, audience, framework);
    return res.status(200).json({ success: true, data: { pitch: mockPitch, framework }, fallback: true });
  }
};
