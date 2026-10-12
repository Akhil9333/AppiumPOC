import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { HealthyLivingScreen } from './HealthyLivingScreen.js';

export class WelcomeScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertWelcomeMessage(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='txttheworldslargestsciencebased_001']", "//*[@name='txttheworldslargestsciencebased_001']"),
      'The world’s largest science-based behavioural change program that rewards you for making healthier choices.'
    );
  }

  async openHealthyLiving(): Promise<HealthyLivingScreen> {
    await this.click("//*[@resource-id='btn_btn_next']", "//*[@name='btn_btn_next']");
    return new HealthyLivingScreen(this.session);
  }
}
