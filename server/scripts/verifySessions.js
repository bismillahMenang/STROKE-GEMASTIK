require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status}: ${data.message || 'Request failed'}`);
  }
  return data;
}

async function run() {
  // Login as test patient
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'budi4@test.com',
      password: 'password123',
    }),
  });
  const token = loginRes.token;
  const headers = { Authorization: `Bearer ${token}` };

  // Create 3 sessions
  for (let i = 1; i <= 3; i++) {
    await request('/patient/sessions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date: `2026-08-${String(i).padStart(2, '0')}T10:00:00.000Z`,
        exercise: 'forearm_supination',
        peakRom: i * 10,
        avgRom: i * 8,
        repsCompleted: 10,
        consistency: 'high',
      }),
    });
  }

  // Get sessions
  const sessionsRes = await request('/patient/sessions?limit=8', { headers });
  const sessions = sessionsRes.sessions;

  console.log('Created and fetched', sessions.length, 'sessions');
  sessions.forEach((s) => {
    console.log(s.date, s.exercise, s.peakRom);
  });

  // Verify descending order
  const dates = sessions.map((s) => new Date(s.date).getTime());
  const isDescending = dates.every((val, i, arr) => i === 0 || val <= arr[i - 1]);
  console.log('Descending order:', isDescending);

  // Update notes on most recent session
  const updated = await request(`/patient/sessions/${sessions[0].id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ notes: 'Updated note from verify script' }),
  });
  console.log('Updated notes:', updated.session.notes);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
