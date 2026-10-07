package config;

import genericUtils.ExecutionReporter;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import io.appium.java_client.ios.options.XCUITestOptions;
import org.openqa.selenium.MutableCapabilities;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;

public final class LambdaTestConfig {

    private static final String DEFAULT_GRID_URL = "mobile-hub.lambdatest.com";
    private static final String DEFAULT_ARTIFACTS_DIR = "target/test-artifacts";
    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");
    private static final Properties FILE_PROPERTIES = loadFileProperties();

    private LambdaTestConfig() {
    }

    public static String requiredEnv(String key) {
        String value = resolveSetting(key);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }
        throw new IllegalStateException("Missing required setting: " + key
                + ". Provide it as a JVM system property (-D" + key
                + "=...), environment variable, or in lambdatest.properties.");
    }

    static String requiredEnvAny(String... keys) {
        for (String key : keys) {
            String value = resolveSetting(key);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        throw new IllegalStateException("Missing required setting. Expected one of: "
                + Arrays.toString(keys)
                + ". Provide them as JVM system properties (-DKEY=value), environment variables, "
                + "or entries in lambdatest.properties.");
    }

    static String optionalEnv(String key, String defaultValue) {
        String value = resolveSetting(key);
        return value != null && !value.trim().isEmpty() ? value.trim() : defaultValue;
    }

    static String optionalEnvAny(String defaultValue, String... keys) {
        for (String key : keys) {
            String value = resolveSetting(key);
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return defaultValue;
    }

    private static String resolveSetting(String key) {
        String value = System.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            value = System.getenv(key);
        }
        if (value == null || value.trim().isEmpty()) {
            value = FILE_PROPERTIES.getProperty(key);
        }
        return value != null && !value.trim().isEmpty() ? value.trim() : null;
    }

    private static Properties loadFileProperties() {
        Properties properties = new Properties();
        Path[] paths = {
                Path.of("lambdatest.properties"),
                Path.of("src", "test", "resources", "lambdatest.properties")
        };

        for (Path path : paths) {
            if (Files.isRegularFile(path)) {
                try (InputStream input = Files.newInputStream(path)) {
                    properties.load(input);
                } catch (IOException exception) {
                    throw new IllegalStateException("Unable to read " + path, exception);
                }
            }
        }

        try (InputStream input = LambdaTestConfig.class.getClassLoader()
                .getResourceAsStream("lambdatest.properties")) {
            if (input != null) {
                Properties classpathProperties = new Properties();
                classpathProperties.load(input);
                classpathProperties.forEach(properties::putIfAbsent);
            }
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to read lambdatest.properties from the classpath", exception);
        }
        return properties;
    }

    public static String resolveRuntimePlatform(String platform) {
        return optionalEnvAny(platform, "platform", "LT_PLATFORM");
    }

    public static String resolveRuntimeDevice(String device) {
        return optionalEnvAny(device, "device", "LT_DEVICE");
    }

    public static String resolveRuntimeVersion(String version) {
        return optionalEnvAny(version, "version", "LT_VERSION");
    }

    public static String resolveRuntimeAppId(String defaultAppId, String... platformKeys) {
        String appId = optionalEnv("appId", null);
        if (appId != null) {
            return appId;
        }
        appId = optionalEnvAny(null, platformKeys);
        return appId != null ? appId : optionalEnv("LT_APP_ID", defaultAppId);
    }

    public static UiAutomator2Options buildAndroidOptions() {
        return new UiAutomator2Options().setAutomationName("UiAutomator2");
    }

    public static XCUITestOptions buildIosOptions() {
        return new XCUITestOptions().setAutomationName("XCUITest");
    }

    public static void applyCommonMobileCapabilities(MutableCapabilities capabilities,
                                                     String scenarioName,
                                                     String device,
                                                     String version,
                                                     String appId,
                                                     String testName) {
        Map<String, Object> options = new HashMap<>();
        options.put("username", requiredEnvAny("LT_USERNAME", "UserName"));
        options.put("accessKey", requiredEnvAny("LT_ACCESS_KEY", "AccessKey"));
        options.put("deviceName", device);
        options.put("platformVersion", version);
        options.put("app", appId);
        options.put("isRealMobile", true);
        options.put("build", optionalEnv("LT_BUILD_NAME", "Invalid Credentials Test Build"));
        options.put("name", optionalEnv("LT_TEST_NAME", testName));
        String projectName = optionalEnv("LT_PROJECT_NAME", null);
        if (projectName != null) {
            options.put("project", projectName);
        }
        options.put("fullReset", true);
        options.put("noReset", false);

        capabilities.setCapability("LT:Options", options);
        capabilities.setCapability("app", appId);
        capabilities.setCapability("deviceName", device);
        capabilities.setCapability("platformVersion", version);
        capabilities.setCapability("fullReset", true);
        capabilities.setCapability("noReset", false);
    }

    public static void logSharedAppIdWarningIfPresent(String platform, String platformAppIdKey) {
        String sharedAppId = optionalEnv("LT_APP_ID", null);
        String platformAppId = optionalEnv(platformAppIdKey, null);
        if (sharedAppId != null && platformAppId == null) {
            ExecutionReporter.log("Using shared LT_APP_ID for " + platform
                    + "; set " + platformAppIdKey
                    + " to select a platform-specific app.");
        }
    }

    public static URL buildHubUrl() throws MalformedURLException {
        String hubUrl = optionalEnv("LT_GRID_URL", DEFAULT_GRID_URL);
        if (!hubUrl.contains("://")) {
            hubUrl = "https://" + hubUrl;
        }
        if (!hubUrl.endsWith("/wd/hub")) {
            hubUrl = hubUrl.replaceAll("/+$", "") + "/wd/hub";
        }
        return new URL(hubUrl);
    }

    public static void cleanupSession(AppiumDriver driver, String appId) {
        if (driver == null) {
            return;
        }

        String platformName = String.valueOf(
                driver.getCapabilities().getCapability("platformName"));
        String resolvedAppId = appId;
        if (resolvedAppId == null || resolvedAppId.trim().isEmpty()) {
            resolvedAppId = platformName.equalsIgnoreCase("iOS")
                    ? optionalEnvAny(null, "LT_LOGIN_IOS_BUNDLE_ID", "LT_IOS_BUNDLE_ID")
                    : optionalEnvAny(null, "LT_ANDROID_APP_PACKAGE",
                    "LT_LOGIN_ANDROID_APP_PACKAGE");
        }

        RuntimeException uninstallFailure = null;
        if (resolvedAppId != null && !resolvedAppId.trim().isEmpty()) {
            try {
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("appId", resolvedAppId.trim());
                driver.executeScript("mobile: removeApp", parameters);
            } catch (RuntimeException exception) {
                uninstallFailure = exception;
            }
        }

        try {
            driver.quit();
        } catch (RuntimeException quitFailure) {
            if (uninstallFailure != null) {
                quitFailure.addSuppressed(uninstallFailure);
            }
            throw quitFailure;
        }
        if (uninstallFailure != null) {
            throw uninstallFailure;
        }
    }

    public static Path createTestArtifactsDirectory(String runName) throws IOException {
        Path root = Path.of(optionalEnv("LT_ARTIFACTS_DIR", DEFAULT_ARTIFACTS_DIR));
        Path directory = root.resolve(timestamp() + "-" + sanitizeFileName(runName));
        return Files.createDirectories(directory);
    }

    public static String timestamp() {
        return LocalDateTime.now().format(TIMESTAMP_FORMAT);
    }

    public static String sanitizeFileName(String value) {
        return value != null && !value.trim().isEmpty()
                ? value.trim().replaceAll("[^A-Za-z0-9._-]+", "-")
                : "artifact";
    }

    public static void writeTextFile(Path path, String content) throws IOException {
        Path parent = path.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        Files.write(path, content.getBytes(StandardCharsets.UTF_8),
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING,
                StandardOpenOption.WRITE);
    }
}
