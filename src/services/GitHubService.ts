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

export type PrState = 'open' | 'closed' | 'merged' | 'all';

export type PRInfo = {
    author: {
        id: string;
        is_bot: boolean;
        login: string;
        name: string;
    };
    number: number;
    state: PrState;
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
    state?: PrState;
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

    async getPrList(options: PrListOptions = {}): Promise<PRInfo[]> {
        this.logger.debug({ options }, 'Fetching PR list');

        const args = ['gh', 'pr', 'list'];

        // Add flags based on options
        if (options.app) args.push('--app', options.app);
        if (options.assignee) args.push('--assignee', options.assignee);
        if (options.author) args.push('--author', options.author);
        if (options.base) args.push('--base', options.base);
        if (options.draft) args.push('--draft');
        if (options.head) args.push('--head', options.head);
        if (options.label) {
            for (const label of options.label) {
                args.push('--label', label);
            }
        }
        if (options.limit) args.push('--limit', options.limit.toString());
        if (options.search) args.push('--search', options.search);
        if (options.state) args.push('--state', options.state);
        if (options.repo) args.push('--repo', options.repo);

        // Always add JSON output format
        args.push('--json', 'number,title,state,author');

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const data = (await result.json()) as PRInfo[];
        this.logger.debug({ prList: data }, 'PR list fetched');
        return data;
    }

    async getCurrentPr(): Promise<PRInfo | null> {
        this.logger.info('Fetching current PR');
        const cmd = 'gh pr view --json number,title,state,author';
        const result = await this.cliRunner(cmd);
        return (await result.json()) as PRInfo;
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
            args.push('--repo', options.repo);
        }

        args.push('--json', 'comments');

        const cmd = args.join(' ');
        const result = await this.cliRunner(cmd);
        const { comments } = (await result.json()) as { comments: PRComment[] };
        return comments;
    }

    private async getReviewComments(options: PrCommentsOptions): Promise<PRReviewComment[]> {
        // Use GitHub API directly for review comments
        const repoFlag = options.repo ? `--repo ${options.repo}` : '';
        const cmd = `gh api repos/:owner/:repo/pulls/${options.prIdentifier}/comments ${repoFlag}`.trim();

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
