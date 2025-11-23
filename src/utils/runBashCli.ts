import { $ } from 'bun';
import type { Logger } from 'pino';
import { createLogger } from './createLogger.ts';

export type ShellRunner = (command: string, logger?: Logger) => Promise<ShellOutput>;
export type ShellOutput = Awaited<ReturnType<typeof $>>;

/**
 * Execute a shell command with logging and error handling
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await runBashCommand('git status');
 *
 * // With custom logger
 * const result = await runBashCommand('git status', logger);
 *
 * // Check exit code
 * const result = await runBashCommand('npm test');
 * if (result.exitCode === 0) {
 *   console.log('Tests passed!');
 * }
 * ```
 */
export const runBashCommand: ShellRunner = async (command: string, logger?: Logger): Promise<ShellOutput> => {
    const parentLogger = logger ?? createLogger();
    const childLogger = parentLogger.child({ module: 'runBashCommand' });

    childLogger.debug({ command }, 'Executing shell command');

    try {
        // Execute command through shell to handle quoted arguments properly
        const result = await $`sh -c ${command}`.quiet();

        childLogger.debug(
            {
                command,
                exitCode: result.exitCode,
                stdout: result.stdout.toString().slice(0, 200), // Truncate for logging
            },
            'Command completed successfully'
        );

        return result;
    } catch (error) {
        childLogger.error(
            {
                command,
                error: error instanceof Error ? error.message : String(error),
            },
            'Command execution failed'
        );
        throw error;
    }
};
