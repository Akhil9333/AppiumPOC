import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { LoginScreen } from './LoginScreen.js';

const locators = {
  healthyLivingMessage: {
    android: "//*[@resource-id='reg_welcome_txthealthliv_001']",
    ios: "//*[@name='reg_welcome_txthealthliv_001']"
  },
  loginButton: {
    android: "//*[@resource-id='ctrl_btnlogin_001']",
    ios: "//*[@name='ctrl_btnlogin_001']"
  }
} as const;

export class HealthyLivingScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertHealthyLivingMessage(): Promise<void> {
    await this.assertTextEquals(
      await this.element(locators.healthyLivingMessage.android, locators.healthyLivingMessage.ios),
      'Healthy living has never been this rewarding'
    );
  }

  async openLogin(): Promise<LoginScreen> {
    await this.click(locators.loginButton.android, locators.loginButton.ios);
    return new LoginScreen(this.session);
  }
}
