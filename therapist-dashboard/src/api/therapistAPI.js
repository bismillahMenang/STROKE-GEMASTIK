import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 10000 });

function authConfig() {
  const token = localStorage.getItem('rehabtrack_therapist_token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function loginTherapist(email, password) {
  const response = await api.post('/auth/login-therapist', { email, password });
  return response.data;
}

export async function fetchPatients() {
  const response = await api.get('/therapist/patients', authConfig());
  return response.data.patients;
}

export async function fetchPatientDetail(patientId) {
  const response = await api.get(`/therapist/patients/${patientId}`, authConfig());
  return response.data;
}

export async function addWeeklyNote(patientId, weekNumber, note) {
  const response = await api.patch(`/therapist/patients/${patientId}/notes`, { weekNumber, ...note }, authConfig());
  return response.data.note;
}

export async function updateSessionReview(patientId, sessionId, reviewStatus) {
  const response = await api.patch(`/therapist/patients/${patientId}/sessions/${sessionId}/review`, { reviewStatus }, authConfig());
  return response.data.session;
}

export async function setPrescription(patientId, payload) {
  const response = await api.put(`/therapist/patients/${patientId}/prescription`, payload, authConfig());
  return response.data.prescription;
}

export function isUnauthorized(error) { return error.response?.status === 401; }
