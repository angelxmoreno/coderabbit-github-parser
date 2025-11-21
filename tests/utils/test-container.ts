import { container } from 'tsyringe';
import { APP_LOGGER_TOKEN, LOG_LEVEL_TOKEN, type LogLevel } from '../../src/types/di-tokens.ts';

// Mock logger that collects log calls for testing
export interface MockLogger {
    level: string;
    calls: {
        level: string;
        message?: string;
        data?: unknown;
    }[];
    clearCalls: () => void;
    // Minimal pino-compatible methods for testing
    trace: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    debug: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    info: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    warn: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    error: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    fatal: (msgOrObj?: unknown, msg?: string, ...args: unknown[]) => void;
    silent: () => MockLogger;
    child: () => MockLogger;
    bindings: () => object;
    flush: () => void;
    isLevelEnabled: () => boolean;
}

export const createMockLogger = (level: LogLevel = 'info'): MockLogger => {
    const calls: MockLogger['calls'] = [];

    // Create proper logger method implementations that match pino's signature
    const logMethod = (logLevel: string) => {
        return (msgOrObj?: unknown, msg?: string, ..._args: unknown[]) => {
            // Handle pino's flexible parameter signature
            if (typeof msgOrObj === 'string') {
                // logger.info('message')
                calls.push({ level: logLevel, message: msgOrObj, data: undefined });
            } else if (typeof msgOrObj === 'object' && msg) {
                // logger.info(obj, 'message')
                calls.push({ level: logLevel, message: msg, data: msgOrObj });
            } else if (msgOrObj) {
                // logger.info(obj)
                calls.push({ level: logLevel, message: undefined, data: msgOrObj });
            }
        };
    };

    const mockLogger: MockLogger = {
        level,
        calls,
        clearCalls: () => {
            calls.length = 0;
        },
        trace: logMethod('trace'),
        debug: logMethod('debug'),
        info: logMethod('info'),
        warn: logMethod('warn'),
        error: logMethod('error'),
        fatal: logMethod('fatal'),
        // Add other methods as stubs - minimal implementation for testing
        silent: () => mockLogger,
        child: () => mockLogger,
        bindings: () => ({}),
        flush: () => {},
        isLevelEnabled: () => true,
    };

    return mockLogger;
};

// Create test container with mocks
export const createTestContainer = (logLevel: LogLevel = 'info') => {
    const testContainer = container.createChildContainer();
    const mockLogger = createMockLogger(logLevel);

    // Register mocks
    testContainer.register<LogLevel>(LOG_LEVEL_TOKEN, { useValue: logLevel });
    testContainer.register<MockLogger>(APP_LOGGER_TOKEN, { useValue: mockLogger });

    return { testContainer, mockLogger };
};
