// Adherence metrics derived from saved sessions. Pure functions over the
// local session list so they can be reasoned about without a device.

// Local calendar day, e.g. "2026-08-14". Deliberately LOCAL, not UTC: a
// patient's "today" is their own midnight, not Greenwich's.
export function dayKey(ms) {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

// Shift by whole calendar days. Uses setDate so DST and month ends stay correct.
function addDays(ms, delta) {
  const d = new Date(ms);
  d.setDate(d.getDate() + delta);
  return d.getTime();
}

// Streak = consecutive calendar days with at least one session. Every session
// counts, including one ended with pain 'stopped': showing up is the behaviour
// we reward — never rep count, never angle. Stopping because it hurts must
// never cost a patient their streak (RehabTrack guardrail).
export function computeStreak(sessions, now = Date.now()) {
  const days = new Set(sessions.map((session) => dayKey(new Date(session.date))));
  if (days.size === 0) return { current: 0, best: 0, practicedToday: false };

  const practicedToday = days.has(dayKey(now));

  let cursor = practicedToday ? now : addDays(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let prev = null;
  for (const key of [...days].sort()) {
    run = prev !== null && dayKey(addDays(parseDayKey(prev), 1)) === key ? run + 1 : 1;
    if (run > best) best = run;
    prev = key;
  }

  return { current, best, practicedToday };
}

/** Best peak ROM ever recorded, in degrees. 0 when there's nothing yet. */
export function bestRomDeg(sessions) {
  return sessions.reduce((max, session) => Math.max(max, session.peakRom || 0), 0);
}

/** Total reps completed across every session. */
export function totalReps(sessions) {
  return sessions.reduce((sum, session) => sum + (session.repsCompleted || 0), 0);
}