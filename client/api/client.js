import axios from 'axios';
import { API_URL } from '../utils/constants';
import { getSessions, updateSession } from '../utils/storage';

const TOKEN_KEY = '@rehabtrack/token';
const PATIENT_KEY = '@rehabtrack/patient';

export const apiClient = axios.create({ baseURL: API_URL, timeout: 10000 });

if (!API_URL) {
  console.warn('EXPO_PUBLIC_API_URL belum diatur. Permintaan API akan gagal.');
}

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
    pain: session.pain,
    avgSmoothness: session.avgSmoothness,
    ceilingHits: session.ceilingHits,
    prescriptionSource: session.prescriptionSource,
    notes: session.notes,
    gyroRawSampleCount: session.gyroRawSampleCount,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data.session;
}

// Best-effort read: returns the active prescription for one exercise, or null
// on ANY failure (offline, 404, timeout). Never throws.
export async function fetchPrescription(exerciseKey, token) {
  try {
    const response = await apiClient.get(`/patient/prescription?exercise=${encodeURIComponent(exerciseKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rx = response.data?.prescription;
    if (!rx) return null;
    return {
      targetRomDeg: Number(rx.targetRom),
      romCeilingDeg: Number(rx.romCeiling),
      targetReps: Number(rx.targetReps),
    };
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.warn('fetchPrescription failed:', error.message);
    return null;
  }
}

export async function fetchSessions(token) {
  const response = await apiClient.get('/patient/sessions?limit=8', { headers: { Authorization: `Bearer ${token}` } });
  return response.data.sessions;
}

export async function fetchNotes(token) {
  const response = await apiClient.get('/patient/notes?limit=8', { headers: { Authorization: `Bearer ${token}` } });
  return response.data.notes;
}

export async function syncPendingSessions(token) {
  const sessions = await getSessions();
  const pending = sessions.filter((session) => session.pending);
  let syncedCount = 0;

  for (const session of pending) {
    try {
      const uploaded = await uploadSession(session, token);
      await updateSession(session.id, { pending: false, serverId: uploaded.id, syncedAt: new Date().toISOString() });
      syncedCount += 1;
    } catch (error) {
      if (error.response?.status === 401) throw error;
      console.error(`Failed to sync session ${session.id}:`, error.message);
    }
  }

  return syncedCount;
}

export { PATIENT_KEY, TOKEN_KEY };
