const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const {
  normalizeEmail,
  isValidEmail,
  isStrongEnoughPassword,
} = require('../utils/validation');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// POST /auth/register-patient
router.post('/register-patient', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : undefined;

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: true, message: 'Format email tidak valid' });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({ error: true, message: 'Password minimal 8 karakter' });
    }

    const existing = await prisma.patient.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
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
        id: patient.id,
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
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const patient = await prisma.patient.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
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
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required' });
    }

    const therapist = await prisma.therapist.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
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
