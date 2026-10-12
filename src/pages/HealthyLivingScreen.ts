import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { LoginScreen } from './LoginScreen.js';

export class HealthyLivingScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async assertHealthyLivingMessage(): Promise<void> {
    await this.assertTextEquals(
      await this.element("//*[@resource-id='reg_welcome_txthealthliv_001']", "//*[@name='reg_welcome_txthealthliv_001']"),
      'Healthy living has never been this rewarding'
    );
  }

  async openLogin(): Promise<LoginScreen> {
    await this.click("//*[@resource-id='ctrl_btnlogin_001']", "//*[@name='ctrl_btnlogin_001']");
    return new LoginScreen(this.session);
  }
}
