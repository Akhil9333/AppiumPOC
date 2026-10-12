import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { sessionNameForSpecs, setSessionNameFromSpecs } from '../../src/config/mobileSessionInit.js';

test('parallel workers name their sessions from their assigned specs', () => {
  const login: WebdriverIO.Capabilities = { 'LT:Options': { name: 'loginAndLogout', build: 'smoke' } };
  const mha: WebdriverIO.Capabilities = { 'LT:Options': { name: 'loginAndLogout', build: 'smoke' } };
  setSessionNameFromSpecs(login, ['./tests/smoke/login-logout.spec.ts']);
  setSessionNameFromSpecs(mha, ['./tests/smoke/mha-high-risk.spec.ts']);
  assert.deepEqual(login['LT:Options'], {
    name: sessionNameForSpecs(['./tests/smoke/login-logout.spec.ts']), build: 'smoke'
  });
  assert.deepEqual(mha['LT:Options'], {
    name: sessionNameForSpecs(['./tests/smoke/mha-high-risk.spec.ts']), build: 'smoke'
  });
  assert.notEqual(login['LT:Options']?.name, mha['LT:Options']?.name);
});

test('file URLs with spaces resolve to the spec filename', () => {
  const file = './tests/smoke/mha-high-risk.spec.ts';
  assert.equal(sessionNameForSpecs([pathToFileURL(resolve(file)).href]), sessionNameForSpecs([file]));
});

test('custom test names remain distinct by spec', () => {
  const previous = process.env.LT_TEST_NAME;
  try {
    process.env.LT_TEST_NAME = 'MDEV iOS smoke';
    assert.equal(sessionNameForSpecs(['./tests/smoke/login-logout.spec.ts']), 'MDEV iOS smoke - login-logout');
    assert.equal(sessionNameForSpecs(['./tests/smoke/mha-high-risk.spec.ts']), 'MDEV iOS smoke - mha-high-risk');
  } finally {
    if (previous === undefined) delete process.env.LT_TEST_NAME;
    else process.env.LT_TEST_NAME = previous;
  }
});

test('missing, grouped, or invalid specs and missing cloud options fail explicitly', () => {
  assert.throws(() => sessionNameForSpecs([]), /exactly one spec/);
  assert.throws(() => sessionNameForSpecs(['one.spec.ts', 'two.spec.ts']), /exactly one spec/);
  assert.throws(() => sessionNameForSpecs(['file.ts']), /Expected a .spec.ts/);
  assert.throws(() => setSessionNameFromSpecs({}, ['login-logout.spec.ts']), /LT:Options/);
});
