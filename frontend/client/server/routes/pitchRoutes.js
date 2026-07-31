const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const db = require('../config/firebase');

router.post('/generate',
  optionalAuth,
  [
    body('product').isObject(),
    body('product.name').notEmpty(),
    body('audience').isObject()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { product, audience, framework = 'AIDA' } = req.body;
      const result = await aiService.generatePitch(product, audience, framework);

      if (req.user) {
        await db.collection('pitches').add({
          userId: req.user.id, product, audience, framework,
          pitchText: result, createdAt: new Date().toISOString()
        });
      }
      res.json({ success: true, data: { pitch: result, framework } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate pitch", message: error.message });
    }
  }
);

router.post('/cold-mail',
  [
    body('productName').notEmpty().withMessage('Product name is required'),
    body('targetRole').notEmpty().withMessage('Target role is required'),
    body('problem').notEmpty().withMessage('Core problem is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { productName, productDescription, targetRole, problem, valueProposition } = req.body;
      const data = await aiService.generateColdMailPitch({
        productName, productDescription, targetRole, problem, valueProposition
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Cold mail route error:', error);
      res.status(500).json({ success: false, error: "Failed to generate pitch", message: error.message });
    }
  }
);

module.exports = router;