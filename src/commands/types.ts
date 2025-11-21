type ArgParts = {
    name: string;
    description?: string;
    defaultValue?: unknown;
};

type ActionFunction = (...args: unknown[]) => Promise<void>;

export type AppCommand = {
    command: string;
    description: string;
    action: ActionFunction;
    arguments?: ArgParts[];
};

// Helper type for creating type-safe action functions with explicit return type
export type TypedActionFunction<T extends unknown[]> = (...args: T) => Promise<void>;

// Helper function to create type-safe commands
export function createTypedCommand<T extends unknown[]>(
    config: {
        command: string;
        description: string;
        arguments?: ArgParts[];
    },
    action: TypedActionFunction<T>
): AppCommand {
    return {
        ...config,
        action: action as ActionFunction,
    };
}
