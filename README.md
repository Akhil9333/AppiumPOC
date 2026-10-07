# Run Appium Tests with Java and TestNG on TestMu AI (Formerly LambdaTest)

<p align="center">
  <a href="https://www.testmuai.com/"><img src="https://img.shields.io/badge/MADE%20BY%20TestMu%20AI-000000.svg?style=for-the-badge&labelColor=000" alt="Made by TestMu AI"></a>
  <a href="https://mvnrepository.com/artifact/org.testng/testng"><img src="https://img.shields.io/maven-central/v/org.testng/testng.svg?style=for-the-badge&labelColor=000000" alt="TestNG version"></a>
  <a href="https://community.testmuai.com/"><img src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&labelColor=000000" alt="Community"></a>
</p>

## Getting Started

[TestMu AI](https://www.testmuai.com/) (Formerly LambdaTest) is the world's first full-stack AI Agentic Quality Engineering platform that empowers teams to test intelligently, smarter, and ship faster. Built for scale, it offers a full-stack testing cloud with 10K+ real devices and 3,000+ browsers. With AI-native test management, MCP servers, and agent-based automation, TestMu AI supports Selenium, Appium, Playwright, and all major frameworks. 

With TestMu AI (Formerly LambdaTest), you can run Appium tests in Java with TestNG across real Android and iOS devices. This sample shows how to configure Java TestNG Appium tests with Maven to run on the TestMu AI Real Device Cloud.

- [Sign up on TestMu AI](https://www.testmuai.com/register/) (Formerly LambdaTest).
- Follow the [TestMu AI Documentation](https://www.testmuai.com/support/docs/) for the full setup walkthrough.

### Prerequisites

- Java 8 or higher
- Maven
- A TestMu AI (Formerly LambdaTest) account with your username and access key

### Setup

Clone and install dependencies:

```bash
git clone https://github.com/RajkumarVitality/Appium_Java.git && cd Appium_Java
mvn clean install
```

Set your credentials before running the tests.

The tests resolve settings in this order at runtime:

1. JVM system properties such as `-DLT_USERNAME=...`
2. Environment variables
3. A local `lambdatest.properties` file in the project root or `src/test/resources/`

The following keys are supported:

- `LT_USERNAME` and `LT_ACCESS_KEY` are required.
  - Legacy fallback variables `UserName` and `AccessKey` are also supported.
- `APP_USERNAME` and `APP_PASSWORD` are required for the login/logout and screening scenarios.
- `MHA_USERNAME` and `APP_PASSWORD` are required for the MHA journey.
- `LOCKOUT_USERNAME` and `APP_INCORRECT_PASSWORD` are required for the account lockout scenario.
  Use a dedicated account that can safely be locked, and a password known to be incorrect.
- `LT_APP_ID` is optional as a shared fallback app id.
- `appId` can be used as a direct runtime override for the app under test.
- `LT_ANDROID_APP_ID` and `LT_IOS_APP_ID` can be used to override the uploaded app per platform.
- `platform`, `device`, and `version` can be passed at runtime to override TestNG defaults or suite XML values.
- `LT_GRID_URL` is optional and defaults to `mobile-hub.lambdatest.com`.
- `LT_BUILD_NAME` optionally overrides the build name shown in the dashboard.
- `LT_TEST_NAME` optionally overrides the test name shown in the dashboard.
- `LT_PROJECT_NAME` optionally sets a project capability for the run.
- `LT_ARTIFACTS_DIR` optionally changes where local screenshots and execution logs are stored. The default is `target/test-artifacts`.
- App sessions now run with `fullReset=true` and `noReset=false` so the cloud device removes the app between sessions.
- For an explicit uninstall call at teardown, you can also set `LT_ANDROID_APP_PACKAGE`, `LT_LOGIN_ANDROID_APP_PACKAGE`, `LT_LOGIN_IOS_BUNDLE_ID`, and `LT_IOS_BUNDLE_ID` when you know the package or bundle id of the uploaded app.
- App sessions now run with `fullReset=true` and `noReset=false` so the cloud device removes the app between sessions.
- For an explicit uninstall call at teardown, you can also set `LT_ANDROID_APP_PACKAGE`, `LT_LOGIN_ANDROID_APP_PACKAGE`, `LT_LOGIN_IOS_BUNDLE_ID`, and `LT_IOS_BUNDLE_ID` when you know the package or bundle id of the uploaded app.

**Option 1: JVM system properties (works well from IntelliJ VM options)**

```bash
mvn test -P ios-single -DLT_USERNAME="YOUR_USERNAME" -DLT_ACCESS_KEY="YOUR_ACCESS_KEY"
```

Example with runtime mobile target overrides:

```bash
mvn test -Dtest=testscenarios.FiveTimesIncorrectPasswordIOSTest \
  -DLT_USERNAME="YOUR_USERNAME" \
  -DLT_ACCESS_KEY="YOUR_ACCESS_KEY" \
  -Dplatform="iOS" \
  -Ddevice="iPhone 15" \
  -Dversion="17" \
  -DappId="lt://APP123456789"
```

**macOS / Linux:**

```bash
export LT_USERNAME="YOUR_USERNAME"
export LT_ACCESS_KEY="YOUR_ACCESS_KEY"
```

**Windows:**

```bash
set LT_USERNAME="YOUR_USERNAME"
set LT_ACCESS_KEY="YOUR_ACCESS_KEY"
```

**Option 3: Local properties file**

Copy `lambdatest.properties.example` to `lambdatest.properties` in the project root (or to `src/test/resources/lambdatest.properties`) and fill in your values:

App credentials use the same setting precedence as the cloud credentials. Keep real
credentials in the ignored local properties file, environment variables, or JVM
properties; never commit them. Generated `target/`, `test-output/`, and IDE files
are excluded from Git.

```properties
LT_USERNAME=YOUR_USERNAME
LT_ACCESS_KEY=YOUR_ACCESS_KEY
platform=iOS
device=iPhone 15
version=17
appId=lt://APP123456789
```

### Framework structure

The project now uses a lightweight Page Object Model with shared session setup:

- `framework/` contains the reusable mobile session base, execution reporter, LambdaTest config, and TestNG listener.
- `screens/` contains the page objects for welcome, login, home, profile, and settings screens.
- `LoginAndLogoutFunctionality_iOS`, `LoginAndLogoutFunctionality_Android`, and `FiveTimesIncorrectPasswordIOSTest` reuse those page objects instead of duplicating locators.

### Run tests

```bash
mvn test -P android-single
mvn test -P ios-single
```


View results on your TestMu AI dashboard.

### Execution screenshots and logs

Each TestNG run now generates local execution artifacts automatically:

- step/checkpoint screenshots during the test flow
- a `failure.png` screenshot when a test fails before teardown
- a failure page source XML snapshot when available
- a per-test `execution.log` file with timestamped execution steps

Artifacts are written under:

```text
target/test-artifacts/
```

Each test gets its own timestamped folder. You can override the root folder by setting:

```bash
export LT_ARTIFACTS_DIR="custom-artifacts-dir"
```

### Local testing with TestMu AI Tunnel

To test locally hosted apps, set up the TestMu AI tunnel. OS-specific guides:

- [Local Testing on Windows](https://www.testmuai.com/support/docs/local-testing-for-windows/)
- [Local Testing on macOS](https://www.testmuai.com/support/docs/local-testing-for-macos/)
- [Local Testing on Linux](https://www.testmuai.com/support/docs/local-testing-for-linux/)

Add the following to your capabilities:

```js
tunnel: true,
```

## Contributions

Contributions are welcome. Open an issue to discuss your idea before submitting a pull request. When reporting bugs, include your Java version, OS, and Maven version.

## TestMu AI (Formerly LambdaTest) Community

Connect with testers and developers in the [TestMu AI Community](https://community.testmuai.com/). Ask questions, share what you are building, and discuss best practices in test automation and DevOps.
  
## TestMu AI (Formerly LambdaTest) Certifications

Earn free [TestMu AI Certifications](https://www.testmuai.com/certifications/) for testers, developers, and QA engineers. Validate your skills in Selenium, Cypress, Playwright, Appium, Espresso and more. Industry-recognized, shareable on LinkedIn, and built by practitioners, not marketers.

## Learning Resources by TestMu AI (Formerly LambdaTest)

Learn modern testing through tutorials, guides, videos, and weekly updates:

* [TestMu AI Blog](https://www.testmuai.com/blog/)
* [TestMu AI Learning Hub](https://www.testmuai.com/learning-hub/)
* [TestMu AI on YouTube](https://www.youtube.com/@TestMuAI)
* [TestMu AI Newsletter](https://www.testmuai.com/newsletter/)
  
## LambdaTest is Now TestMu AI

On **January 12, 2026**, [LambdaTest evolved to TestMu AI](https://www.testmuai.com/lambdatest-is-now-testmuai/), the world's first fully autonomous **Agentic AI Quality Engineering Platform**.

Same team. Same infrastructure. Same customer accounts. All existing LambdaTest logins, scripts, capabilities, and integrations continue to work without change.

👉 Find the new home for [LambdaTest](https://www.testmuai.com).

### How LambdaTest Evolved into TestMu AI

In 2017, we launched LambdaTest with a simple mission: make testing fast, reliable, and accessible. As LambdaTest grew, we expanded into Test Intelligence, Visual Regression Testing, Accessibility Testing, API Testing, and Performance Testing, covering the full depth of the testing lifecycle.

As software development entered the AI era, testing had to evolve, too. We rebuilt the architecture to be AI-native from the ground up, with autonomous agents that **plan, author, execute, analyze, and optimize tests** while keeping humans in the loop. The platform integrates with your repos, CI, IDEs, and terminals, continuously learning from every code change and development signal.

That evolution earned a new name: **TestMu AI**, built for an AI-first future of quality engineering. TestMu is not a new name for us. It is the name of our annual community conference, which has brought together 100,000+ quality engineers to discuss how AI would reshape testing, long before that became an industry norm. 

What started as a high-performance cloud testing platform has transformed into an AI-native, multi-agent system powering a connected, end-to-end quality layer. That evolution defined a new identity: LambdaTest evolved into TestMu AI, built for an AI-first future of quality engineering.

## Support

Got a question? Email [support@testmuai.com](mailto:support@testmuai.com) or chat with us 24x7 from our chat portal.
