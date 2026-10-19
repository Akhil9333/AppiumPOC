import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

const locators = {
  completionMessage: {
    android: "//*[@resource-id='txtmentalwellbeingasessmentcomplete_001']",
    ios: "//*[@name='txtmentalwellbeingasessmentcomplete_001']"
  },
  viewResultsText: {
    android: "//*[@resource-id='ctrl_btncontinuetofeedback_001']",
    ios: "//*[@name='ctrl_btncontinuetofeedback_001']"
  },
  viewResultsButton: {
    android: "//*[@resource-id='btn_ctrl_btncontinuetofeedback_001']",
    ios: "//*[@name='btn_ctrl_btncontinuetofeedback_001']"
  }
} as const;

export class MHASuccessfulCompleteScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertCompletionMessage(): Promise<void> {
    await this.assertTextContains(
      await this.element(locators.completionMessage.android, locators.completionMessage.ios),
      'Great work on completing your mental health assessment'
    );
  }

  async assertViewResultsButtonVisible(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.viewResultsText.android, locators.viewResultsText.ios),
      'View results'
    );
  }

  clickViewResults(): Promise<void> {
    return this.click(locators.viewResultsButton.android, locators.viewResultsButton.ios);
  }
}
