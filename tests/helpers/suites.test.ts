import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { suites } from '../../src/config/runner.js';

test('smoke pack selects only login/logout and high-risk MHA', () => {
  assert.deepEqual(suites.smoke, [
    './tests/smoke/login-logout.spec.ts',
    './tests/smoke/mha-high-risk.spec.ts'
  ]);
});

test('regression pack selects only password lockout and low-risk MHA', () => {
  assert.deepEqual(suites.regression, [
    './tests/regression/incorrect-password-lockout.spec.ts',
    './tests/regression/mha-low-risk.spec.ts'
  ]);
});

test('packs contain distinct existing specs in separate worker entries', () => {
  const files = Object.values(suites).flat();
  assert.equal(new Set(files).size, 4);
  for (const pack of Object.values(suites)) {
    assert.equal(pack.length, 2);
    for (const file of pack) {
      assert.equal(typeof file, 'string');
      assert.ok(existsSync(new URL(`../../${file}`, import.meta.url)), file);
    }
  }
});
