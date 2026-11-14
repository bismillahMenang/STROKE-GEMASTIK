import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@rehabtrack/sessions';

export async function saveSession(session) {
  const sessions = await getSessions();
  const storedSession = {
    ...session,
    id: session.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pending: session.pending !== false,
    savedAt: session.savedAt || new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify([storedSession, ...sessions]));
  return storedSession;
}

export async function getSessions() {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse local sessions:', error);
    return [];
  }
}

export async function updateSession(id, changes) {
  const sessions = await getSessions();
  const updated = sessions.map((session) => (session.id === id ? { ...session, ...changes } : session));
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  return updated.find((session) => session.id === id);
}

export async function clearSessions() {
  await AsyncStorage.removeItem(SESSIONS_KEY);
}
