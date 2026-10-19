import { MobileSession } from '../utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { BaseScreen } from './BaseScreen.js';
import { SettingsScreen } from './SettingsScreen.js';

const locators = {
  settingsButton: {
    android: "//*[@resource-id='settings_gear_icon_button']",
    ios: "//*[@name='settings_gear_icon_button']"
  }
} as const;

export class ProfileScreen extends BaseScreen {
  constructor(session: MobileSession) {
    super(session);
  }

  async openSettings(): Promise<SettingsScreen> {
    await this.click(locators.settingsButton.android, locators.settingsButton.ios);
    return new SettingsScreen(this.session);
  }
}
