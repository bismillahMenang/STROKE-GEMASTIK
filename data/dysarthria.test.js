/**
 * Phase 2 synthetic audio signal tests.
 * Run: node --test data/dysarthria.test.js
 */

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeDysarthriaScore } = require('../client/utils/audioProcessing');

const fixturesDir = path.join(__dirname, 'test', 'fixtures');

function loadAudio(filename) {
  const buffer = fs.readFileSync(path.join(fixturesDir, filename));
  const samples = new Float32Array((buffer.length - 44) / 2);
  for (let index = 0; index < samples.length; index += 1) samples[index] = buffer.readInt16LE(44 + index * 2) / 32768;
  return samples;
}

function score(filename) { return computeDysarthriaScore(loadAudio(filename), 16000); }

test('normal speech 1 has a high clarity score', () => assert.ok(score('normal_speech_1.wav') > 0.85));
test('normal speech 2 has a high clarity score', () => assert.ok(score('normal_speech_2.wav') > 0.85));
test('normal speech 3 has a high clarity score', () => assert.ok(score('normal_speech_3.wav') > 0.85));
test('moderate dysarthria 1 stays in the moderate range', () => assert.ok(score('moderate_dysarthria_1.wav') >= 0.3 && score('moderate_dysarthria_1.wav') < 0.55));
test('moderate dysarthria 2 stays in the moderate range', () => assert.ok(score('moderate_dysarthria_2.wav') >= 0.3 && score('moderate_dysarthria_2.wav') < 0.55));
test('severe dysarthria is below the severe threshold', () => assert.ok(score('severe_dysarthria_1.wav') < 0.25));

test('synthetic sensitivity at threshold 0.4 detects abnormal fixtures', () => {
  const abnormal = ['moderate_dysarthria_1.wav', 'moderate_dysarthria_2.wav', 'severe_dysarthria_1.wav'];
  const detected = abnormal.filter((filename) => score(filename) <= 0.4);
  assert.equal(detected.length, abnormal.length);
});

test('synthetic specificity at threshold 0.4 keeps normal fixtures negative', () => {
  const normal = ['normal_speech_1.wav', 'normal_speech_2.wav', 'normal_speech_3.wav'];
  const falsePositives = normal.filter((filename) => score(filename) <= 0.4);
  assert.equal(falsePositives.length, 0);
});
