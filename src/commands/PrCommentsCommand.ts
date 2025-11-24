import type { Logger } from 'pino';
import { table } from 'table';
import { AppLogger, appContainer } from '../config.ts';
import { GitHubService, type PrCommentsOptions } from '../services/GitHubService.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

type PrCommentsCommandOptions = {
    repo?: string;
    format?: 'table' | 'json';
};

const prCommentsAction: TypedActionFunction<[prIdentifier: string], PrCommentsCommandOptions> = async (
    prIdentifier: string,
    options
): Promise<void> => {
    const logger = appContainer.resolve<Logger>(AppLogger);
    const ghService = appContainer.resolve(GitHubService);

    logger.debug({ prIdentifier, options }, 'fetching PR comments');

    // Convert command options to service options
    const serviceOptions: PrCommentsOptions = {
        prIdentifier,
        repo: options.repo,
    };

    const comments = await ghService.getPrComments(serviceOptions);
    logger.debug({ comments: comments.length }, 'fetched PR comments');

    if (options.format === 'json') {
        console.log(JSON.stringify(comments, null, 2));
        return;
    }

    // Default table format
    if (comments.length === 0) {
        console.log('No comments found for this PR.');
        return;
    }

    // Get terminal width for responsive table sizing
    const terminalWidth = process.stdout.columns || 120;
    const availableContentWidth = Math.max(30, terminalWidth - 40); // Reserve space for other columns
    const previewWidth = Math.min(50, Math.floor(availableContentWidth * 0.6));
    const locationWidth = Math.min(20, Math.floor(availableContentWidth * 0.4));

    const makePreview = (body: string): string => {
        const cleanBody = body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        return cleanBody.slice(0, previewWidth - 3) + (cleanBody.length > previewWidth - 3 ? '...' : '');
    };

    const truncateLocation = (location: string): string => {
        return location.length > locationWidth ? `${location.slice(0, locationWidth - 3)}...` : location;
    };

    const data: string[][] = [['Type', 'Author', 'Created', 'Location', 'Comment Preview']];

    for (const comment of comments) {
        let createdDate: string;
        let author: string;
        let location: string;
        let bodyPreview: string;

        if (comment.type === 'conversation') {
            createdDate = new Date(comment.createdAt).toLocaleDateString();
            author = comment.author.login.slice(0, 12); // Truncate long usernames
            location = 'Conversation';
            bodyPreview = makePreview(comment.body);
        } else {
            createdDate = new Date(comment.created_at).toLocaleDateString();
            author = comment.user.login.slice(0, 12); // Truncate long usernames
            const locParts = [comment.path, comment.line?.toString()].filter(Boolean);
            location = truncateLocation(locParts.length ? locParts.join(':') : 'Review');
            bodyPreview = makePreview(comment.body);
        }

        data.push([comment.type === 'conversation' ? '💬' : '📝', author, createdDate, location, bodyPreview]);
    }

    try {
        console.log(
            table(data, {
                columns: {
                    0: { width: 4 }, // Type emoji
                    1: { width: 12, wrapWord: true }, // Author
                    2: { width: 10 }, // Date
                    3: { width: locationWidth, wrapWord: true }, // Location
                    4: { width: previewWidth, wrapWord: true }, // Preview
                },
                columnDefault: {
                    wrapWord: true,
                },
            })
        );
    } catch (_error) {
        // Fallback to simple text output if table fails
        logger.warn('Table rendering failed, falling back to simple output');

        for (let i = 1; i < data.length; i++) {
            const [type, author, date, location, preview] = data[i];
            console.log(`${type} ${author} (${date}) - ${location}`);
            console.log(`  ${preview}\n`);
        }
    }

    const conversationCount = comments.filter((c) => c.type === 'conversation').length;
    const reviewCount = comments.filter((c) => c.type === 'review').length;

    console.log(`\nTotal comments: ${comments.length}`);
    console.log(`💬 Conversation: ${conversationCount} | 📝 Review: ${reviewCount}`);
};

export const prCommentsProgram = createTypedCommand(
    {
        command: 'pr:comments <prIdentifier>',
        description: 'fetch comments for a specific PR',
        options: [
            {
                flags: '-R, --repo <repo>',
                description: 'Select another repository using [HOST/]OWNER/REPO format',
            },
            {
                flags: '-f, --format <format>',
                description: 'Output format: table or json',
                defaultValue: 'table',
            },
        ],
    },
    prCommentsAction
);
