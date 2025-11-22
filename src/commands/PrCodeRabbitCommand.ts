import type { Logger } from 'pino';
import { table } from 'table';
import { AppLogger, appContainer } from '../config.ts';
import { GitHubService, type PrCommentsOptions } from '../services/GitHubService.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

type PrCodeRabbitCommandOptions = {
    repo?: string;
    format?: 'table' | 'json' | 'markdown';
    type?: 'issue' | 'suggestion' | 'all';
    severity?: 'critical' | 'major' | 'minor' | 'info' | 'all';
};

const prCodeRabbitAction: TypedActionFunction<[prIdentifier: string], PrCodeRabbitCommandOptions> = async (
    prIdentifier: string,
    options
): Promise<void> => {
    const logger = appContainer.resolve<Logger>(AppLogger);
    const ghService = appContainer.resolve(GitHubService);

    logger.debug({ prIdentifier, options }, 'fetching parsed CodeRabbit comments');

    // Convert command options to service options
    const serviceOptions: PrCommentsOptions = {
        prIdentifier,
        repo: options.repo,
    };

    const parsedComments = await ghService.getParsedCodeRabbitComments(serviceOptions);
    logger.debug({ comments: parsedComments.length }, 'fetched parsed CodeRabbit comments');

    // Apply filters
    let filteredComments = parsedComments;

    if (options.type && options.type !== 'all') {
        filteredComments = filteredComments.filter((comment) => comment.parsed.type === options.type);
    }

    if (options.severity && options.severity !== 'all') {
        filteredComments = filteredComments.filter((comment) => comment.parsed.severity === options.severity);
    }

    if (options.format === 'json') {
        console.log(JSON.stringify(filteredComments, null, 2));
        return;
    }

    if (options.format === 'markdown') {
        // Generate markdown report
        console.log(`# CodeRabbit Review Comments - PR #${prIdentifier}\n`);

        if (filteredComments.length === 0) {
            console.log('No CodeRabbit comments found matching the criteria.\n');
            return;
        }

        // Summary section
        const byType = filteredComments.reduce(
            (acc, comment) => {
                acc[comment.parsed.type] = (acc[comment.parsed.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const bySeverity = filteredComments.reduce(
            (acc, comment) => {
                const severity = comment.parsed.severity || 'unknown';
                acc[severity] = (acc[severity] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const withSuggestions = filteredComments.filter((c) => c.parsed.suggestion).length;

        console.log('## Summary\n');
        console.log(`- **Total comments**: ${filteredComments.length}`);
        console.log(
            `- **By type**: ${Object.entries(byType)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}`
        );
        console.log(
            `- **By severity**: ${Object.entries(bySeverity)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}`
        );
        console.log(`- **With code suggestions**: ${withSuggestions}/${filteredComments.length}\n`);

        // Comments section
        console.log('## Comments\n');

        for (const [index, comment] of filteredComments.entries()) {
            const severityBadge =
                comment.parsed.severity === 'critical'
                    ? '🔴 Critical'
                    : comment.parsed.severity === 'major'
                      ? '🟠 Major'
                      : comment.parsed.severity === 'minor'
                        ? '🟡 Minor'
                        : '🔵 Info';

            const typeBadge =
                comment.parsed.type === 'issue'
                    ? '⚠️ Issue'
                    : comment.parsed.type === 'suggestion'
                      ? '💡 Suggestion'
                      : '📝 Other';

            console.log(`### ${index + 1}. ${comment.parsed.title}`);
            const locParts = [comment.path, comment.line?.toString()].filter(Boolean);
            const location = locParts.length ? locParts.join(':') : 'Review';
            console.log(`**Location**: \`${location}\`  `);
            console.log(`**Type**: ${typeBadge} | **Severity**: ${severityBadge}\n`);
            console.log(`${comment.parsed.description}\n`);

            if (comment.parsed.suggestion) {
                console.log('<details>');
                console.log('<summary>📝 Code Suggestion</summary>\n');
                console.log('```suggestion');
                console.log(comment.parsed.suggestion);
                console.log('```\n');
                console.log('</details>\n');
            }

            if (comment.parsed.aiPrompt) {
                console.log('<details>');
                console.log('<summary>🤖 AI Prompt</summary>\n');
                console.log('```');
                console.log(comment.parsed.aiPrompt);
                console.log('```\n');
                console.log('</details>\n');
            }

            console.log('---\n');
        }

        return;
    }

    // Default table format
    if (filteredComments.length === 0) {
        console.log('No CodeRabbit comments found matching the criteria.');
        return;
    }

    const data: string[][] = [['Severity', 'Type', 'File:Line', 'Title', 'Has Suggestion']];

    for (const comment of filteredComments) {
        const severityEmoji =
            comment.parsed.severity === 'critical'
                ? '🔴'
                : comment.parsed.severity === 'major'
                  ? '🟠'
                  : comment.parsed.severity === 'minor'
                    ? '🟡'
                    : '🔵';

        const typeEmoji = comment.parsed.type === 'issue' ? '⚠️' : comment.parsed.type === 'suggestion' ? '💡' : '📝';

        const locParts = [comment.path, comment.line?.toString()].filter(Boolean);
        const location = locParts.length ? locParts.join(':') : 'Review';

        data.push([
            `${severityEmoji} ${comment.parsed.severity}`,
            `${typeEmoji} ${comment.parsed.type}`,
            location,
            comment.parsed.title.slice(0, 60) + (comment.parsed.title.length > 60 ? '...' : ''),
            comment.parsed.suggestion ? '✅' : '❌',
        ]);
    }

    console.log(
        table(data, {
            columns: {
                2: { width: 25, wrapWord: true },
                3: { width: 50, wrapWord: true },
            },
        })
    );

    // Summary statistics
    const byType = filteredComments.reduce(
        (acc, comment) => {
            acc[comment.parsed.type] = (acc[comment.parsed.type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const bySeverity = filteredComments.reduce(
        (acc, comment) => {
            const severity = comment.parsed.severity || 'unknown';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const withSuggestions = filteredComments.filter((c) => c.parsed.suggestion).length;

    console.log(`\nTotal CodeRabbit comments: ${filteredComments.length}`);
    console.log(
        `By type: ${Object.entries(byType)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}`
    );
    console.log(
        `By severity: ${Object.entries(bySeverity)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')}`
    );
    console.log(`With code suggestions: ${withSuggestions}/${filteredComments.length}`);
};

export const prCodeRabbitProgram = createTypedCommand(
    {
        command: 'pr:coderabbit <prIdentifier>',
        description: 'fetch and parse CodeRabbit review comments for a specific PR',
        options: [
            {
                flags: '-R, --repo <repo>',
                description: 'Select another repository using [HOST/]OWNER/REPO format',
            },
            {
                flags: '-f, --format <format>',
                description: 'Output format: table, json, or markdown',
                defaultValue: 'table',
            },
            {
                flags: '-t, --type <type>',
                description: 'Filter by comment type: issue, suggestion, or all',
                defaultValue: 'all',
            },
            {
                flags: '-s, --severity <severity>',
                description: 'Filter by severity: critical, major, minor, info, or all',
                defaultValue: 'all',
            },
        ],
    },
    prCodeRabbitAction
);
