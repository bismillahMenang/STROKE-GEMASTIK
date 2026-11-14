// Aggregates one day's sessions for the exercise the patient is currently
// viewing. Kept as a pure CommonJS module so the Node metric check can import
// it without the React Native runtime.
function summarizeExerciseSessions(sessions, exerciseKey) {
  const exerciseSessions = sessions.filter((session) => session.exercise === exerciseKey);

  const smoothnessValues = exerciseSessions
    .map((session) => session.avgSmoothness)
    .filter((value) => Number.isFinite(value));

  const totalSmoothness = smoothnessValues.reduce((sum, value) => sum + value, 0);
  const bestRom = exerciseSessions.reduce(
    (max, session) => Math.max(max, session.peakRom || 0),
    0,
  );

  return {
    sessions: exerciseSessions,
    count: exerciseSessions.length,
    bestRom,
    avgSmoothness: smoothnessValues.length ? totalSmoothness / smoothnessValues.length : 0,
  };
}

module.exports = { summarizeExerciseSessions };
