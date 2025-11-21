import type { Logger } from 'pino';
import { AppLogger, appContainer } from '../config.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

const helloAction: TypedActionFunction<[name: string]> = async (name: string): Promise<void> => {
    const logger = appContainer.resolve<Logger>(AppLogger);
    logger.debug({ args: { name } }, 'arguments received');
    logger.info(`Hello ${name}!`);
};

export const helloProgram = createTypedCommand(
    {
        command: 'hello',
        description: 'says hello',
        arguments: [
            {
                name: '[name]',
                description: 'the person to greet',
                defaultValue: 'World',
            },
        ],
    },
    helloAction
);
