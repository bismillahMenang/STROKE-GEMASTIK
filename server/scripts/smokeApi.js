const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function request(pathname, options = {}) {
  const response = await fetch(`${BASE}${pathname}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.message || 'request failed'}`);
  return data;
}

async function requestFailure(pathname, options = {}, expectedStatus = 400) {
  const response = await fetch(`${BASE}${pathname}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json();
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus}, got ${response.status}: ${data.message || 'request failed'}`);
  }
  return data;
}

async function run() {
  const health = await request('/health');
  if (health.status !== 'OK') throw new Error('Health check failed');

  await requestFailure('/auth/register-patient', {
    method: 'POST',
    body: JSON.stringify({ name: 'Invalid Email', email: 'not-an-email', password: 'password123' }),
  });
  await requestFailure('/auth/register-patient', {
    method: 'POST',
    body: JSON.stringify({ name: 'Short Password', email: 'short@example.com', password: 'short' }),
  });

  const registered = await request('/auth/register-patient', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Patient',
      email: 'Smoke.Patient@Example.com',
      password: 'smoke-password-123',
      phone: '080000000099',
    }),
  });
  if (!registered.token || registered.patient.email !== 'smoke.patient@example.com') {
    throw new Error('Registration did not normalize the email');
  }

  const relogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: '  SMOKE.PATIENT@EXAMPLE.COM ', password: 'smoke-password-123' }),
  });
  if (!relogin.token) throw new Error('Case-insensitive login failed');

  const patientLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'budi.demo@example.com', password: 'demo-password-123' }),
  });
  const patientHeaders = { Authorization: `Bearer ${patientLogin.token}` };
  const me = await request('/patient/me', { headers: patientHeaders });
  await request('/patient/sessions', {
    method: 'POST',
    headers: patientHeaders,
    body: JSON.stringify({
      date: new Date().toISOString(),
      exercise: 'shoulder_abduction',
      peakRom: 45,
      avgRom: 31,
      repsCompleted: 8,
      consistency: 'medium',
      notes: 'Demo smoke session',
      gyroRawSampleCount: 20,
    }),
  });
  const patientSessions = await request('/patient/sessions?limit=8', { headers: patientHeaders });
  if (!patientSessions.sessions.length) throw new Error('Patient sessions missing');

  const therapistLogin = await request('/auth/login-therapist', {
    method: 'POST',
    body: JSON.stringify({ email: 'terapis.demo@example.com', password: 'demo-password-123' }),
  });
  const therapistHeaders = { Authorization: `Bearer ${therapistLogin.token}` };
  const patients = await request('/therapist/patients', { headers: therapistHeaders });
  if (patients.patients.length !== 3) throw new Error(`Expected 3 patients, got ${patients.patients.length}`);

  const detail = await request(`/therapist/patients/${patients.patients[0].id}`, { headers: therapistHeaders });
  if (!detail.sessions?.length) throw new Error('Patient detail sessions missing');
  if (detail.totalSessions < detail.sessions.length) throw new Error('totalSessions is smaller than the returned page');
  if (typeof detail.totalReps !== 'number') throw new Error('totalReps is missing');

  await request(`/therapist/patients/${detail.patient.id}/notes`, {
    method: 'PATCH',
    headers: therapistHeaders,
    body: JSON.stringify({ weekNumber: 8, note: 'Smoke test note', templateKey: 'continue' }),
  });
  await request(`/therapist/patients/${me.patient.id}/notes`, {
    method: 'PATCH',
    headers: therapistHeaders,
    body: JSON.stringify({ weekNumber: 8, note: 'Smoke test note for logged-in patient', templateKey: 'continue' }),
  });

  const patientNotes = await request('/patient/notes', { headers: patientHeaders });
  if (!patientNotes.notes.length) throw new Error('Patient notes missing');
  if (patientNotes.notes.some((note) => note.patientId)) throw new Error('Patient notes must not expose patientId');

  await request(`/therapist/patients/${me.patient.id}/prescription`, {
    method: 'PUT',
    headers: therapistHeaders,
    body: JSON.stringify({
      exercise: 'forearm_supination',
      targetRom: 70,
      romCeiling: 85,
      targetReps: 12,
    }),
  });
  const patientPrescription = await request('/patient/prescription?exercise=forearm_supination', { headers: patientHeaders });
  if (
    patientPrescription.prescription?.targetRom !== 70
    || patientPrescription.prescription?.romCeiling !== 85
    || patientPrescription.prescription?.targetReps !== 12
  ) {
    throw new Error('Prescription round-trip failed');
  }

  await requestFailure(`/therapist/patients/${me.patient.id}/prescription`, {
    method: 'PUT',
    headers: therapistHeaders,
    body: JSON.stringify({
      exercise: 'forearm_supination',
      targetRom: 90,
      romCeiling: 80,
      targetReps: 12,
    }),
  });

  await request(`/therapist/patients/${detail.patient.id}/sessions/${detail.sessions[0].id}/review`, {
    method: 'PATCH',
    headers: therapistHeaders,
    body: JSON.stringify({ reviewStatus: 'good' }),
  });

  console.log('API smoke test passed:', {
    patientSessions: patientSessions.sessions.length,
    patientNotes: patientNotes.notes.length,
    patients: patients.patients.length,
    detailSessions: detail.sessions.length,
    totalSessions: detail.totalSessions,
    totalReps: detail.totalReps,
    prescriptionTarget: patientPrescription.prescription.targetRom,
  });
}

run().catch((error) => { console.error('API smoke test failed:', error.message); process.exit(1); });
