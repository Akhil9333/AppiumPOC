package genericUtils;

import config.LambdaTestConfig;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import java.time.Duration;

public abstract class MobileSessionInit {

    public AppiumDriver driver;
    public WebDriverWait wait;
    public boolean isIOS;
    public String device;
    public String version;
    public String platform;
    public String uploadedAppId;

    protected abstract String getScenarioName();

    protected abstract String getIosDefaultAppId();

    protected abstract String getAndroidDefaultAppId();

    protected long getWaitSeconds() {
        return 300;
    }

    protected long getInitialLoadDelayMillis() {
        return 4000;
    }

    protected void applyAdditionalCapabilities(MutableCapabilities capabilities) {
        if (isIOS) {
            //capabilities.setCapability("iosLiveInteraction", true);
            capabilities.setCapability("autoAcceptAlerts", true);
            capabilities.setCapability("resignApp", true);
        }
    }

    public void recordStep(String message) {
        ExecutionReporter.log(message);
    }

    public void captureCheckpoint(String checkpointName) {
        ExecutionReporter.captureScreenshot(checkpointName);
    }

    public By getPlatformLocator(boolean isIOS, String androidXpath, String iosXpath) {
        return By.xpath(isIOS ? iosXpath : androidXpath);
    }

    public WebElement waitForElement(WebDriverWait wait, By locator) {
        return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    public WebElement waitForElement(WebDriverWait wait, boolean isiOS, String androidXpath, String iosXpath) {
        return waitForElement(wait, getPlatformLocator(isiOS, androidXpath, iosXpath));
    }

    public WebElement waitForVisibleElement(WebDriverWait wait, By locator) {
        return wait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOfElementLocated(locator)));
    }

    public boolean isElementVisible(WebDriverWait wait, By locator) {
        try {
            return waitForVisibleElement(wait, locator).isDisplayed();
        } catch (org.openqa.selenium.TimeoutException | org.openqa.selenium.NoSuchElementException exception) {
            return false;
        }
    }

    public boolean isElementVisible(WebDriverWait wait, boolean isiOS, String androidXpath, String iosXpath) {
        return isElementVisible(wait, getPlatformLocator(isiOS, androidXpath, iosXpath));
    }

    public void clickElement(WebDriverWait wait, By locator) throws InterruptedException {
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                waitForVisibleElement(wait, locator).click();
                return;
            } catch (StaleElementReferenceException staleElementReferenceException) {
                if (attempt == 2) {
                    throw staleElementReferenceException;
                }
                Thread.sleep(300);
            }
        }
    }

    public void typeIntoElement(WebDriverWait wait, By locator, String value) throws InterruptedException {
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                WebElement element = waitForVisibleElement(wait, locator);
                element.click();
                try {
                    element.clear();
                } catch (Exception ignored) {
                }
                element.sendKeys(value);
                return;
            } catch (StaleElementReferenceException staleElementReferenceException) {
                if (attempt == 2) {
                    throw staleElementReferenceException;
                }
                Thread.sleep(300);
            }
        }
    }

    public void enterText(WebDriverWait wait,
                          boolean isIOS,
                          String androidTriggerXpath,
                          String iosTriggerXpath,
                          String androidEditableXpath,
                          String iosEditableXpath,
                          String value) throws InterruptedException {
        By triggerLocator = getPlatformLocator(isIOS, androidTriggerXpath, iosTriggerXpath);
        By editableLocator = getPlatformLocator(isIOS, androidEditableXpath, iosEditableXpath);

        clickElement(wait, triggerLocator);
        Thread.sleep(500);
        typeIntoElement(wait, editableLocator, value);
        Thread.sleep(1000);
    }

    private ScrollActions scrollActions;

    private ScrollActions scrollActions() {
        if (scrollActions == null) {
            scrollActions = new ScrollActions(driver, isIOS);
        }
        return scrollActions;
    }

    public void scrollUp() {
        scrollActions().scrollUp();
    }

    public WebElement scrollUpUntilElementFound(By locator, int maxSwipes) throws InterruptedException {
        return scrollActions().scrollUpUntilElementFound(locator, maxSwipes);
    }

    @BeforeMethod(alwaysRun = true)
    @Parameters(value = {"device", "version", "platform"})
    public void startSession(@Optional("Galaxy S.*") String device,
                             @Optional(".*") String version,
                             @Optional("android") String platform) {
        this.platform = LambdaTestConfig.resolveRuntimePlatform(platform);
        this.device = LambdaTestConfig.resolveRuntimeDevice(device);
        this.version = LambdaTestConfig.resolveRuntimeVersion(version);
        this.isIOS = this.platform.equalsIgnoreCase("iOS");

        try {
            ExecutionReporter.ensureTestStarted(getClass().getSimpleName(), getScenarioName());

            uploadedAppId = isIOS
                    ? LambdaTestConfig.resolveRuntimeAppId(getIosDefaultAppId(), "LT_IOS_APP_ID", "iosAppId")
                    : LambdaTestConfig.resolveRuntimeAppId(getAndroidDefaultAppId(), "LT_ANDROID_APP_ID", "androidAppId");

            MutableCapabilities capabilities = isIOS
                    ? LambdaTestConfig.buildIosOptions()
                    : LambdaTestConfig.buildAndroidOptions();
            LambdaTestConfig.applyCommonMobileCapabilities(capabilities,
                    getScenarioName(),
                    this.device,
                    this.version,
                    uploadedAppId,
                    getScenarioName());
            LambdaTestConfig.logSharedAppIdWarningIfPresent(isIOS ? "iOS" : "Android", isIOS ? "LT_IOS_APP_ID" : "LT_ANDROID_APP_ID");
            ExecutionReporter.captureTextArtifact("session-config",
                    "platform=" + this.platform + System.lineSeparator()
                            + "device=" + this.device + System.lineSeparator()
                            + "version=" + this.version + System.lineSeparator()
                            + "appId=" + uploadedAppId + System.lineSeparator());
            recordStep("Using app capability: " + uploadedAppId);

            applyAdditionalCapabilities(capabilities);

            driver = new AppiumDriver(LambdaTestConfig.buildHubUrl(), capabilities);
            ExecutionReporter.attachDriver(driver);
            wait = new WebDriverWait(driver, Duration.ofSeconds(getWaitSeconds()));
            recordStep("Driver session created for platform=" + this.platform + ", device=" + this.device + ", version=" + this.version);

            Thread.sleep(getInitialLoadDelayMillis());
            captureCheckpoint("app-loaded");
        } catch (Exception e) {
            ExecutionReporter.logException("Mobile session initialization failed", e);
            ExecutionReporter.captureTextArtifact("failure-context",
                    "platform=" + this.platform + System.lineSeparator()
                            + "device=" + this.device + System.lineSeparator()
                            + "version=" + this.version + System.lineSeparator()
                            + "appId=" + uploadedAppId + System.lineSeparator()
                            + "error=" + e.getMessage() + System.lineSeparator());
            ExecutionReporter.captureScreenshot("failure");
            ExecutionReporter.capturePageSource("failure");
            throw new RuntimeException("Mobile session initialization failed", e);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void stopSession() {
        LambdaTestConfig.cleanupSession(driver, null);
        driver = null;
        wait = null;
        scrollActions = null;
    }
}
