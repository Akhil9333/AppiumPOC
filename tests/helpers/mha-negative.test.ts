import assert from 'node:assert/strict';
import { test } from 'node:test';
import { _setGlobal } from '@wdio/globals';
import { MHAQuestionsScreen } from '../../src/pages/MHAQuestionsScreen.js';
import { MobileSession } from '../../src/utils/Mobile Utils_Scrolll_Xpath_Timeout.js';

for (const platform of ['Android', 'iOS'] as const) {
  for (const enabled of [false, true]) {
    test(`${platform} unanswered question ${enabled ? 'rejects enabled' : 'accepts disabled'} Next`, async t => {
      const session = new MobileSession(platform);
      const selectors: string[] = [];
      _setGlobal('$', async (selector: string) => {
        selectors.push(selector);
        return {
          isDisplayed: async () => true,
          getAttribute: async () => 'First question',
          isEnabled: async () => enabled
        };
      });
      const click = t.mock.method(session, 'clickElement', async () => {});
      const assertion = new MHAQuestionsScreen(session).assertUnansweredQuestionNextDisabled('First question');
      if (enabled) await assert.rejects(assertion, /MHA Next must be disabled/);
      else await assertion;
      assert.ok(selectors.some(selector => selector.includes('btn_vg_next_button')));
      assert.equal(selectors.some(selector => selector.includes('btn_vg_submit_button')), false);
      assert.equal(click.mock.callCount(), 0);
      if (!enabled) {
        assert.equal(selectors.filter(selector => selector.includes('question_0')).length, 2);
      }
    });
  }

  test(`${platform} partial exit verifies confirmation before selecting Yes`, async t => {
    const session = new MobileSession(platform);
    const clicks: string[] = [];
    const prefix = platform === 'Android' ? 'resource-id' : 'name';
    t.mock.method(session, 'clickElement', async (selector: string) => { clicks.push(selector); });
    _setGlobal('$', async () => ({
      isDisplayed: async () => true,
      getAttribute: async () => 'Are you sure you want to exit this assessment?'
    }));
    const screen = new MHAQuestionsScreen(session);
    await screen.closeAssessment();
    await screen.confirmAssessmentExit();
    assert.deepEqual(clicks, [
      `//*[@${prefix}='vg_close_button']`,
      `//*[@${prefix}='ctrl_txtyes_001']`
    ]);
  });

  test(`${platform} partial exit rejects an unexpected confirmation dialog`, async t => {
    const session = new MobileSession(platform);
    const click = t.mock.method(session, 'clickElement', async () => {});
    _setGlobal('$', async () => ({
      isDisplayed: async () => true,
      getAttribute: async () => 'Unexpected dialog'
    }));
    await assert.rejects(new MHAQuestionsScreen(session).confirmAssessmentExit(), /Mobile element text did not match/);
    assert.equal(click.mock.callCount(), 0);
  });
}
