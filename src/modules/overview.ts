import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import { OVERVIEW_QUERY, createTotalCommitsQuery } from '../api/queries';
import { humanize } from '../utils/format';
import type { Config, GitHubOverview } from '../types';

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

  const rows = [
    ['⭐', 'Total Stars', h(overview.totalStars)],
    ['➕', config.allCommits ? 'Total Commits' : 'Past Year Commits', h(overview.totalCommits)],
    ['🔀', 'Total PRs', h(overview.totalPRs)],
    ['🚩', 'Total Issues', h(overview.totalIssues)],
    ['📦', 'Contributed to', h(overview.contributedTo)],
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
        filename: `${overview.name}'s GitHub Overview`,
        content,
      },
    },
  });

  console.info(`[overview] Updated gist → ${overview.name}'s GitHub Overview`);
}
