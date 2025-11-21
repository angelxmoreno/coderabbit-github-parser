import type { Logger } from 'pino';
import type { LogLevel } from '../../src/types/di-tokens.ts';

export interface MockLogger extends Logger {
    calls: {
        level: string;
        message?: string;
        data?: unknown;
    }[];
    clearCalls: () => void;
}

/**
 * Create a mock pino logger for testing that captures log calls
 * and implements the full Logger interface
 */
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
        // MockLogger specific properties
        calls,
        clearCalls: () => {
            calls.length = 0;
        },

        // Basic pino logger properties
        level,
        version: '1.0.0',
        levels: { values: {}, labels: {} },

        // Log methods
        trace: logMethod('trace'),
        debug: logMethod('debug'),
        info: logMethod('info'),
        warn: logMethod('warn'),
        error: logMethod('error'),
        fatal: logMethod('fatal'),

        // pino specific methods - minimal implementation for testing
        silent: () => mockLogger,
        child: () => mockLogger,
        bindings: () => ({}),
        flush: () => {},
        isLevelEnabled: () => true,

        // Extended pino properties (minimal implementations)
        useLevelLabels: false,
        levelVal: 30, // info level
        msgPrefix: '',
        on: () => mockLogger,
        addLevel: () => mockLogger,

        // Symbol properties that pino uses internally
        [Symbol.for('pino.messageKey')]: 'msg',
        [Symbol.for('pino.levelKey')]: 'level',
        [Symbol.for('pino.timeKey')]: 'time',
        [Symbol.for('pino.errorKey')]: 'err',
        [Symbol.for('pino.serializers')]: {},
        [Symbol.for('pino.hooks')]: {},
        [Symbol.for('pino.stream')]: null,
        [Symbol.for('pino.time')]: () => Date.now(),
        [Symbol.for('pino.chindings')]: '',
        [Symbol.for('pino.formatters')]: {},
        [Symbol.for('pino.messageKeyMeta')]: {},
        [Symbol.for('pino.levelKeyMeta')]: {},
        [Symbol.for('pino.stringify')]: JSON.stringify,
        [Symbol.for('pino.stringifyers')]: {},
        [Symbol.for('pino.end')]: '}\n',
        [Symbol.for('pino.lsCache')]: {},
        [Symbol.for('pino.chindingsSym')]: '',
        [Symbol.for('pino.logMethod')]: () => {},
    } as unknown as MockLogger;

    return mockLogger;
};
