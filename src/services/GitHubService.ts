import type { Logger } from 'pino';
import {
    isCodeRabbitComment,
    type ParsedCodeRabbitComment,
    parseCodeRabbitComment,
} from '../utils/parseCodeRabbitComment.ts';

// Re-export parsing utilities for convenience
export { isCodeRabbitComment, parseCodeRabbitComment, type ParsedCodeRabbitComment };

import type { ShellRunner } from '../utils/runBashCli.ts';

export type GitHubServiceOptions = {
    logger: Logger;
    cliRunner: ShellRunner;
};

export type PrStateFilter = 'open' | 'closed' | 'merged' | 'all';
export type PrStateOutput = 'OPEN' | 'CLOSED' | 'MERGED';

export type PRInfo = {
    author: {
        id: string;
        is_bot: boolean;
        login: string;
        name: string;
    };
    number: number;
    state: PrStateOutput;
    title: string;
};

export type PRComment = {
    id: string;
    author: {
        login: string;
    };
    authorAssociation: string;
    body: string;
    createdAt: string;
    includesCreatedEdit: boolean;
    isMinimized: boolean;
    minimizedReason: string;
    reactionGroups: unknown[];
    url: string;
    viewerDidAuthor: boolean;
    type: 'conversation';
};

export interface PRReviewComment {
    id: number;
    user: {
        login: string;
    };
    body: string;
    created_at: string;
    updated_at: string;
    html_url: string;
    path: string;
    line: number;
    diff_hunk: string;
    author_association: string;
    type: 'review';
}

export interface CodeRabbitPRReviewComment extends PRReviewComment {
    parsed: ParsedCodeRabbitComment;
}
export type AllPRComments = PRComment | PRReviewComment;

export type PrCommentsOptions = {
    /** The PR number, URL, or branch to get comments for */
    prIdentifier: string | number;
    /** Select another repository using the [HOST/]OWNER/REPO format */
    repo?: string;
};

export type PrListOptions = {
    /** Filter by GitHub App author */
    app?: string;
    /** Filter by assignee */
    assignee?: string;
    /** Filter by author */
    author?: string;
    /** Filter by base branch */
    base?: string;
    /** Filter by draft state */
    draft?: boolean;
    /** Filter by head branch */
    head?: string;
    /** Filter by labels */
    label?: string[];
    /** Maximum number of items to fetch (default 30) */
    limit?: number;
    /** Search pull requests with query */
    search?: string;
    /** Filter by state: {open|closed|merged|all} (default "open") */
    state?: PrStateFilter;
    /** Select another repository using the [HOST/]OWNER/REPO format */
    repo?: string;
};

export class GitHubService {
    public readonly cliRunner: ShellRunner;
    public readonly logger: Logger;

    constructor({ cliRunner, logger }: GitHubServiceOptions) {
        this.cliRunner = cliRunner;
        this.logger = logger.child({ name: 'GitHubService' });
    }

    private escapeShellArg(arg: string): string {
        return `'${arg.replace(/'/g, "'\\''")}'`;
    }

    private async resolvePrNumber(identifier: string | number, repo?: string): Promise<number> {
        // If already a number, return it
        if (typeof identifier === 'number') {
            return identifier;
        }

        // If string looks like a number, parse it
        const numericId = Number.parseInt(identifier, 10);
        if (!Number.isNaN(numericId)) {
            return numericId;
        }

        // Otherwise, resolve using gh pr view
        const args = ['gh', 'pr', 'view', this.escapeShellArg(identifier)];
        if (repo) {
            args.push('--repo', this.escapeShellArg(repo));
        }
        args.push('--json', 'number');

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const data = (await result.json()) as { number: number };
        return data.number;
    }

    async getPrList(options: PrListOptions = {}): Promise<PRInfo[]> {
        this.logger.debug({ options }, 'Fetching PR list');

        const args = ['gh', 'pr', 'list'];

        // Add flags based on options
        if (options.app) args.push('--app', this.escapeShellArg(options.app));
        if (options.assignee) args.push('--assignee', this.escapeShellArg(options.assignee));
        if (options.author) args.push('--author', this.escapeShellArg(options.author));
        if (options.base) args.push('--base', this.escapeShellArg(options.base));
        if (options.draft === true) {
            args.push('--draft');
        } else if (options.draft === false) {
            args.push('--draft=false');
        }
        if (options.head) args.push('--head', this.escapeShellArg(options.head));
        if (options.label) {
            for (const label of options.label) {
                args.push('--label', this.escapeShellArg(label));
            }
        }
        if (options.limit) args.push('--limit', options.limit.toString());
        if (options.search) args.push('--search', this.escapeShellArg(options.search));
        if (options.state) args.push('--state', options.state);
        if (options.repo) args.push('--repo', this.escapeShellArg(options.repo));

        // Always add JSON output format
        args.push('--json', 'number,title,state,author');

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const data = await result.json();
        if (!Array.isArray(data)) {
            throw new Error('Unexpected response format from gh pr list');
        }
        const prList = data as PRInfo[];
        this.logger.debug({ prList }, 'PR list fetched');
        return prList;
    }

    async getCurrentPr(): Promise<PRInfo | null> {
        this.logger.info('Getting current PR');
        const cmd = 'gh pr view --json number,title,state,author';
        try {
            const result = await this.cliRunner(cmd);
            return (await result.json()) as PRInfo;
        } catch (_error) {
            this.logger.debug('No current PR found');
            return null;
        }
    }

    async getPrComments(options: PrCommentsOptions): Promise<AllPRComments[]> {
        this.logger.debug({ options }, 'Fetching all PR comments');

        // Get conversation comments
        const conversationComments = await this.getConversationComments(options);

        // Get review comments
        const reviewComments = await this.getReviewComments(options);

        // Combine and sort by creation date
        const allComments: AllPRComments[] = [
            ...conversationComments.map((c) => ({ ...c, type: 'conversation' as const })),
            ...reviewComments.map((c) => ({ ...c, type: 'review' as const })),
        ];

        // Sort by creation date
        allComments.sort((a, b) => {
            const dateA = new Date(a.type === 'conversation' ? a.createdAt : a.created_at);
            const dateB = new Date(b.type === 'conversation' ? b.createdAt : b.created_at);
            return dateA.getTime() - dateB.getTime();
        });

        this.logger.debug(
            {
                conversationComments: conversationComments.length,
                reviewComments: reviewComments.length,
                total: allComments.length,
            },
            'All comments fetched'
        );

        return allComments;
    }

    private async getConversationComments(options: PrCommentsOptions): Promise<PRComment[]> {
        const args = ['gh', 'pr', 'view', options.prIdentifier.toString()];

        if (options.repo) {
            args.push('--repo', this.escapeShellArg(options.repo));
        }

        args.push('--json', 'comments');

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const { comments } = (await result.json()) as { comments: PRComment[] };
        return comments;
    }

    private async getReviewComments(options: PrCommentsOptions): Promise<PRReviewComment[]> {
        // Resolve identifier to numeric PR number for REST API
        const prNumber = await this.resolvePrNumber(options.prIdentifier, options.repo);

        // Build command for GitHub API call for review comments
        const args = ['gh', 'api'];
        if (options.repo) {
            args.push('--repo', this.escapeShellArg(options.repo));
        }
        args.push(`repos/:owner/:repo/pulls/${prNumber}/comments`);

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const reviewComments = (await result.json()) as PRReviewComment[];
        return reviewComments;
    }

    async getParsedCodeRabbitComments(options: PrCommentsOptions): Promise<CodeRabbitPRReviewComment[]> {
        this.logger.debug({ options }, 'Fetching and parsing CodeRabbit comments');

        const reviewComments = await this.getReviewComments(options);

        const codeRabbitComments = reviewComments
            .filter((comment) => isCodeRabbitComment(comment.user.login))
            .map((comment) => {
                const parsed = parseCodeRabbitComment(comment.body);
                if (!parsed) {
                    this.logger.warn({ commentId: comment.id }, 'Failed to parse CodeRabbit comment');
                    return null;
                }
                return {
                    ...comment,
                    parsed,
                } as CodeRabbitPRReviewComment;
            })
            .filter((comment): comment is CodeRabbitPRReviewComment => comment !== null);

        this.logger.debug(
            {
                totalReviewComments: reviewComments.length,
                codeRabbitComments: codeRabbitComments.length,
            },
            'CodeRabbit comments parsed'
        );

        return codeRabbitComments;
    }

    protected async runCmd(cmd: string) {
        return this.cliRunner(cmd, this.logger);
    }
}
