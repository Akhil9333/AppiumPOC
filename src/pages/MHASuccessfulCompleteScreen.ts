import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

export class MHASuccessfulCompleteScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertCompletionMessage(): Promise<void> {
    await this.assertTextContains(
      await this.element("//*[@resource-id='txtmentalwellbeingasessmentcomplete_001']", "//*[@name='txtmentalwellbeingasessmentcomplete_001']"),
      'Great work on completing your mental health assessment'
    );
  }

  async assertViewResultsButtonVisible(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='ctrl_btncontinuetofeedback_001']", "//*[@name='ctrl_btncontinuetofeedback_001']"),
      'View results'
    );
  }

  clickViewResults(): Promise<void> {
    return this.click("//*[@resource-id='btn_ctrl_btncontinuetofeedback_001']", "//*[@name='btn_ctrl_btncontinuetofeedback_001']");
  }
}
