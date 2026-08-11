const express = require('express');
const Assessment = require('../models/Assessment');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware('patient'));

router.post('/', async (req, res) => {
  try {
    const { date, type, score, risk, modelVersion, consentedAt } = req.body;
    if (!type || score === undefined || !modelVersion || (type === 'speech_clarity' && !consentedAt)) {
      return res.status(400).json({ error: true, message: 'Type, score, and model version are required' });
    }
    const assessment = await Assessment.create({
      patientId: req.user.id,
      date: date ? new Date(date) : new Date(),
      type,
      score,
      risk,
      modelVersion,
      consentedAt: consentedAt ? new Date(consentedAt) : undefined,
    });
    res.status(201).json({ assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
    const assessments = await Assessment.find({ patientId: req.user.id }).sort({ date: -1 }).limit(limit);
    res.json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
