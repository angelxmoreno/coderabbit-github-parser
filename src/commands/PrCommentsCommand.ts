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

    const data: string[][] = [['Type', 'Author', 'Created', 'Location', 'Comment Preview']];

    for (const comment of comments) {
        let createdDate: string;
        let author: string;
        let location: string;
        let bodyPreview: string;

        if (comment.type === 'conversation') {
            createdDate = new Date(comment.createdAt).toLocaleDateString();
            author = comment.author.login;
            location = 'Conversation';
            bodyPreview = comment.body.slice(0, 80).replace(/\n/g, ' ') + (comment.body.length > 80 ? '...' : '');
        } else {
            createdDate = new Date(comment.created_at).toLocaleDateString();
            author = comment.user.login;
            location = `${comment.path}:${comment.line}`;
            bodyPreview = comment.body.slice(0, 80).replace(/\n/g, ' ') + (comment.body.length > 80 ? '...' : '');
        }

        data.push([comment.type === 'conversation' ? '💬' : '📝', author, createdDate, location, bodyPreview]);
    }

    console.log(
        table(data, {
            columns: {
                3: { width: 20, wrapWord: true },
                4: { width: 50, wrapWord: true },
            },
        })
    );

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
