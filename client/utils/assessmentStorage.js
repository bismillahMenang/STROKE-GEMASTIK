import AsyncStorage from '@react-native-async-storage/async-storage';

const ASSESSMENTS_KEY = '@pulihtrack/assessments';

export async function saveAssessment(assessment) {
  const assessments = await getAssessments();
  const stored = { ...assessment, id: assessment.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`, pending: assessment.pending !== false };
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify([stored, ...assessments]));
  return stored;
}

export async function getAssessments() {
  const raw = await AsyncStorage.getItem(ASSESSMENTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (error) { console.error('Failed to parse assessments:', error); return []; }
}

export async function updateAssessment(id, changes) {
  const assessments = await getAssessments();
  const updated = assessments.map((assessment) => assessment.id === id ? { ...assessment, ...changes } : assessment);
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(updated));
  return updated.find((assessment) => assessment.id === id);
}
