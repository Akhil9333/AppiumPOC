import { browser } from '@wdio/globals';
import { requiredSetting, selectedPlatform } from '../../src/config/mobileSessionInit.js';
import { executionReporter } from '../../src/utils/ExecutionReporter.js';
import { MobileSession } from '../../src/utils/Mobile Utils_Scrolll_Xpath_Timeout.js';
import { HomeScreen } from '../../src/pages/HomeScreen.js';
import { HealthyLivingScreen } from '../../src/pages/HealthyLivingScreen.js';
import { LoginScreen } from '../../src/pages/LoginScreen.js';
import { WelcomeScreen } from '../../src/pages/WelcomeScreen.js';

export function loginWithCredentials(usernameKey = 'APP_USERNAME') {
  return loginWithUsername(requiredSetting(usernameKey));
}

export async function loginWithUsername(username: string): Promise<{
  session: MobileSession;
  loginScreen: LoginScreen;
  homeScreen: HomeScreen;
}> {
  const session = new MobileSession(selectedPlatform());
  const welcomeScreen = new WelcomeScreen(session);
  await welcomeScreen.assertWelcomeMessage();
  executionReporter.log('Validated welcome message on landing screen.');

  const healthyLivingScreen: HealthyLivingScreen = await welcomeScreen.openHealthyLiving();
  executionReporter.log('Navigated from welcome screen to healthy living screen.');
  await healthyLivingScreen.assertHealthyLivingMessage();

  const loginScreen = await healthyLivingScreen.openLogin();
  executionReporter.log('Opened login screen.');
  await loginScreen.assertHelloVisible();
  await loginScreen.enterUsername(username);
  executionReporter.log('Entered username.');
  await loginScreen.dismissKeyboard();
  return { session, loginScreen, homeScreen: new HomeScreen(session) };
}

export async function completeLogin(loginScreen: LoginScreen, passwordKey = 'APP_PASSWORD'): Promise<void> {
  await loginScreen.enterPassword(requiredSetting(passwordKey));
  executionReporter.log('Entered password.');
  await loginScreen.dismissKeyboard();
  await loginScreen.submit();
  executionReporter.log('Submitted login form.');
}

export async function settleHomeScreen(homeScreen: HomeScreen, session: MobileSession): Promise<void> {
  if (!session.isIOS) {
    await homeScreen.dismissNotificationPopup();
    executionReporter.log('Dismissed notification popup.');
    await browser.pause(3_000);
    await homeScreen.acceptPermissionDialog();
    executionReporter.log('Accepted runtime permission dialog.');
  }
  await browser.pause(1_000);
  await homeScreen.assertGreetingVisible();
  executionReporter.log('Validated home screen greeting message.');
  await executionReporter.captureScreenshot('home-screen');
}

export async function loginToHome(username: string): Promise<{
  session: MobileSession;
  homeScreen: HomeScreen;
}> {
  const { session, loginScreen, homeScreen } = await loginWithUsername(username);
  await completeLogin(loginScreen);
  await settleHomeScreen(homeScreen, session);
  return { session, homeScreen };
}
