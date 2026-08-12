const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware('therapist'));

async function getAssignedPatient(req, patientId) {
  const therapist = await prisma.therapist.findUnique({
    where: { id: req.user.id },
    select: { patientIds: true },
  });
  if (!therapist) return null;

  const assigned = therapist.patientIds.includes(patientId);
  if (!assigned) return null;

  return prisma.patient.findUnique({
    where: { id: patientId },
    omit: { passwordHash: true },
  });
}

function calculateTrend(sessions) {
  if (sessions.length < 2) return '→';
  const latest = sessions[0];
  const previous = sessions.filter((session) => session.exercise === latest.exercise).slice(1, 3);
  if (!previous.length) return '→';
  const average = previous.reduce((sum, session) => sum + session.peakRom, 0) / previous.length;
  const difference = latest.peakRom - average;
  if (difference >= 5) return '↑';
  if (difference <= -5) return '↓';
  return '→';
}

// GET /therapist/patients
router.get('/patients', async (req, res) => {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: req.user.id },
      select: { patientIds: true },
    });
    if (!therapist) return res.status(404).json({ error: true, message: 'Therapist not found' });

    const patients = await prisma.patient.findMany({
      where: { id: { in: therapist.patientIds } },
      omit: { passwordHash: true },
    });

    const result = await Promise.all(patients.map(async (patient) => {
      const sessions = await prisma.session.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 3,
      });
      return {
        _id: patient.id,
        name: patient.name,
        lastSessionDate: sessions[0]?.date || null,
        trend: calculateTrend(sessions),
      };
    }));

    res.json({ patients: result });
  } catch (err) {
    console.error('Get therapist patients error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// GET /therapist/patients/:patientId
router.get('/patients/:patientId', async (req, res) => {
  try {
    const patient = await getAssignedPatient(req, req.params.patientId);
    if (!patient) return res.status(404).json({ error: true, message: 'Patient not found' });

    const [sessions, notes, assessments] = await Promise.all([
      prisma.session.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 8,
      }),
      prisma.therapistNote.findMany({
        where: { therapistId: req.user.id, patientId: patient.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.assessment.findMany({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
        take: 8,
      }),
    ]);

    res.json({ patient, sessions, notes, assessments });
  } catch (err) {
    console.error('Get patient detail error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// PATCH /therapist/patients/:patientId/sessions/:sessionId/review
router.patch('/patients/:patientId/sessions/:sessionId/review', async (req, res) => {
  try {
    const patient = await getAssignedPatient(req, req.params.patientId);
    if (!patient) return res.status(404).json({ error: true, message: 'Patient not found' });

    const { reviewStatus } = req.body;
    if (!['unreviewed', 'good', 'attention'].includes(reviewStatus)) {
      return res.status(400).json({ error: true, message: 'Invalid review status' });
    }

    const existing = await prisma.session.findFirst({
      where: { id: req.params.sessionId, patientId: patient.id },
    });
    if (!existing) return res.status(404).json({ error: true, message: 'Session not found' });

    const session = await prisma.session.update({
      where: { id: req.params.sessionId },
      data: { reviewStatus },
    });
    res.json({ session });
  } catch (error) {
    console.error('Update session review error:', error);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// PATCH /therapist/patients/:patientId/notes
router.patch('/patients/:patientId/notes', async (req, res) => {
  try {
    const patient = await getAssignedPatient(req, req.params.patientId);
    if (!patient) return res.status(404).json({ error: true, message: 'Patient not found' });

    const { weekNumber, note, templateKey } = req.body;
    if (!weekNumber || !note?.trim()) {
      return res.status(400).json({ error: true, message: 'Week number and note are required' });
    }

    const therapistNote = await prisma.therapistNote.create({
      data: {
        therapistId: req.user.id,
        patientId: patient.id,
        weekNumber,
        note: note.trim(),
        templateKey,
      },
    });

    res.status(201).json({ note: therapistNote });
  } catch (err) {
    console.error('Create therapist note error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
