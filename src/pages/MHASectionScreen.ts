import assert from 'node:assert/strict';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

export class MHASectionScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertStartButtonEnabled(): Promise<void> {
    const startButton = await this.element("//*[@resource-id='btnstartassessment_001']", "//*[@name='btnstartassessment_001']");
    assert.ok(await startButton.isEnabled(), 'MHA Start button is enabled');
  }

  clickStartButton(): Promise<void> {
    return this.click("//*[@resource-id='btn_ctrl_btnstart_001']", "//*[@name='btn_ctrl_btnstart_001']");
  }

  async assertMHAScreenHeader(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='txtmentalwellbeingassessment_001']", "//*[@name='txtmentalwellbeingassessment_001']"),
      'Mental health assessment'
    );
  }
}
