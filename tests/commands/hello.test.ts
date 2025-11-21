import { describe, expect, test } from 'bun:test';
import { helloProgram } from '../../src/commands/HelloCommand.ts';
import { getLogMessages, testCommandAction } from '../utils/command-test-helpers.ts';

describe('HelloCommand', () => {
    test('should greet with provided name', async () => {
        const { mockLogger } = await testCommandAction(helloProgram.action, ['Alice']);

        const infoMessages = getLogMessages(mockLogger, 'info');
        expect(infoMessages).toContain('Hello Alice!');
    });

    test('should greet with World when no name provided', async () => {
        const { mockLogger } = await testCommandAction(helloProgram.action, ['World']);

        const infoMessages = getLogMessages(mockLogger, 'info');
        expect(infoMessages).toContain('Hello World!');
    });

    test('should log debug information when in debug mode', async () => {
        const { mockLogger } = await testCommandAction(helloProgram.action, ['Alice'], 'debug');

        const debugMessages = getLogMessages(mockLogger, 'debug');
        expect(debugMessages).toContain('arguments received');

        const infoMessages = getLogMessages(mockLogger, 'info');
        expect(infoMessages).toContain('Hello Alice!');
    });
});
