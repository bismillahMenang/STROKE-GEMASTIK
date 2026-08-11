const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Patient = require('../models/Patient');
const Therapist = require('../models/Therapist');

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
  await mongoose.connect(process.env.MONGO_URI);
  const patient = await Patient.findOne({ email: 'budi4@test.com' });
  const passwordHash = await bcrypt.hash('password123', 10);
  const therapist = await Therapist.findOneAndUpdate(
    { email: 'verify-therapist@example.com' },
    { name: 'Verify Therapist', email: 'verify-therapist@example.com', passwordHash, patientIds: [patient._id] },
    { upsert: true, new: true }
  );
  await mongoose.disconnect();

  const login = await request('/auth/login-therapist', {
    method: 'POST',
    body: JSON.stringify({ email: therapist.email, password: 'password123' }),
  });
  const headers = { Authorization: `Bearer ${login.token}` };
  const list = await request('/therapist/patients', { headers });
  console.log('Patient list count:', list.patients.length);
  console.log('Trend:', list.patients[0].trend);

  const detail = await request(`/therapist/patients/${patient._id}`, { headers });
  console.log('Detail sessions:', detail.sessions.length);
  const note = await request(`/therapist/patients/${patient._id}/notes`, {
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
