#!/usr/bin/env bun
import { Command } from 'commander';
import { helloProgram } from './commands/HelloCommand.ts';
import { installTemplateProgram } from './commands/InstallTemplateCommand.ts';
import { prCodeRabbitProgram } from './commands/PrCodeRabbitCommand.ts';
import { prProgram } from './commands/PrCommand.ts';
import { prCommentsProgram } from './commands/PrCommentsCommand.ts';
import { reviewCurrentProgram } from './commands/ReviewCurrentCommand.ts';
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
        // Register debug log level before any logger resolution
        appContainer.register<LogLevel>(LogLevelDI, { useValue: 'debug' });
    }
});

// Register commands
registerCommand(program, helloProgram);
registerCommand(program, installTemplateProgram);
registerCommand(program, prProgram);
registerCommand(program, prCommentsProgram);
registerCommand(program, prCodeRabbitProgram);
registerCommand(program, reviewCurrentProgram);

// Error handling
program.exitOverride();

try {
    await program.parseAsync(process.argv); // Use parseAsync and await it
    process.exit(0); // Exit successfully after async operations complete
} catch (error: unknown) {
    // Resolve logger here, after parseAsync/preAction has run
    const logger = appContainer.resolve(AppLogger);

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
