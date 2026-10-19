import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';

const locators = {
  header: {
    android: "//*[@resource-id='txtmentalwellbeingassessment_001']",
    ios: "//*[@name='txtmentalwellbeingassessment_001']"
  },
  points: {
    android: "//*[@resource-id='txtpoints_001']",
    ios: "//*[@name='txtpoints_001']"
  },
  duration: {
    android: "//*[@resource-id='txttime005']",
    ios: "//*[@name='txttime005']"
  },
  startButton: {
    android: "//*[@resource-id='btnstartassessment_001'] | //*[@resource-id='btn_ctrl_btnstartassessment_001']",
    ios: "//*[@name='btnstartassessment_001'] | //*[@name='btn_ctrl_btnstartassessment_001']"
  },
  privacyUnderstandButton: {
    android: "//*[@resource-id='btn_vg_button_i_understand']",
    ios: "//*[@name='btn_vg_button_i_understand']"
  },
  completedDate: {
    android: "//*[@resource-id='txtcompleteddate_001']",
    ios: "//*[@name='txtcompleteddate_001']"
  },
  riskType: {
    android: "//*[@resource-id='vg_risk_text']",
    ios: "//*[@name='vg_risk_text']"
  }
} as const;

export class MHALandingScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertMHAScreenHeader(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.header.android, locators.header.ios),
      'Mental health assessment'
    );
  }

  async assertMHAInitPoints(): Promise<void> {
    await this.assertTextEquals(await this.element(locators.points.android, locators.points.ios), '0/600 POINTS');
  }

  async assertTimeInit(): Promise<void> {
    await this.assertTextEquals(await this.element(locators.duration.android, locators.duration.ios), 'Takes 5 minutes to complete');
  }

  async isVisibleMHAStartButton(): Promise<boolean> {
    return this.isVisible(
      locators.startButton.android,
      locators.startButton.ios
    );
  }

  clickMHAStartButton(): Promise<void> {
    return this.click(
      locators.startButton.android,
      locators.startButton.ios
    );
  }

  clickIundertandOnDataPrivacyScreen(): Promise<void> {
    return this.click(locators.privacyUnderstandButton.android, locators.privacyUnderstandButton.ios);
  }

  async assertLowRiskPointsUpdated(): Promise<void> {
    await this.assertTextContains(await this.element(locators.points.android, locators.points.ios), '300/600 POINTS');
  }

  async assertCompltedDate(): Promise<void> {
    await this.assertTextContains(await this.element(locators.completedDate.android, locators.completedDate.ios), 'Completed:');
  
  }
  async assertRiskType(expectedRisk: 'Low risk' | 'Moderate risk' | 'High risk'): Promise<void> {
    await this.assertTextContains(await this.element(locators.riskType.android, locators.riskType.ios), expectedRisk);
  }
}
  