import { type Logger, pino } from 'pino';
import type { LogLevel } from '../types/di-tokens.ts';

export const createLogger = (level: LogLevel = 'info'): Logger => {
    return pino({
        level,
        transport: {
            target: 'pino-pretty',
        },
    });
};
