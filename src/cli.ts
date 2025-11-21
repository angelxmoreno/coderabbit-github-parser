#!/usr/bin/env bun
import 'reflect-metadata';
import { Command } from 'commander';
import type { Logger } from 'pino';
import { helloProgram } from './commands/HelloCommand.ts';
import { AppLogger, appContainer, LogLevelDI } from './config.ts';
import type { LogLevel } from './types/di-tokens.ts';
import { registerCommand } from './utils/registerCommand.ts';

const program = new Command();

program
    .name('coderabbit-github-parser')
    .description('A CLI tool that fetches GitHub PR comments and parses them to markdown for AI agent consumption')
    .version('0.1.0')
    .option('-d, --debug', 'output extra debugging information');

program.hook('preAction', () => {
    if (program.opts().debug) {
        // Update the log level before resolving logger
        appContainer.register<LogLevel>(LogLevelDI, { useValue: 'debug' });
    }
});

// Register commands
registerCommand(program, helloProgram);

// Error handling
program.exitOverride();

try {
    await program.parseAsync(process.argv); // Use parseAsync and await it
    process.exit(0); // Exit successfully after async operations complete
} catch (error: unknown) {
    // Resolve logger here, after parseAsync/preAction has run
    const logger = appContainer.resolve<Logger>(AppLogger);

    if (error instanceof Error && 'code' in error) {
        if (error.code === 'commander.help' || error.code === 'commander.helpDisplayed') {
            process.exit(0);
        }
        if (error.code === 'commander.version') {
            process.exit(0);
        }
    }

    logger.error(error, '❌ CLI Error:');
    process.exit(1);
}
