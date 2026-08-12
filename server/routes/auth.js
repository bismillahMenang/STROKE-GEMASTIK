const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// POST /auth/register-patient
router.post('/register-patient', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required' });
    }

    const existing = await prisma.patient.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: true, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
      },
    });

    const token = signToken({ id: patient.id, role: 'patient' });
    res.status(201).json({
      token,
      patient: {
        _id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        language: patient.language,
      },
    });
  } catch (err) {
    console.error('Register patient error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const patient = await prisma.patient.findUnique({ where: { email } });
    if (!patient || !(await bcrypt.compare(password, patient.passwordHash))) {
      return res.status(401).json({ error: true, message: 'Email atau password salah' });
    }

    const token = signToken({ id: patient.id, role: 'patient' });
    res.json({ token, role: 'patient' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

// POST /auth/login-therapist
router.post('/login-therapist', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const therapist = await prisma.therapist.findUnique({ where: { email } });
    if (!therapist || !(await bcrypt.compare(password, therapist.passwordHash))) {
      return res.status(401).json({ error: true, message: 'Email atau password salah' });
    }

    const token = signToken({ id: therapist.id, role: 'therapist' });
    res.json({ token, role: 'therapist' });
  } catch (err) {
    console.error('Therapist login error:', err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
});

module.exports = router;
