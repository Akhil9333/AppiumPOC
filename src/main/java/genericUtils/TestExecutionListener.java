package genericUtils;

import io.appium.java_client.AppiumDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.lang.reflect.Field;
import java.util.Arrays;

public class TestExecutionListener implements ITestListener {

    @Override
    public void onTestStart(ITestResult result) {
        String suiteName = result.getTestContext() == null ? "Mobile" : result.getTestContext().getSuite().getName();
        String testName = result.getMethod().getQualifiedName();
        ExecutionReporter.startTest(suiteName, testName);
        ExecutionReporter.log("Starting test execution.");
        ExecutionReporter.log("Parameters: " + Arrays.toString(result.getParameters()));
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        AppiumDriver driver = resolveDriver(result);
        if (driver != null) {
            ExecutionReporter.attachDriver(driver);
            ExecutionReporter.captureScreenshot("test-passed");
        }
        ExecutionReporter.log("Test passed.");
        ExecutionReporter.finishTest("PASSED");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        AppiumDriver driver = resolveDriver(result);
        if (driver != null) {
            ExecutionReporter.attachDriver(driver);
            ExecutionReporter.captureScreenshot("listener-failure");
            ExecutionReporter.capturePageSource("listener-failure");
        }
        ExecutionReporter.logException("Test failed", result.getThrowable());
        ExecutionReporter.finishTest("FAILED");
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        ExecutionReporter.log("Test skipped.");
        ExecutionReporter.logException("Skip reason", result.getThrowable());
        ExecutionReporter.finishTest("SKIPPED");
    }

    @Override
    public void onStart(ITestContext context) {
        System.out.println("[TestExecutionListener] Starting suite: " + context.getSuite().getName());
    }

    @Override
    public void onFinish(ITestContext context) {
        System.out.println("[TestExecutionListener] Finished suite: " + context.getSuite().getName());
    }

    private AppiumDriver resolveDriver(ITestResult result) {
        Object instance = result.getInstance();
        if (instance == null) {
            return null;
        }

        Class<?> type = instance.getClass();
        while (type != null) {
            for (Field field : type.getDeclaredFields()) {
                if (!AppiumDriver.class.isAssignableFrom(field.getType())) {
                    continue;
                }
                try {
                    field.setAccessible(true);
                    Object value = field.get(instance);
                    if (value instanceof AppiumDriver) {
                        return (AppiumDriver) value;
                    }
                } catch (IllegalAccessException ignored) {
                }
            }
            type = type.getSuperclass();
        }

        return null;
    }
}

