// Fake forearm supination/pronation so metrics can be built WITHOUT a phone.
// Pass an increasing time (ms) and get a smooth -80°..+80° sweep back and forth
// (PulihGo mockAngle.ts).

function mockRoll(tMs) {
  return 80 * Math.sin(tMs / 600);
}

// Convenience: generate a stream of samples to unit-test the rep detector.
function makeMockSamples(reps = 5, dtMs = 100) {
  const out = [];
  const periodMs = 1200; // one back-and-forth
  const total = reps * periodMs;
  for (let t = 0; t <= total; t += dtMs) out.push({ t, value: mockRoll(t) });
  return out;
}

module.exports = { mockRoll, makeMockSamples };