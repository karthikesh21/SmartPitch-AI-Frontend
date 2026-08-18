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

  const { productName, productDescription, targetRole, problem, valueProposition } = body;

  try {
    const data = await aiService.generateColdMailPitch({
      productName, productDescription, targetRole, problem, valueProposition
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.warn("Cold mail AI generation warning, using fallback:", err.message);
    const mockData = aiService.getMockColdMail({
      productName, productDescription, targetRole, problem, valueProposition
    });
    return res.status(200).json({ success: true, data: mockData, fallback: true });
  }
};
