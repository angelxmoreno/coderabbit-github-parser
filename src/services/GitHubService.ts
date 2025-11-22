import type { Logger } from 'pino';
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
        this.logger = logger.child({ name: 'GitService' });
    }

    async getPrList(options: PrListOptions = {}): Promise<PRInfo[]> {
        this.logger.debug({ options }, 'Getting PR list');

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
        return (await result.json()) as PRInfo[];
    }

    async getCurrentPr(): Promise<PRInfo | null> {
        this.logger.info('Getting PR list');
        const cmd = 'gh pr view --json number,title,state,author';
        const result = await this.cliRunner(cmd);
        return (await result.json()) as PRInfo;
    }

    protected async runCmd(cmd: string) {
        return this.cliRunner(cmd, this.logger);
    }
}
