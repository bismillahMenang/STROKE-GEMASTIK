// Node regression check for the pure metric functions (no phone needed).
// Run with: node scripts/metrics-check.js
// Covers gyroProcessing (integration, consistency, smoothness, per-rep
// metrics) and mockAngle. streak.js is ESM and is validated by the app bundle.

const assert = require('assert');
const { calculateROM, calculateConsistency, calculateSmoothness, computeRepMetrics, averageSmoothness } = require('../utils/gyroProcessing');
const { summarizeExerciseSessions } = require('../utils/progressMetrics');
const { mockRoll, makeMockSamples } = require('../utils/mockAngle');

// --- mockAngle: sweep covers ±80° -------------------------------------------
assert.ok(Math.abs(mockRoll(0)) < 1e-9, 'mockRoll starts at 0');
assert.ok(Math.abs(mockRoll(600 * Math.PI / 2) - 80) < 1e-9, 'mockRoll peaks at +80');
assert.ok(Math.abs(mockRoll(600 * 3 * Math.PI / 2) - (-80)) < 1e-9, 'mockRoll troughs at -80');
const samples = makeMockSamples(5, 100);
assert.strictEqual(samples.length, 61, 'makeMockSamples yields 5 periods');
console.log('mockAngle OK');

// --- calculateROM on the mock stream ----------------------------------------
// The mock is an angle trace, not raw gyro; feed gyro readings derived from it
// so the integration path is exercised end to end.
const dtSec = 0.1;
const gyroZ = [];
let prev = mockRoll(0);
for (let t = 100; t <= 6000; t += 100) {
  const value = mockRoll(t);
  gyroZ.push((value - prev) / dtSec * (Math.PI / 180)); // deg/s -> rad/s
  prev = value;
}
const rom = calculateROM(gyroZ, dtSec);
assert.ok(rom.peakRom > 70 && rom.peakRom <= 85, `peak ROM ~80, got ${rom.peakRom}`);
assert.ok(['low', 'medium', 'high'].includes(rom.consistency), 'consistency is a valid level');
console.log(`calculateROM OK (peak=${rom.peakRom}, avg=${rom.avgRom}, consistency=${rom.consistency})`);

// --- consistency: regular peaks -> high -------------------------------------
const regular = Array.from({ length: 200 }, (_, i) => 10 + 8 * Math.sin(i / 4));
assert.strictEqual(calculateConsistency(regular), 'high', 'regular peaks are consistent');
console.log('calculateConsistency OK');

// --- smoothness: smooth sine is smooth, jittery signal is not --------------
const smoothTrace = Array.from({ length: 200 }, (_, i) => 80 * Math.sin(i / 20));
const jitteryTrace = smoothTrace.map((v, i) => v + (i % 2 === 0 ? 6 : -6));
const smoothScore = calculateSmoothness(smoothTrace);
const jitterScore = calculateSmoothness(jitteryTrace);
assert.ok(smoothScore > 0.9, `smooth sine scores high, got ${smoothScore.toFixed(3)}`);
assert.ok(jitterScore < smoothScore * 0.5, `jittery scores clearly lower, got ${jitterScore.toFixed(3)}`);
console.log(`calculateSmoothness OK (smooth=${smoothScore.toFixed(3)}, jittery=${jitterScore.toFixed(3)})`);

// --- per-rep metrics ---------------------------------------------------------
// One rep = sweep up 0..+80 then back; end indices split the trace.
const repEnds = [40, 80, 120];
const perReps = computeRepMetrics(smoothTrace, repEnds, dtSec);
assert.strictEqual(perReps.length, 3, 'three reps produced');
assert.ok(perReps.every((r) => r.peakRomDeg > 0 && r.durationMs > 0), 'per-rep metrics populated');
assert.ok(perReps.every((r) => r.smoothness > 0 && r.smoothness <= 1), 'per-rep smoothness in 0..1');
const avg = averageSmoothness(perReps, smoothTrace);
assert.ok(avg > 0 && avg <= 1, `average smoothness in 0..1, got ${avg.toFixed(3)}`);
console.log('computeRepMetrics OK');

// --- daily exercise summary ------------------------------------------------
const daySessions = [
  { exercise: 'wrist_flexion', peakRom: 40, avgSmoothness: 0.8 },
  { exercise: 'wrist_flexion', peakRom: 50, avgSmoothness: undefined },
  { exercise: 'wrist_flexion', peakRom: 45, avgSmoothness: 0.6 },
  { exercise: 'elbow_flexion', peakRom: 120, avgSmoothness: 0.9 },
];
const wristDay = summarizeExerciseSessions(daySessions, 'wrist_flexion');
assert.strictEqual(wristDay.count, 3, 'only the selected exercise is counted');
assert.strictEqual(wristDay.bestRom, 50, 'best ROM comes from the selected exercise');
assert.ok(Math.abs(wristDay.avgSmoothness - 0.7) < 1e-9, 'invalid smoothness is excluded from the average');
console.log('summarizeExerciseSessions OK');

console.log('\nAll metric checks passed.');
process.exit(0);