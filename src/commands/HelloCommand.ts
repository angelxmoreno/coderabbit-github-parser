import { AppLogger, appContainer } from '../config.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

const helloAction: TypedActionFunction<[name: string]> = async (name: string) => {
    const logger = appContainer.resolve(AppLogger);
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
