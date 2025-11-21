import type { Logger } from 'pino';
import { container, type InjectionToken } from 'tsyringe';
import { createLogger } from './utils/createLogger.ts';

export const AppLogger: InjectionToken<Logger> = 'Logger';
export const LogLevel: InjectionToken<string> = 'LogLevel';

const appContainer = container.createChildContainer();

// Register default log level
appContainer.register<string>(LogLevel, { useValue: 'info' });

// Register logger factory that uses the log level
appContainer.register<Logger>(AppLogger, {
    useFactory: (container) => {
        const level = container.resolve(LogLevel) as string;
        return createLogger(level);
    },
});

export { appContainer };
