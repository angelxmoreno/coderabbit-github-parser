import { describe, expect, test } from 'bun:test';
import { runBashCommand } from '../../src/utils/runBashCli.ts';
import { createMockLogger } from '../helpers/createMockLogger.ts';

describe('runBashCommand', () => {
    test('should execute command successfully', async () => {
        const result = await runBashCommand('ls');

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBeDefined();
    });

    test('should log command execution with mock logger', async () => {
        const mockLogger = createMockLogger('debug');

        // Use a simple command that should work
        await runBashCommand('pwd', mockLogger);

        expect(mockLogger.calls.length).toBeGreaterThanOrEqual(2); // debug start + debug success
        expect(mockLogger.calls[0]?.level).toBe('debug');
        expect(mockLogger.calls[0]?.message).toBe('Executing shell command');
        expect(mockLogger.calls.some((call) => call.message === 'Command completed successfully')).toBe(true);
    });

    test('should handle command failure with logging', async () => {
        const mockLogger = createMockLogger('debug');

        // Use a command that will definitely fail
        await expect(runBashCommand('nonexistentcommand12345', mockLogger)).rejects.toThrow();

        // Should have debug start + error log
        expect(mockLogger.calls.some((call) => call.level === 'debug')).toBe(true);
        expect(mockLogger.calls.some((call) => call.level === 'error')).toBe(true);
        expect(mockLogger.calls.some((call) => call.message === 'Command execution failed')).toBe(true);
    });
});
