import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { processEvents } from '../../../src/config/API-to-Create-New-User.js';

const partyId = 40_189_132;
const expectedTimestamp = '2026-10-10T08:11:57.000+02:00';
const settings = {
  VG_ENVIRONMENT: 'mdev',
  VG_MDEV_INTEGRATION_PLATFORM_BASE_URL: 'https://example.invalid/api/',
  VG_MDEV_TENANT_NUMBER: '9998',
  VG_MDEV_API_BEARER_TOKEN: 'test-bearer-token'
};

function configureTestEnvironment(t: TestContext): void {
  for (const [key, value] of Object.entries(settings)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }
  t.mock.method(Date, 'now', () => Date.parse('2026-10-10T06:11:57.456Z'));
}

function expectedRequestBody() {
  return {
    processEventsRequest: {
      eventIn: [{
        applicableTo: partyId,
        eventCapturedOn: expectedTimestamp,
        eventMetaData: [{ typeKey: 197, value: 1001 }],
        eventOccuredOn: expectedTimestamp,
        eventSourceTypeKey: 1,
        reportedBy: partyId,
        typeKey: 1016
      }]
    }
  };
}

test('processEvents sends the expected request and returns a successful response', async t => {
  configureTestEnvironment(t);
  const successResponse = Response.json({ processed: true });
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    assert.equal(url, 'https://example.invalid/api/vitality-manage-events-service-v1/1.0/svc/9998/processEvents');
    assert.equal(init.method, 'POST');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('Authorization'), 'Bearer test-bearer-token');
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(String(init.body)), expectedRequestBody());
    return successResponse;
  });

  const response = await processEvents(partyId);

  assert.equal(response, successResponse);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('processEvents reports unsuccessful HTTP responses', async t => {
  configureTestEnvironment(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async (_url: string, _init: RequestInit) => (
    new Response(null, { status: 400 })
  ));

  for (const status of [400, 401, 500]) {
    fetchMock.mock.mockImplementation(async () => Response.json({}, { status }));
    await assert.rejects(processEvents(partyId), new RegExp(`failed with HTTP ${status}`));
  }

  assert.equal(fetchMock.mock.callCount(), 3);
});

test('processEvents rejects invalid party IDs without making a request', async t => {
  configureTestEnvironment(t);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ processed: true }));

  for (const id of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(processEvents(id), /positive integer enrolment party ID/);
  }

  assert.equal(fetchMock.mock.callCount(), 0);
});

test('processEvents rejects a missing bearer token without making a request', async t => {
  configureTestEnvironment(t);
  process.env.VG_MDEV_API_BEARER_TOKEN = '******';
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ processed: true }));

  await assert.rejects(processEvents(partyId), /before processing events/);
  assert.equal(fetchMock.mock.callCount(), 0);
});
