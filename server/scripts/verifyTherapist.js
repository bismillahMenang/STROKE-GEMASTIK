const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const prisma = require('../lib/prisma');

const BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const response = await fetch(`${BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.message || 'Request failed'}`);
  return data;
}

async function run() {
  let patient = await prisma.patient.findUnique({ where: { email: 'budi4@test.com' } });
  if (!patient) {
    const passwordHash = await bcrypt.hash('password123', 10);
    patient = await prisma.patient.create({
      data: {
        name: 'Budi Test',
        email: 'budi4@test.com',
        passwordHash,
        phone: '080000000004',
        diagnosis: 'Test diagnosis',
      },
    });
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const therapist = await prisma.therapist.upsert({
    where: { email: 'verify-therapist@example.com' },
    update: {
      patientIds: [patient.id],
    },
    create: {
      name: 'Verify Therapist',
      email: 'verify-therapist@example.com',
      passwordHash,
      patientIds: [patient.id],
    },
  });

  await prisma.$disconnect();

  const login = await request('/auth/login-therapist', {
    method: 'POST',
    body: JSON.stringify({ email: therapist.email, password: 'password123' }),
  });
  const headers = { Authorization: `Bearer ${login.token}` };
  const list = await request('/therapist/patients', { headers });
  console.log('Patient list count:', list.patients.length);
  console.log('Trend:', list.patients[0]?.trend);

  const detail = await request(`/therapist/patients/${patient.id}`, { headers });
  console.log('Detail sessions:', detail.sessions.length);
  const note = await request(`/therapist/patients/${patient.id}/notes`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ weekNumber: 1, note: 'Verification note' }),
  });
  console.log('Note saved:', note.note.note);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
