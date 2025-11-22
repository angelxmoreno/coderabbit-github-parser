import type { Logger } from 'pino';
import { table } from 'table';
import { AppLogger, appContainer } from '../config.ts';
import { GitHubService, type PrListOptions } from '../services/GitHubService.ts';
import { createTypedCommand, type TypedActionFunction } from './types.ts';

type PrListCommandOptions = {
    state?: 'open' | 'closed' | 'merged' | 'all';
    author?: string;
    assignee?: string;
    limit?: string;
    draft?: boolean;
};

const prAction: TypedActionFunction<[], PrListCommandOptions> = async (options): Promise<void> => {
    const logger = appContainer.resolve<Logger>(AppLogger);
    const ghService = appContainer.resolve(GitHubService);

    logger.debug({ options }, 'fetching list of PRs');

    // Convert command options to service options
    const serviceOptions: PrListOptions = {
        state: options.state,
        author: options.author,
        assignee: options.assignee,
        limit: options.limit
            ? (() => {
                  const parsed = Number.parseInt(options.limit, 10);
                  if (Number.isNaN(parsed)) {
                      throw new Error(`Invalid limit value: ${options.limit}`);
                  }
                  return parsed;
              })()
            : undefined,
        draft: options.draft,
    };

    try {
        const results = await ghService.getPrList(serviceOptions);
        logger.debug({ prList: results }, 'fetched list of PRs');

        const data: string[][] = [['Author', 'Number', 'Title', 'State']];
        for (const result of results) {
            data.push([result.author.login, result.number.toString(), result.title, result.state]);
        }
        console.log(table(data));
    } catch (error) {
        logger.error({ error, options }, 'Failed to fetch PR list');
        throw error;
    }
};

export const prProgram = createTypedCommand(
    {
        command: 'pr:list',
        description: 'list the PRs for this repo',
        options: [
            {
                flags: '-s, --state <state>',
                description: 'Filter by state: {open|closed|merged|all}',
                defaultValue: 'all',
            },
            {
                flags: '-a, --author <author>',
                description: 'Filter by author',
            },
            {
                flags: '--assignee <assignee>',
                description: 'Filter by assignee',
            },
            {
                flags: '-l, --limit <limit>',
                description: 'Maximum number of items to fetch',
            },
            {
                flags: '-d, --draft',
                description: 'Filter by draft state',
            },
        ],
    },
    prAction
);
