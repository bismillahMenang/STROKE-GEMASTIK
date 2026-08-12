const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const BASE = 'http://localhost:5000/api';

async function request(pathname, options = {}) {
  const response = await fetch(`${BASE}${pathname}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.message || 'request failed'}`);
  return data;
}

async function run() {
  const health = await request('/health');
  if (health.status !== 'OK') throw new Error('Health check failed');

  const patientLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'budi.demo@example.com', password: 'demo-password-123' }) });
  const patientHeaders = { Authorization: `Bearer ${patientLogin.token}` };
  await request('/patient/me', { headers: patientHeaders });
  await request('/patient/assessments', { method: 'POST', headers: patientHeaders, body: JSON.stringify({ type: 'speech_clarity', score: 0.71, risk: 'low', modelVersion: 'phase2-audio-baseline-0.1', consentedAt: new Date().toISOString() }) });
  await request('/patient/sessions', { method: 'POST', headers: patientHeaders, body: JSON.stringify({ date: new Date().toISOString(), exercise: 'shoulder_abduction', peakRom: 45, avgRom: 31, repsCompleted: 8, consistency: 'medium', notes: 'Demo smoke session', gyroRawSampleCount: 20 }) });
  const patientSessions = await request('/patient/sessions?limit=8', { headers: patientHeaders });
  if (!patientSessions.sessions.length) throw new Error('Patient sessions missing');

  const therapistLogin = await request('/auth/login-therapist', { method: 'POST', body: JSON.stringify({ email: 'terapis.demo@example.com', password: 'demo-password-123' }) });
  const therapistHeaders = { Authorization: `Bearer ${therapistLogin.token}` };
  const patients = await request('/therapist/patients', { headers: therapistHeaders });
  if (patients.patients.length !== 3) throw new Error(`Expected 3 patients, got ${patients.patients.length}`);
  const detail = await request(`/therapist/patients/${patients.patients[0]._id}`, { headers: therapistHeaders });
  if (!detail.assessments?.length) throw new Error('Phase 2 assessments missing');
  await request(`/therapist/patients/${detail.patient.id}/notes`, { method: 'PATCH', headers: therapistHeaders, body: JSON.stringify({ weekNumber: 8, note: 'Smoke test note', templateKey: 'continue' }) });
  await request(`/therapist/patients/${detail.patient.id}/sessions/${detail.sessions[0].id}/review`, { method: 'PATCH', headers: therapistHeaders, body: JSON.stringify({ reviewStatus: 'good' }) });
  console.log('API smoke test passed:', { patientSessions: patientSessions.sessions.length, patients: patients.patients.length, detailSessions: detail.sessions.length, assessments: detail.assessments.length });
}

run().catch((error) => { console.error('API smoke test failed:', error.message); process.exit(1); });
