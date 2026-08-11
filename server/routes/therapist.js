const express = require('express');
const Patient = require('../models/Patient');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const TherapistNote = require('../models/TherapistNote');
const Assessment = require('../models/Assessment');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware('therapist'));

async function getAssignedPatient(req, patientId) {
  const therapist = await Therapist.findById(req.user.id).select('patientIds');
  if (!therapist) return null;

  const assigned = therapist.patientIds.some((id) => id.toString() === patientId);
  if (!assigned) return null;
  return Patient.findById(patientId).select('-passwordHash');
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
    const therapist = await Therapist.findById(req.user.id).select('patientIds');
    if (!therapist) return res.status(404).json({ error: true, message: 'Therapist not found' });

    const patients = await Patient.find({ _id: { $in: therapist.patientIds } }).select('-passwordHash');
    const result = await Promise.all(patients.map(async (patient) => {
      const sessions = await Session.find({ patientId: patient._id }).sort({ date: -1 }).limit(3);
      return {
        _id: patient._id,
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
      Session.find({ patientId: patient._id }).sort({ date: -1 }).limit(8),
      TherapistNote.find({ therapistId: req.user.id, patientId: patient._id }).sort({ createdAt: -1 }),
      Assessment.find({ patientId: patient._id }).sort({ date: -1 }).limit(8),
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

    const session = await Session.findOneAndUpdate(
      { _id: req.params.sessionId, patientId: patient._id },
      { reviewStatus },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: true, message: 'Session not found' });
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

    const therapistNote = await TherapistNote.create({
      therapistId: req.user.id,
      patientId: patient._id,
      weekNumber,
      note: note.trim(),
      templateKey,
    });

    res.status(201).json({ note: therapistNote });
  } catch (err) {
    console.error('Create therapist note error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
