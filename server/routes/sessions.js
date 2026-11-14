const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require patient JWT
router.use(authMiddleware('patient'));

// POST /patient/sessions
router.post('/', async (req, res) => {
  try {
    const { date, exercise, peakRom, avgRom, repsCompleted, consistency, pain, avgSmoothness, ceilingHits, prescriptionSource, notes, gyroRawSampleCount, syncedAt } = req.body;

    if (!date || !exercise) {
      return res.status(400).json({ error: true, message: 'Date and exercise are required' });
    }

    if (pain && !['none', 'mild', 'stopped'].includes(pain)) {
      return res.status(400).json({ error: true, message: 'Invalid pain level' });
    }

    const session = await prisma.session.create({
      data: {
        patientId: req.user.id,
        date: new Date(date),
        exercise,
        peakRom,
        avgRom,
        repsCompleted,
        consistency,
        pain,
        avgSmoothness,
        ceilingHits,
        prescriptionSource,
        notes,
        gyroRawSampleCount,
        syncedAt: syncedAt ? new Date(syncedAt) : new Date(),
      },
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

    const sessions = await prisma.session.findMany({
      where: { patientId: req.user.id },
      orderBy: { date: 'desc' },
      take: limit,
    });

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

    const existing = await prisma.session.findFirst({
      where: { id: req.params.sessionId, patientId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: true, message: 'Session not found' });
    }

    const session = await prisma.session.update({
      where: { id: req.params.sessionId },
      data: { notes },
    });

    res.json({ session });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
