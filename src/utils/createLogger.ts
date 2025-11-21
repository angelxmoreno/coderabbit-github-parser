import { type Logger, pino } from 'pino';

export const createLogger = (level: string = 'info'): Logger => {
    return pino({
        level,
        transport: {
            target: 'pino-pretty',
        },
    });
};
