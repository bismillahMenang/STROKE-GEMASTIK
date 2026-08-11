const express = require('express');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware('patient'));

router.get('/me', async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-passwordHash');
    if (!patient) return res.status(404).json({ error: true, message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
