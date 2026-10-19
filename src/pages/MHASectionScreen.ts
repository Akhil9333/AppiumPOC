import assert from 'node:assert/strict';
import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

const locators = {
  startButton: {
    android: "//*[@resource-id='btnstartassessment_001']",
    ios: "//*[@name='btnstartassessment_001']"
  },
  startSectionButton: {
    android: "//*[@resource-id='btn_ctrl_btnstart_001']",
    ios: "//*[@name='btn_ctrl_btnstart_001']"
  },
  header: {
    android: "//*[@resource-id='txtmentalwellbeingassessment_001']",
    ios: "//*[@name='txtmentalwellbeingassessment_001']"
  }
} as const;

export class MHASectionScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertStartButtonEnabled(): Promise<void> {
    const startButton = await this.element(locators.startButton.android, locators.startButton.ios);
    assert.ok(await startButton.isEnabled(), 'MHA Start button is enabled');
  }

  clickStartButton(): Promise<void> {
    return this.click(locators.startSectionButton.android, locators.startSectionButton.ios);
  }

  async assertMHAScreenHeader(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.header.android, locators.header.ios),
      'Mental health assessment'
    );
  }
}
