import { describe, expect, test } from 'bun:test';
import { createLogger } from '../../src/utils/createLogger.ts';

describe('createLogger', () => {
    test('should create logger with default info level', () => {
        const logger = createLogger();
        expect(logger.level).toBe('info');
    });

    test('should create logger with specified level', () => {
        const logger = createLogger('debug');
        expect(logger.level).toBe('debug');
    });

    test('should create logger with error level', () => {
        const logger = createLogger('error');
        expect(logger.level).toBe('error');
    });
});
