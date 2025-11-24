import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import { AppLogger, appContainer } from '../config.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

type InstallTemplateOptions = {
    force?: boolean;
    target?: string;
    filename?: string;
    scope?: 'project' | 'global';
    interactive?: boolean;
};

type InstallScope = 'project' | 'global';

const DEFAULT_FILENAME = 'coderabbit-review-template.md';
const PROJECT_COMMANDS_DIR = '.claude/commands'; // User's project directory
const GLOBAL_COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands');

const installTemplateAction: TypedActionFunction<[], InstallTemplateOptions> = async (options): Promise<void> => {
    const logger = appContainer.resolve(AppLogger);

    logger.debug({ options }, 'Starting template installation');

    // Resolve source file from the installed package
    // Try multiple locations to find the template file
    const possibleSourcePaths = [
        // When running from development (this project)
        path.resolve(process.cwd(), 'project-docs', 'prompt-review-template.md'),
        // When installed as npm package
        path.resolve(__dirname, '..', '..', 'project-docs', 'prompt-review-template.md'),
        // Alternative npm package location
        path.resolve(__dirname, '..', '..', '..', 'project-docs', 'prompt-review-template.md'),
        // When using import.meta.url (ES modules)
        path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            '..',
            '..',
            'project-docs',
            'prompt-review-template.md'
        ),
    ];

    let sourceFile: string | undefined;
    for (const possiblePath of possibleSourcePaths) {
        if (fs.existsSync(possiblePath)) {
            sourceFile = possiblePath;
            break;
        }
    }

    if (!sourceFile) {
        logger.error({ possibleSourcePaths }, 'Source template file not found in any expected location');
        logger.error('Template file could not be located in the installed package.');
        throw new Error('Template file not found');
    }

    // Determine installation scope and paths
    let scope: InstallScope;
    let targetDir: string;
    let filename: string;

    if (options.interactive !== false) {
        // Interactive mode (default)
        scope =
            options.scope ||
            (await select({
                message: 'Where would you like to install the CodeRabbit review template?',
                choices: [
                    {
                        name: 'Global Claude commands (~/.claude/commands) - Available in all projects',
                        value: 'global' as const,
                        description: 'Install globally for use across all projects',
                    },
                    {
                        name: 'Project Claude commands (./.claude/commands) - This project only',
                        value: 'project' as const,
                        description: 'Install locally in current project directory',
                    },
                ],
                default: 'global',
            }));

        // Get target directory based on scope
        const defaultTargetDir = scope === 'global' ? GLOBAL_COMMANDS_DIR : PROJECT_COMMANDS_DIR;
        targetDir = options.target || defaultTargetDir;

        // Ask for custom directory if user wants to override
        if (!options.target) {
            const useCustomDir = await confirm({
                message: `Install to ${targetDir}?`,
                default: true,
            });

            if (!useCustomDir) {
                targetDir = await input({
                    message: 'Enter custom target directory:',
                    default: defaultTargetDir,
                });
            }
        }

        // Get filename
        filename =
            options.filename ||
            (await input({
                message: 'Template filename:',
                default: DEFAULT_FILENAME,
            }));
    } else {
        // Non-interactive mode
        scope = options.scope || 'global';
        const defaultTargetDir = scope === 'global' ? GLOBAL_COMMANDS_DIR : PROJECT_COMMANDS_DIR;
        targetDir = options.target || defaultTargetDir;
        filename = options.filename || DEFAULT_FILENAME;
    }

    const targetFile = path.join(targetDir, filename);

    logger.debug({ scope, targetDir, filename, targetFile }, 'Installation paths resolved');

    try {
        // Check if target directory exists, create if it doesn't
        if (!fs.existsSync(targetDir)) {
            logger.info({ targetDir }, 'Creating target directory');
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Check if target file already exists
        if (fs.existsSync(targetFile) && !options.force) {
            if (options.interactive !== false) {
                const overwrite = await confirm({
                    message: `File already exists at ${targetFile}. Overwrite?`,
                    default: false,
                });

                if (!overwrite) {
                    logger.info('Installation cancelled by user');
                    return;
                }
            } else {
                logger.warn({ targetFile }, 'Target file already exists');
                logger.error('File already exists. Use --force to overwrite the existing file.');
                throw new Error('File already exists');
            }
        }

        // Copy the template file
        logger.info({ sourceFile, targetFile }, 'Copying template file');
        const templateContent = fs.readFileSync(sourceFile, 'utf-8');
        fs.writeFileSync(targetFile, templateContent, 'utf-8');

        logger.info('Template installed successfully!');
        logger.info(`📄 Location: ${targetFile}`);
        logger.info('📖 Usage:');
        logger.info('1. Generate CodeRabbit comments:');
        logger.info('   bun pr:coderabbit <PR_NUMBER> --format markdown > review-comments/pr<PR_NUMBER>.md');
        logger.info('2. Use the template from your Claude commands directory');
        logger.info('3. Follow the examples in the template for different analysis types');

        if (scope === 'global') {
            logger.info('🌐 Template installed globally - available in all projects');
        } else {
            logger.info('📁 Template installed locally - available in this project only');
        }

        logger.debug({ targetFile, scope }, 'Template installation completed successfully');
    } catch (error: unknown) {
        logger.error(error, 'Failed to install template');
        throw error;
    }
};

export const installTemplateProgram = createTypedCommand(
    {
        command: 'install:template',
        description: 'Install CodeRabbit review template to Claude commands directory',
        options: [
            {
                flags: '--force',
                description: 'Overwrite existing template file if it exists',
            },
            {
                flags: '--target <path>',
                description: 'Custom target directory',
            },
            {
                flags: '--filename <name>',
                description: `Custom filename (default: ${DEFAULT_FILENAME})`,
            },
            {
                flags: '--scope <scope>',
                description: 'Installation scope: project or global (default: interactive prompt)',
            },
            {
                flags: '--no-interactive',
                description: 'Run in non-interactive mode with defaults',
            },
        ],
    },
    installTemplateAction
);
