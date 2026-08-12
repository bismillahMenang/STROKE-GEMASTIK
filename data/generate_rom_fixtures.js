/**
 * Generate 45 deterministic gyroscope fixtures for Phase 2 exercises.
 * The readings are angular velocity in rad/s, matching calculateROM().
 * Run: node data/generate_rom_fixtures.js
 */

const fs = require('fs');
const path = require('path');
const { calculateROM } = require('../client/utils/gyroProcessing');

const fixturesDir = path.join(__dirname, 'test', 'fixtures');
const sampleRate = 100;
const samplingInterval = 1 / sampleRate;
const targets = { wrist_flexion: 60, finger_extension: 30, resistance_band_row: 45 };
fs.mkdirSync(fixturesDir, { recursive: true });

function generateReadings(exercise, quality, seed) {
  let state = seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
  const peak = targets[exercise] * (quality === 'impaired' ? 0.5 : 1);
  const readings = [];
  for (let index = 0; index < sampleRate * 10; index += 1) {
    const phaseSample = index % sampleRate;
    let degreesPerSecond = 0;
    if (phaseSample < 30) degreesPerSecond = peak / 0.3;
    else if (phaseSample < 60) degreesPerSecond = -peak / 0.3;
    const noise = (random() - 0.5) * (quality === 'impaired' ? 0.03 : 0.01);
    readings.push((degreesPerSecond + noise) * (Math.PI / 180));
  }
  return readings;
}

const exercises = Object.keys(targets);
let total = 0;
for (const [exerciseIndex, exercise] of exercises.entries()) {
  for (const quality of ['normal', 'impaired']) {
    const count = quality === 'normal' ? 10 : 5;
    for (let index = 0; index < count; index += 1) {
      const readings = generateReadings(exercise, quality, exerciseIndex * 1000 + index + (quality === 'impaired' ? 100 : 0));
      const metrics = calculateROM(readings, samplingInterval);
      const filename = `rom_${exercise}_${quality}_${String(index + 1).padStart(2, '0')}.json`;
      fs.writeFileSync(path.join(fixturesDir, filename), `${JSON.stringify({ metadata: { exercise, quality, sampleRate, targetRom: targets[exercise], synthetic: true }, readings, metrics }, null, 2)}\n`);
      total += 1;
      if (index === 0) console.log(`- ${filename}: peak ${metrics.peakRom}°`);
    }
  }
}
console.log(`Generated ${total} ROM fixtures in ${fixturesDir}`);
