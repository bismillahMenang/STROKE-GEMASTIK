const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeEmail,
  isValidEmail,
  isStrongEnoughPassword,
} = require('../utils/validation');

test('normalizeEmail trims and lowercases', () => {
  assert.equal(normalizeEmail('  Budi.Demo@Example.COM '), 'budi.demo@example.com');
  assert.equal(normalizeEmail(undefined), '');
  assert.equal(normalizeEmail(null), '');
});

test('isValidEmail accepts normal addresses and rejects malformed ones', () => {
  assert.equal(isValidEmail('budi.demo@example.com'), true);
  assert.equal(isValidEmail('budi@example'), false);
  assert.equal(isValidEmail('budi example.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('isStrongEnoughPassword requires at least 8 characters', () => {
  assert.equal(isStrongEnoughPassword('12345678'), true);
  assert.equal(isStrongEnoughPassword('1234567'), false);
  assert.equal(isStrongEnoughPassword(undefined), false);
});
