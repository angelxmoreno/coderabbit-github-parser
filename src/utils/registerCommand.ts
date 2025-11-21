import type { Command } from 'commander';
import type { AppCommand } from '../commands/types.ts';

export const registerCommand = (program: Command, command: AppCommand) => {
    const cmd = program.command(command.command).description(command.description);

    if (command.arguments) {
        for (const arg of command.arguments) {
            cmd.argument(arg.name, arg.description, arg.defaultValue);
        }
    }

    cmd.action(command.action);
};
