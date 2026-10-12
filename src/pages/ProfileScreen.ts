import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { SettingsScreen } from './SettingsScreen.js';

export class ProfileScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async openSettings(): Promise<SettingsScreen> {
    await this.click("//*[@resource-id='settings_gear_icon_button']", "//*[@name='settings_gear_icon_button']");
    return new SettingsScreen(this.session);
  }
}
