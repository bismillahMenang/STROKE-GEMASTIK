import axios from 'axios';
import { API_URL } from '../utils/constants';
import { getSessions, updateSession } from '../utils/storage';
import { getAssessments, updateAssessment } from '../utils/assessmentStorage';

const TOKEN_KEY = '@pulihtrack/token';
const PATIENT_KEY = '@pulihtrack/patient';

export const apiClient = axios.create({ baseURL: API_URL, timeout: 10000 });

export async function registerPatient(payload) {
  const response = await apiClient.post('/auth/register-patient', payload);
  return response.data;
}

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  const patient = await getMe(response.data.token);
  return { ...response.data, patient };
}

export async function getMe(token) {
  const response = await apiClient.get('/patient/me', { headers: { Authorization: `Bearer ${token}` } });
  return response.data.patient;
}

export async function uploadSession(session, token) {
  const response = await apiClient.post('/patient/sessions', {
    date: session.date,
    exercise: session.exercise,
    peakRom: session.peakRom,
    avgRom: session.avgRom,
    repsCompleted: session.repsCompleted,
    consistency: session.consistency,
    notes: session.notes,
    gyroRawSampleCount: session.gyroRawSampleCount,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.session;
}

export async function fetchSessions(token) {
  const response = await apiClient.get('/patient/sessions?limit=8', { headers: { Authorization: `Bearer ${token}` } });
  return response.data.sessions;
}

export async function uploadAssessment(assessment, token) {
  const response = await apiClient.post('/patient/assessments', {
    date: assessment.date,
    type: assessment.type,
    score: assessment.score,
    risk: assessment.risk,
    modelVersion: assessment.modelVersion,
    consentedAt: assessment.consentedAt,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.assessment;
}

export async function syncPendingAssessments(token) {
  const assessments = await getAssessments();
  for (const assessment of assessments.filter((item) => item.pending)) {
    try {
      const uploaded = await uploadAssessment(assessment, token);
      await updateAssessment(assessment.id, { pending: false, serverId: uploaded._id });
    } catch (error) {
      if (error.response?.status === 401) throw error;
      console.error(`Failed to sync assessment ${assessment.id}:`, error.message);
    }
  }
}

export async function syncPendingSessions(token) {
  const sessions = await getSessions();
  const pending = sessions.filter((session) => session.pending);
  let syncedCount = 0;

  for (const session of pending) {
    try {
      const uploaded = await uploadSession(session, token);
      await updateSession(session.id, { pending: false, serverId: uploaded._id, syncedAt: new Date().toISOString() });
      syncedCount += 1;
    } catch (error) {
      if (error.response?.status === 401) throw error;
      console.error(`Failed to sync session ${session.id}:`, error.message);
    }
  }

  return syncedCount;
}

export { PATIENT_KEY, TOKEN_KEY };
