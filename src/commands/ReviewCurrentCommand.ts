import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppLogger, appContainer } from '../config.ts';
import { GitHubService } from '../services/GitHubService.ts';
import { runBashCommand } from '../utils/runBashCli.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

const reviewCurrentAction: TypedActionFunction<[]> = async (): Promise<void> => {
    const logger = appContainer.resolve(AppLogger);
    const ghService = appContainer.resolve(GitHubService);
    logger.debug('Getting current PR and generating review comments');

    try {
        // Step 1: Get the current PR
        const currentPr = await ghService.getCurrentPr();
        if (!currentPr) {
            logger.error('No current PR found. Make sure you are on a branch with an associated pull request.');
            process.exit(1);
        }

        const prNumber = currentPr.number;
        logger.debug({ prNumber }, 'Found current PR');

        // Step 2: Ensure review-comments directory exists
        const reviewCommentsDir = 'review-comments';
        if (!fs.existsSync(reviewCommentsDir)) {
            fs.mkdirSync(reviewCommentsDir, { recursive: true });
            logger.debug({ dir: reviewCommentsDir }, 'Created review-comments directory');
        }

        // Step 3: Call pr:coderabbit command to get markdown output
        const outputFile = path.join(reviewCommentsDir, `pr${prNumber}.md`);

        // Detect if we're in development (source files exist) vs installed package
        const isDevMode = fs.existsSync(path.join(process.cwd(), 'src', 'cli.ts'));

        const cliCommand = isDevMode
            ? `bun pr:coderabbit ${prNumber} --format markdown`
            : `cgp pr:coderabbit ${prNumber} --format markdown`;

        logger.debug({ command: cliCommand, outputFile }, 'Calling pr:coderabbit command');

        const result = await runBashCommand(cliCommand, logger);
        const markdownContent = result.stdout.toString();

        // Step 4: Write the markdown to file
        fs.writeFileSync(outputFile, markdownContent, 'utf8');

        // Step 5: Report success
        logger.info(`✅ CodeRabbit review comments saved to: ${outputFile}`);
        logger.info(`📋 Found PR #${prNumber}: ${currentPr.title}`);

        // Count comments from the markdown content
        const commentCount = (markdownContent.match(/^### \d+\./gm) || []).length;
        logger.info(`💬 Generated analysis for ${commentCount} active CodeRabbit comments`);

        // Provide next steps
        logger.info('');
        logger.info('📖 Next steps:');
        logger.info(`   1. Review the comments in: ${outputFile}`);
        logger.info('   2. Use the prompt template at: project-docs/prompt-review-template.md');
        logger.info(`   3. Call ClaudeCode: /coderabbit-review ${outputFile}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ error: errorMessage }, 'Failed to generate review comments');
        console.error(`❌ Error: ${errorMessage}`);
        process.exit(1);
    }
};

export const reviewCurrentProgram = createTypedCommand(
    {
        command: 'review:current',
        description: 'Generate CodeRabbit review comments for the current PR branch',
        options: [],
    },
    reviewCurrentAction
);
