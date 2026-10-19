# Appium Screening Demo Guide

## Demo Goal

Demonstrate the same screening/vaccination journey on Android or iOS, then show both outcomes:

- Positive: upload proof, submit the form, and verify success.
- Negative: leave proof out, attempt to submit, and verify no success is shown and the form remains open.

## 1. Framework in One Minute

Use this opening explanation:

> "The tests are written in TypeScript and run with Node.js. WebdriverIO is the test runner, Appium sends commands to the mobile app, and TestMu AI/LambdaTest provides the remote Android or iOS device. The test describes the user journey; page objects contain screen actions and platform-specific locators."

Platform and backend environment are different choices:

- `PLATFORM` selects the device: Android or iOS.
- `VG_ENVIRONMENT` selects the backend used to prepare the test member: for example, `mdev` or `ca-test`.

## 2. One-Time Setup Checklist

Complete these checks before the demo, not while the manager is waiting:

1. Open the `Appium_Typescript` folder in VS Code. Use its integrated PowerShell terminal.
2. Confirm Node.js and npm are available:

  ```powershell
  node --version
  npm --version
  ```

  The README lists Node.js 20 or later. If dependencies are missing, install them once with `npm ci`.
3. Confirm there is a TestMu AI/LambdaTest account with App Automation access.
4. Upload the Android app and/or iOS app to the provider's App Automation storage. Put the returned app IDs in `lambdatest.properties` as `LT_ANDROID_APP_ID` and `LT_IOS_APP_ID` respectively. The selected device must have a matching app ID.
5. Create or check the local `lambdatest.properties` file. It needs `LT_USERNAME`, `LT_ACCESS_KEY`, the app ID(s), and `APP_PASSWORD` for this account-provisioning flow.
6. Create or check `user-creation.properties`. Set `VG_ENVIRONMENT` to an approved non-production profile and fill that profile's `TENANT_NUMBER`, `ZUUL_URL`, `INTEGRATION_PLATFORM_BASE_URL`, `VITALITY_PRODUCT_KEY`, `MEMBERSHIP_REFERENCE_KEYS`, `EMAIL_DOMAIN`, `API_BASIC_AUTH`, `API_BEARER_TOKEN`, and `LOGIN_PREFIX`. Also set `configUserAgent`.
7. Keep both local properties files private. Never show them in the demo or commit them; they can contain credentials.
8. Check that the runner can reach the backend (and VPN/DNS/proxy if required) and the cloud service before presenting.

The `.example` files are templates only. Copy them to the local filenames and replace placeholders; do not enter real credentials into the examples.

## 3. Positive Demo Run

From the `Appium_Typescript` terminal, run:

```powershell
npm run test:screening
```

When prompted, enter `1` for Android or `2` for iOS. The platform selection happens before user provisioning, so no account or device setup begins until you choose.

Describe the steps as they appear:

1. The runner prepares a test member using the selected `VG_ENVIRONMENT`.
2. WebdriverIO starts a real device session in TestMu AI/LambdaTest.
3. The test logs in and opens Activities and the screening form.
4. It selects Flu and today's date.
5. Android uses its file picker; iOS uses Photos. The test selects proof.
6. It submits the form and checks for a success message.

The test file is `tests/features/screening/screening-vaccination.spec.ts`.

## 4. Negative Demo Run

Run:

```powershell
npm run test:screening-negative
```

Choose Android or iOS at the prompt. Explain that this case selects the type and date but does not attach proof. It attempts Submit and checks that no success appears and the form remains open. The test pauses briefly at the end so you can show that state on the live device.

The test file is `tests/features/screening/screening-vaccination-negative.spec.ts`.

## 5. What the Runner Does

In simple terms:

1. `scripts/run-screening.js` prompts for a platform and user-creation environment, then passes both choices to WebdriverIO.
2. `wdio.conf.ts` selects the test scenario, device capabilities, cloud connection, timeouts, and reporters.
3. A `beforeSession` hook provisions a fresh member before starting the mobile session. This creates backend test data and is why startup can take time.
4. The test calls helpers and page objects. `ScreeningVaccinationScreen.ts` handles the form; the shared session utility selects Android/iOS locators and actions.
5. Assertions determine pass or fail. WebdriverIO and the reporter save logs and evidence.

## 6. Show the Results

- The terminal gives the pass/fail summary.
- Each attempt gets a timestamped folder under `target/test-artifacts/`.
- Open that run's `execution.log` and check its final `Execution status: PASSED` or `FAILED` line. Do not assume the newest folder passed.
- Show `test-passed.png`; the positive case also saves `screening-vaccination-submitted.png`.
- Failure folders may include `listener-failure.png` and `listener-failure.xml` (the screenshot and Appium page source).

For the browsable Allure report, generate it first and then open it:

```powershell
npm run report:generate
npm run report:open
```

`target/allure-results` contains raw report data. `target/allure-report` is the generated HTML report. `report:open` alone cannot create a missing report.

## 7. If Something Goes Wrong

- **No setup prompt:** use the integrated terminal and run `npm run test:screening` exactly (colon, no space). For a non-interactive terminal, set `PLATFORM` and optionally `VG_ENVIRONMENT` (`mdev`, `ca-test`, or `ca-dev`), then use `npm run test:screening:run` or `npm run test:screening-negative:run`.
- **Long delay before the device appears:** member provisioning runs before the cloud session. Check the console for `[UserProvisioning]` messages and the backend/network connection.
- **Provisioning fails:** verify `VG_ENVIRONMENT` and its profile settings in `user-creation.properties`. The test should stop before opening the device if pre-session provisioning fails.
- **Cloud app/device setup fails:** verify TestMu credentials, the platform-specific `LT_*_APP_ID`, device availability, and cloud access.
- **UI step fails:** open the newest run's `execution.log`, screenshot, and page-source XML. A failed attempt is useful for diagnosis, but use a `PASSED` folder for the demo result.
- **Allure says the report directory is missing:** run `npm run report:generate` before `npm run report:open`.

For the demo, run one platform per test case live. Each case provisions a member and starts a remote device, so allow several minutes. Keep a previously passed artifact ready as a fallback if the cloud service is slow.

## 8. Files to Point Out

- `package.json`: npm commands.
- `scripts/run-screening.js`: prompts for Android or iOS and the user-creation environment, then launches the selected scenario.
- `wdio.conf.ts`: WebdriverIO setup and lifecycle hooks.
- `src/config/runner.ts`: scenario-to-spec mapping.
- `src/config/userCreation.ts` and `src/config/API-to-Create-New-User.ts`: provisioning settings reader and backend API operations.
- `src/pages/ScreeningVaccinationScreen.ts`: form locators and interactions.
- `src/utils/Mobile Utils_Scrolll_Xpath_Timeout.ts`: platform-aware session and element helpers.
- `src/utils/ExecutionReporter.ts`: run logs and screenshots.
- `tests/features/screening/screening-vaccination.spec.ts`: positive journey.
- `tests/features/screening/screening-vaccination-negative.spec.ts`: missing-proof negative test case.

## 9. Short Closing Statement

> "This shows an end-to-end mobile test: we prepare a non-production member, run the same business journey on a selected real device, use platform-specific locators only where the operating systems differ, and keep evidence for both successful and blocked submissions."
