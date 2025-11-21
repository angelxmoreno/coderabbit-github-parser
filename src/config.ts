import type { Logger } from 'pino';
import { container } from 'tsyringe';
import { APP_LOGGER_TOKEN, DEFAULT_LOG_LEVEL, LOG_LEVEL_TOKEN, type LogLevel } from './types/di-tokens.ts';
import { createLogger } from './utils/createLogger.ts';

// Export tokens for use in other modules
export const AppLogger = APP_LOGGER_TOKEN;
export const LogLevelDI = LOG_LEVEL_TOKEN;

const appContainer = container.createChildContainer();

// Register default log level with proper typing
appContainer.register<LogLevel>(LOG_LEVEL_TOKEN, { useValue: DEFAULT_LOG_LEVEL });

// Register logger factory with proper typing - no type assertion needed
appContainer.register<Logger>(APP_LOGGER_TOKEN, {
    useFactory: (container) => {
        const level = container.resolve<LogLevel>(LOG_LEVEL_TOKEN);
        return createLogger(level);
    },
});

export { appContainer };
