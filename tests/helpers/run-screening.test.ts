import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeEnvironment } from '../../scripts/run-screening.js';

test('screening runner normalizes environment names and menu choices', () => {
  assert.equal(normalizeEnvironment('1'), 'mdev');
  assert.equal(normalizeEnvironment('MDEV'), 'mdev');
  assert.equal(normalizeEnvironment('2'), 'ca-test');
  assert.equal(normalizeEnvironment('CATEST'), 'ca-test');
  assert.equal(normalizeEnvironment('ca_test'), 'ca-test');
  assert.equal(normalizeEnvironment('3'), 'ca-dev');
  assert.equal(normalizeEnvironment('CA-DEV'), 'ca-dev');
  assert.equal(normalizeEnvironment('production'), undefined);
});
