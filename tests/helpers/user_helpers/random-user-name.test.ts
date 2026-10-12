import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRandomUserName } from '../../src/config/randomUserName.js';

test('random user names contain valid first and last names', () => {
  for (let index = 0; index < 100; index++) {
    const name = createRandomUserName();
    assert.deepEqual(Object.keys(name), ['firstName', 'lastName']);
    assert.ok(['James', 'Daniel', 'Oliver', 'Ethan', 'Noah', 'Lucas', 'Adam', 'Thomas'].includes(name.firstName));
    assert.ok(['Smith', 'Taylor', 'Brown', 'Wilson', 'Walker', 'Hall', 'Young', 'Clark'].includes(name.lastName));
  }
});
