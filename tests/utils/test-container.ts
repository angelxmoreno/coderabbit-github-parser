import { container } from 'tsyringe';
import { APP_LOGGER_TOKEN, LOG_LEVEL_TOKEN, type LogLevel } from '../../src/types/di-tokens.ts';
import { createMockLogger, type MockLogger } from '../helpers/createMockLogger.ts';

// Create test container with mocks
export const createTestContainer = (logLevel: LogLevel = 'info') => {
    const testContainer = container.createChildContainer();
    const mockLogger = createMockLogger(logLevel);

    // Register mocks
    testContainer.register<LogLevel>(LOG_LEVEL_TOKEN, { useValue: logLevel });
    testContainer.register<MockLogger>(APP_LOGGER_TOKEN, { useValue: mockLogger });

    return { testContainer, mockLogger };
};
