import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import { STATS_QUERY, createTotalCommitsQuery } from '../api/queries';
import { humanize } from '../utils/format';
import type { Config, GitHubStats } from '../types';

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

async function fetchStats(config: Config): Promise<GitHubStats> {
  const graphql = createGraphqlClient(config.ghToken);
  const response: any = await graphql(STATS_QUERY);
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

export async function updateStatsGist(config: Config): Promise<void> {
  const stats = await fetchStats(config);

  const h = (n: number) => humanize(n, config.kFormat);

  const rows = [
    ['⭐', 'Total Stars', h(stats.totalStars)],
    ['➕', config.allCommits ? 'Total Commits' : 'Past Year Commits', h(stats.totalCommits)],
    ['🔀', 'Total PRs', h(stats.totalPRs)],
    ['🚩', 'Total Issues', h(stats.totalIssues)],
    ['📦', 'Contributed to', h(stats.contributedTo)],
  ];

  const content =
    rows
      .map(([icon, label, value]) => {
        const line = `${label}:${value}`;
        const padded = line.replace(':', ':' + ' '.repeat(Math.max(1, 45 - line.length)));
        return `${icon}    ${padded}`;
      })
      .join('\n') + '\n';

  const octokit = new Octokit({ auth: config.ghToken });
  const gist = await octokit.gists.get({ gist_id: config.gistIdStats });
  const filename = Object.keys(gist.data.files!)[0];

  if (gist.data.files![filename]!.content === content) {
    console.info('[stats] Nothing to update.');
    return;
  }

  await octokit.gists.update({
    gist_id: config.gistIdStats,
    files: {
      [filename]: {
        filename: `${stats.name}'s GitHub Stats`,
        content,
      },
    },
  });

  console.info(`[stats] Updated gist → ${stats.name}'s GitHub Stats`);
}
