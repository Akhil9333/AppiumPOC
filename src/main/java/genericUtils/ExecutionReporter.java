package genericUtils;

import config.LambdaTestConfig;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.OutputType;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class ExecutionReporter {

    private static final DateTimeFormatter LOG_TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final ThreadLocal<ExecutionContext> CONTEXT = new ThreadLocal<>();

    private ExecutionReporter() {
    }

    static void startTest(String suiteName, String testName) {
        finishContext();

        String runName = (suiteName == null || suiteName.isBlank() ? "suite" : suiteName)
                + "-"
                + (testName == null || testName.isBlank() ? "test" : testName);
        try {
            Path artifactDirectory = LambdaTestConfig.createTestArtifactsDirectory(runName);
            Path logFile = artifactDirectory.resolve("execution.log");
            PrintWriter writer = new PrintWriter(Files.newBufferedWriter(logFile));
            ExecutionContext context = new ExecutionContext(artifactDirectory, writer);
            CONTEXT.set(context);
            log("Artifact directory: " + artifactDirectory.toAbsolutePath());
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to initialize execution reporter for " + runName, exception);
        }
    }

    static void ensureTestStarted(String suiteName, String testName) {
        if (CONTEXT.get() == null) {
            startTest(suiteName, testName);
        }
    }

    static void attachDriver(AppiumDriver driver) {
        ExecutionContext context = CONTEXT.get();
        if (context == null) {
            return;
        }
        context.driver = driver;
        if (driver != null && driver.getSessionId() != null) {
            log("Attached Appium session: " + driver.getSessionId());
        }
    }

    public static void log(String message) {
        ExecutionContext context = CONTEXT.get();
        String line = String.format("[%s] %s", LocalDateTime.now().format(LOG_TIMESTAMP), message);
        System.out.println(line);
        if (context != null) {
            context.writer.println(line);
            context.writer.flush();
        }
    }

    static void logException(String label, Throwable throwable) {
        if (throwable == null) {
            return;
        }
        log(label + ": " + throwable.getClass().getSimpleName() + " - " + throwable.getMessage());
        if (CONTEXT.get() != null) {
            throwable.printStackTrace(CONTEXT.get().writer);
            CONTEXT.get().writer.flush();
        }
    }

    static Path captureScreenshot(String label) {
        ExecutionContext context = CONTEXT.get();
        if (context == null || context.driver == null) {
            log("Screenshot skipped for '" + label + "' because AppiumDriver is not available.");
            return null;
        }

        try {
            byte[] screenshot = context.driver.getScreenshotAs(OutputType.BYTES);
            Path screenshotPath = context.artifactDirectory.resolve(LambdaTestConfig.timestamp() + "-" + LambdaTestConfig.sanitizeFileName(label) + ".png");
            Files.write(screenshotPath, screenshot);
            log("Saved screenshot: " + screenshotPath.toAbsolutePath());
            return screenshotPath;
        } catch (Exception exception) {
            log("Unable to capture screenshot for '" + label + "': " + exception.getMessage());
            return null;
        }
    }

    static Path capturePageSource(String label) {
        ExecutionContext context = CONTEXT.get();
        if (context == null || context.driver == null) {
            log("Page source capture skipped for '" + label + "' because AppiumDriver is not available.");
            return null;
        }

        try {
            String pageSource = context.driver.getPageSource();
            Path pageSourcePath = context.artifactDirectory.resolve(LambdaTestConfig.timestamp() + "-" + LambdaTestConfig.sanitizeFileName(label) + ".xml");
            LambdaTestConfig.writeTextFile(pageSourcePath, pageSource);
            log("Saved page source: " + pageSourcePath.toAbsolutePath());
            return pageSourcePath;
        } catch (Exception exception) {
            log("Unable to capture page source for '" + label + "': " + exception.getMessage());
            return null;
        }
    }

    static Path captureTextArtifact(String label, String content) {
        ExecutionContext context = CONTEXT.get();
        if (context == null) {
            log("Text artifact skipped for '" + label + "' because execution context is not available.");
            return null;
        }

        try {
            Path textArtifactPath = context.artifactDirectory.resolve(LambdaTestConfig.timestamp() + "-" + LambdaTestConfig.sanitizeFileName(label) + ".txt");
            LambdaTestConfig.writeTextFile(textArtifactPath, content == null ? "" : content);
            log("Saved text artifact: " + textArtifactPath.toAbsolutePath());
            return textArtifactPath;
        } catch (Exception exception) {
            log("Unable to capture text artifact for '" + label + "': " + exception.getMessage());
            return null;
        }
    }

    static Path getArtifactDirectory() {
        ExecutionContext context = CONTEXT.get();
        return context == null ? null : context.artifactDirectory;
    }

    static void finishTest(String status) {
        Path artifactDirectory = getArtifactDirectory();
        log("Execution status: " + status + (artifactDirectory == null ? "" : " | Artifacts: " + artifactDirectory.toAbsolutePath()));
        finishContext();
    }

    private static void finishContext() {
        ExecutionContext context = CONTEXT.get();
        if (context != null) {
            context.writer.flush();
            context.writer.close();
            CONTEXT.remove();
        }
    }

    private static final class ExecutionContext {
        private final Path artifactDirectory;
        private final PrintWriter writer;
        private AppiumDriver driver;

        private ExecutionContext(Path artifactDirectory, PrintWriter writer) {
            this.artifactDirectory = artifactDirectory;
            this.writer = writer;
        }
    }
}
