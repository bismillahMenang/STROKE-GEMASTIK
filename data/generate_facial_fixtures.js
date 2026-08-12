/**
 * Generate deterministic 468-point facial fixtures for the Phase 2 smoke suite.
 * These are synthetic geometry fixtures, not clinical patient data.
 * Run: node data/generate_facial_fixtures.js
 */

const fs = require('fs');
const path = require('path');
const { calculateAsymmetryScore } = require('../client/utils/faceMetrics');

const fixturesDir = path.join(__dirname, 'test', 'fixtures');
fs.mkdirSync(fixturesDir, { recursive: true });

function generateFace(asymmetryDegree) {
  const landmarks = [];
  for (let index = 0; index < 234; index += 1) {
    const y = 0.12 + (index / 233) * 0.76;
    const offset = 0.06 + ((index * 53) % 260) / 1000;
    const leftOffset = offset * (1 - asymmetryDegree);
    landmarks.push({ x: Number((0.5 - leftOffset).toFixed(6)), y: Number(y.toFixed(6)), z: 0 });
    landmarks.push({ x: Number((0.5 + offset).toFixed(6)), y: Number(y.toFixed(6)), z: 0 });
  }
  return landmarks;
}

const fixtures = [
  ['normal_face_1.json', 'Synthetic symmetric face', 0],
  ['normal_face_2.json', 'Synthetic symmetric face with tiny variation', 0.03],
  ['normal_face_3.json', 'Synthetic symmetric face with small variation', 0.05],
  ['moderate_asymmetry_1.json', 'Synthetic moderate left-side asymmetry', 0.45],
  ['moderate_asymmetry_2.json', 'Synthetic moderate pronounced asymmetry', 0.55],
  ['severe_asymmetry_1.json', 'Synthetic severe left-side asymmetry', 0.9],
];

console.log('Generating 6 facial landmark fixtures...');
for (const [name, description, asymmetryDegree] of fixtures) {
  const landmarks = generateFace(asymmetryDegree);
  const expectedScore = calculateAsymmetryScore(landmarks);
  const output = {
    metadata: {
      name,
      description,
      generated_by: 'generate_facial_fixtures.js',
      asymmetry_degree_simulated: asymmetryDegree,
      expected_asymmetry_score: expectedScore,
      notes: 'Synthetic geometry only; not a clinical validation dataset.',
    },
    landmarks,
  };
  fs.writeFileSync(path.join(fixturesDir, name), `${JSON.stringify(output, null, 2)}\n`);
  console.log(`- ${name}: score ${expectedScore}`);
}
console.log(`Fixtures written to ${fixturesDir}`);
