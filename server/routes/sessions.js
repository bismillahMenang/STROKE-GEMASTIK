const express = require('express');
const Session = require('../models/Session');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require patient JWT
router.use(authMiddleware('patient'));

// POST /patient/sessions
router.post('/', async (req, res) => {
  try {
    const { date, exercise, peakRom, avgRom, repsCompleted, consistency, notes, gyroRawSampleCount, syncedAt } = req.body;

    if (!date || !exercise) {
      return res.status(400).json({ error: true, message: 'Date and exercise are required' });
    }

    const session = await Session.create({
      patientId: req.user.id,
      date: new Date(date),
      exercise,
      peakRom,
      avgRom,
      repsCompleted,
      consistency,
      notes,
      gyroRawSampleCount,
      syncedAt: syncedAt ? new Date(syncedAt) : new Date(),
    });

    res.status(201).json({ session });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /patient/sessions?limit=8
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;

    const sessions = await Session.find({ patientId: req.user.id })
      .sort({ date: -1 })
      .limit(limit);

    res.json({ sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// PATCH /patient/sessions/:sessionId
router.patch('/:sessionId', async (req, res) => {
  try {
    const { notes } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.sessionId, patientId: req.user.id },
      { notes },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: true, message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
