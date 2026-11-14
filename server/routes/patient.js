const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware('patient'));

router.get('/me', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.user.id },
      omit: { passwordHash: true },
    });
    if (!patient) return res.status(404).json({ error: true, message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /patient/notes?limit=8
// Weekly notes written by the patient's therapist. Scoped to the JWT patient.
router.get('/notes', async (req, res) => {
  try {
    const requestedLimit = parseInt(req.query.limit, 10) || 8;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);

    const notes = await prisma.therapistNote.findMany({
      where: { patientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        weekNumber: true,
        note: true,
        templateKey: true,
        createdAt: true,
        therapist: { select: { name: true } },
      },
    });

    res.json({ notes });
  } catch (error) {
    console.error('Get patient notes error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /patient/prescription?exercise=forearm_supination
// The active plan (target ROM, safety ceiling, target reps) for one exercise.
// Returns null when the therapist has not prescribed it yet — the client falls
// back to cached values or built-in defaults.
router.get('/prescription', async (req, res) => {
  try {
    const { exercise } = req.query;
    if (!exercise) return res.status(400).json({ error: true, message: 'Exercise is required' });

    const prescription = await prisma.prescription.findFirst({
      where: { patientId: req.user.id, exercise, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ prescription: prescription || null });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
