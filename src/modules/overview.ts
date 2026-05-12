import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import { OVERVIEW_QUERY, createTotalCommitsQuery } from '../api/queries';
import { humanize } from '../utils/format';
import { buildOverviewSvg } from '../utils/svg';
import type { Config, GitHubOverview } from '../types';

interface OverviewRow {
  emoji: string;
  label: string;
  value: string;
}

async function writeOverviewSvgs(
  outputDir: string,
  title: string,
  rows: OverviewRow[]
): Promise<void> {
  const dir = resolve(process.cwd(), outputDir);
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(resolve(dir, 'overview-light.svg'), buildOverviewSvg(title, rows, 'light')),
    writeFile(resolve(dir, 'overview-dark.svg'), buildOverviewSvg(title, rows, 'dark')),
  ]);
  console.info(`[overview] Wrote SVGs → ${outputDir}/overview-{light,dark}.svg`);
}

async function fetchTotalCommits(login: string, token: string): Promise<number> {
  const res = await fetch(createTotalCommitsQuery(login), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.cloak-preview',
      Authorization: `bearer ${token}`,
    },
  });
  const data = await res.json();
  return (data as any).total_count ?? 0;
}

async function fetchOverview(config: Config): Promise<GitHubOverview> {
  const graphql = createGraphqlClient(config.ghToken);
  const response: any = await graphql(OVERVIEW_QUERY);
  const user = response.viewer;

  const totalStars = user.repositories.nodes.reduce(
    (sum: number, repo: any) => sum + repo.stargazers.totalCount,
    0
  );

  let totalCommits = user.contributionsCollection.totalCommitContributions;
  if (config.allCommits) {
    totalCommits = await fetchTotalCommits(user.login, config.ghToken);
  }

  return {
    name: user.name || user.login,
    totalStars,
    totalCommits,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.issues.totalCount,
    contributedTo: user.repositoriesContributedTo.totalCount,
  };
}

export async function updateOverviewGist(config: Config): Promise<void> {
  const overview = await fetchOverview(config);

  const h = (n: number) => humanize(n, config.kFormat);

  const rows: OverviewRow[] = [
    { emoji: '⭐', label: 'Total Stars', value: h(overview.totalStars) },
    {
      emoji: '➕',
      label: config.allCommits ? 'Total Commits' : 'Past Year Commits',
      value: h(overview.totalCommits),
    },
    { emoji: '🔀', label: 'Total PRs', value: h(overview.totalPRs) },
    { emoji: '🚩', label: 'Total Issues', value: h(overview.totalIssues) },
    { emoji: '📦', label: 'Contributed to', value: h(overview.contributedTo) },
  ];

  const title = `${overview.name}'s GitHub Overview`;

  if (config.outputSvg) {
    await writeOverviewSvgs(config.outputDir, title, rows);
  }

  if (!config.gistIdOverview) return;

  const content =
    rows
      .map(({ emoji, label, value }) => {
        const line = `${label}:${value}`;
        const padded = line.replace(':', ':' + ' '.repeat(Math.max(1, 45 - line.length)));
        return `${emoji}    ${padded}`;
      })
      .join('\n') + '\n';

  const octokit = new Octokit({ auth: config.ghToken });
  const gist = await octokit.gists.get({ gist_id: config.gistIdOverview });
  const filename = Object.keys(gist.data.files!)[0];

  if (gist.data.files![filename]!.content === content) {
    console.info('[overview] Nothing to update.');
    return;
  }

  await octokit.gists.update({
    gist_id: config.gistIdOverview,
    files: {
      [filename]: {
        filename: title,
        content,
      },
    },
  });

  console.info(`[overview] Updated gist → ${title}`);
}
