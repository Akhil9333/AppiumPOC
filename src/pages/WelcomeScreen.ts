import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { HealthyLivingScreen } from './HealthyLivingScreen.js';

const locators = {
  welcomeMessage: {
    android: "//*[@resource-id='txttheworldslargestsciencebased_001']",
    ios: "//*[@name='txttheworldslargestsciencebased_001']"
  },
  nextButton: {
    android: "//*[@resource-id='btn_btn_next']",
    ios: "//*[@name='btn_btn_next']"
  }
} as const;

export class WelcomeScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertWelcomeMessage(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.welcomeMessage.android, locators.welcomeMessage.ios),
      'The world’s largest science-based behavioural change program that rewards you for making healthier choices.'
    );
  }

  async openHealthyLiving(): Promise<HealthyLivingScreen> {
    await this.click(locators.nextButton.android, locators.nextButton.ios);
    return new HealthyLivingScreen(this.session);
  }
}
