# Testing Guide

This document outlines the testing patterns and utilities available in this project.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── utils/
│   ├── test-container.ts        # DI container mocking utilities
│   ├── command-test-helpers.ts  # Command testing helpers
│   └── createLogger.test.ts     # Utility function tests
└── commands/
    └── hello.test.ts           # Command implementation tests
```

## Testing Patterns

### 1. Command Testing

Use `testCommandAction` to test command implementations with mocked dependencies:

```typescript
import { testCommandAction, getLogMessages } from '../utils/command-test-helpers.ts';
import { myCommand } from '../../src/commands/MyCommand.ts';

test('should execute command correctly', async () => {
    const { mockLogger } = await testCommandAction(myCommand.action, ['arg1', 'arg2']);

    const infoMessages = getLogMessages(mockLogger, 'info');
    expect(infoMessages).toContain('Expected message');
});
```

### 2. Debug Mode Testing

Test commands with debug logging enabled:

```typescript
test('should show debug info in debug mode', async () => {
    const { mockLogger } = await testCommandAction(myCommand.action, ['arg1'], 'debug');

    const debugMessages = getLogMessages(mockLogger, 'debug');
    expect(debugMessages).toContain('Debug information');
});
```

### 3. Utility Function Testing

Test utility functions directly:

```typescript
import { createLogger } from '../../src/utils/createLogger.ts';

test('should create logger with specified level', () => {
    const logger = createLogger('error');
    expect(logger.level).toBe('error');
});
```

## Available Test Utilities

### `testCommandAction(commandAction, args, logLevel)`

- **Purpose**: Execute command actions with mocked logger
- **Parameters**:
  - `commandAction`: The command's action function
  - `args`: Array of arguments to pass
  - `logLevel`: 'info' or 'debug' (default: 'info')
- **Returns**: `{ mockLogger }` with captured log calls

### `getLogMessages(mockLogger, level)`

- **Purpose**: Extract log messages by level
- **Parameters**:
  - `mockLogger`: The mock logger instance
  - `level`: Log level to filter by ('trace', 'debug', 'info', 'warn', 'error', 'fatal')
- **Returns**: Array of log messages as strings

### `getLogData(mockLogger, level)`

- **Purpose**: Extract log data objects by level
- **Parameters**: Same as `getLogMessages`
- **Returns**: Array of log data objects

### `createMockLogger(level)` (from `helpers/createMockLogger.ts`)

- **Purpose**: Create a fully-compatible pino mock logger for testing
- **Parameters**:
  - `level`: Initial log level (default: 'info')
- **Returns**: MockLogger instance that implements full Logger interface with call tracking
- **Usage**: Provides a proper pino Logger mock without type casting needed

### `createTestContainer(logLevel)`

- **Purpose**: Create isolated DI container for testing
- **Parameters**:
  - `logLevel`: Log level for the container (default: 'info')
- **Returns**: `{ testContainer, mockLogger }`

## Best Practices

1. **Use descriptive test names** that explain what the test verifies
2. **Test both success and error cases** for commands
3. **Verify log output** to ensure proper user feedback
4. **Test debug mode** to ensure debugging information is available
5. **Keep tests isolated** - each test should be independent
6. **Use the test helpers** rather than mocking dependencies manually

## Running Tests

```bash
# Run all tests
bun test

# Run tests with type checking
bun run check

# Run specific test file
bun test tests/commands/hello.test.ts
```