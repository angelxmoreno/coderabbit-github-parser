// Valid log levels with strict typing
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export const DEFAULT_LOG_LEVEL: LogLevel = 'info';

// Well-typed injection tokens
export const APP_LOGGER_TOKEN = 'AppLogger' as const;
export const LOG_LEVEL_TOKEN = 'LogLevel' as const;
