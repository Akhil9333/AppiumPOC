package screens;

import genericUtils.MobileSessionInit;

public class ProfileScreen extends BaseScreen {

    public ProfileScreen(MobileSessionInit session) {
        super(session);
    }

    public SettingsScreen openSettings() throws InterruptedException {
        click(
                "//*[@resource-id='settings_gear_icon_button']",
                "//*[@name='settings_gear_icon_button']");
        return new SettingsScreen(session);
    }
}

