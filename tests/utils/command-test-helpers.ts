import type { Logger } from 'pino';
import { appContainer } from '../../src/config.ts';
import { APP_LOGGER_TOKEN } from '../../src/types/di-tokens.ts';
import { createTestContainer, type MockLogger } from './test-container.ts';

// Helper for testing command actions with mocked dependencies
export const testCommandAction = async (
    commandAction: (...args: unknown[]) => Promise<void>,
    args: unknown[] = [],
    logLevel: 'debug' | 'info' = 'info'
): Promise<{
    mockLogger: MockLogger;
}> => {
    const { mockLogger } = createTestContainer(logLevel);

    // Temporarily replace the logger in the main container for testing
    const originalLogger = appContainer.resolve<Logger>(APP_LOGGER_TOKEN);
    appContainer.register<MockLogger>(APP_LOGGER_TOKEN, { useValue: mockLogger });

    try {
        // Execute the command action
        await commandAction(...args);
        return { mockLogger };
    } finally {
        // Restore original logger
        appContainer.register<Logger>(APP_LOGGER_TOKEN, { useValue: originalLogger });
    }
};

// Helper to extract log messages by level
export const getLogMessages = (mockLogger: MockLogger, level: string): string[] => {
    return mockLogger.calls
        .filter((call) => call.level === level)
        .map((call) => call.message)
        .filter((message): message is string => message !== undefined);
};

// Helper to get log data by level
export const getLogData = (mockLogger: MockLogger, level: string): unknown[] => {
    return mockLogger.calls.filter((call) => call.level === level).map((call) => call.data);
};
