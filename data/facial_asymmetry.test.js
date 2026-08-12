/**
 * Phase 2 synthetic facial geometry tests.
 * Run: node --test data/facial_asymmetry.test.js
 */

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateAsymmetryScore } = require('../client/utils/faceMetrics');

const fixturesDir = path.join(__dirname, 'test', 'fixtures');

function loadFixture(filename) {
  const content = fs.readFileSync(path.join(fixturesDir, filename), 'utf8');
  return JSON.parse(content);
}

function score(filename) {
  return calculateAsymmetryScore(loadFixture(filename).landmarks);
}

test('normal face 1 remains symmetric', () => assert.ok(score('normal_face_1.json') < 0.02));
test('normal face 2 remains symmetric', () => assert.ok(score('normal_face_2.json') < 0.02));
test('normal face 3 remains symmetric', () => assert.ok(score('normal_face_3.json') < 0.02));
test('moderate asymmetry 1 stays in the moderate range', () => assert.ok(score('moderate_asymmetry_1.json') >= 0.1 && score('moderate_asymmetry_1.json') < 0.18));
test('moderate asymmetry 2 stays in the moderate range', () => assert.ok(score('moderate_asymmetry_2.json') >= 0.1 && score('moderate_asymmetry_2.json') < 0.18));
test('severe asymmetry exceeds the high-risk threshold', () => assert.ok(score('severe_asymmetry_1.json') >= 0.18));

test('synthetic sensitivity at threshold 0.1 detects all abnormal fixtures', () => {
  const abnormal = ['moderate_asymmetry_1.json', 'moderate_asymmetry_2.json', 'severe_asymmetry_1.json'];
  const detected = abnormal.filter((filename) => score(filename) >= 0.1);
  assert.equal(detected.length, abnormal.length);
});

test('synthetic specificity at threshold 0.1 keeps normal fixtures negative', () => {
  const normal = ['normal_face_1.json', 'normal_face_2.json', 'normal_face_3.json'];
  const falsePositives = normal.filter((filename) => score(filename) >= 0.1);
  assert.equal(falsePositives.length, 0);
});
