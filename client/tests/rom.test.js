/**
 * Phase 2 synthetic ROM tests for the three added exercises.
 * Run: node --test client/tests/rom.test.js
 */

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateROM } = require('../utils/gyroProcessing');

const fixturesDir = path.join(__dirname, 'fixtures');

function loadFixture(filename) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, filename), 'utf8')).readings;
}

function peak(exercise, quality) {
  return calculateROM(loadFixture(`rom_${exercise}_${quality}_01.json`), 0.01).peakRom;
}

test('normal wrist flexion reaches the provisional 60° target', () => assert.ok(peak('wrist_flexion', 'normal') >= 58 && peak('wrist_flexion', 'normal') <= 62));
test('impaired wrist flexion is approximately half range', () => assert.ok(peak('wrist_flexion', 'impaired') >= 28 && peak('wrist_flexion', 'impaired') <= 32));
test('normal finger extension reaches the provisional 30° target', () => assert.ok(peak('finger_extension', 'normal') >= 28 && peak('finger_extension', 'normal') <= 32));
test('impaired finger extension is approximately half range', () => assert.ok(peak('finger_extension', 'impaired') >= 13 && peak('finger_extension', 'impaired') <= 17));
test('normal resistance-band row reaches the provisional 45° target', () => assert.ok(peak('resistance_band_row', 'normal') >= 43 && peak('resistance_band_row', 'normal') <= 47));
test('impaired resistance-band row is approximately half range', () => assert.ok(peak('resistance_band_row', 'impaired') >= 20 && peak('resistance_band_row', 'impaired') <= 25));
test('wrist flexion separates normal from impaired', () => assert.ok(peak('wrist_flexion', 'normal') > peak('wrist_flexion', 'impaired')));
test('finger extension separates normal from impaired', () => assert.ok(peak('finger_extension', 'normal') > peak('finger_extension', 'impaired')));
test('resistance-band row separates normal from impaired', () => assert.ok(peak('resistance_band_row', 'normal') > peak('resistance_band_row', 'impaired')));
