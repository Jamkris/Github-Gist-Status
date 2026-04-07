import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import {
  USER_INFO_QUERY,
  createContributedRepoQuery,
  createCommitHistoryQuery,
} from '../api/queries';
import { generateBarChart } from '../utils/barChart';
import type { Config, Repo, TimeCommits } from '../types';

export async function updateProductiveGist(config: Config): Promise<void> {
  const graphql = createGraphqlClient(config.ghToken);

  const userResponse: any = await graphql(USER_INFO_QUERY);
  const { login: username, id } = userResponse.viewer;

  const repoResponse: any = await graphql(createContributedRepoQuery(username));
  const repos: Repo[] = repoResponse.user.repositoriesContributedTo.nodes
    .filter((r: any) => !r.isFork)
    .map((r: any) => ({ name: r.name, owner: r.owner.login }));

  const commitResponses = await Promise.all(
    repos.map((repo) =>
      graphql(createCommitHistoryQuery(id, repo.name, repo.owner)).catch(() => null)
    )
  );

  const time: TimeCommits = { morning: 0, daytime: 0, evening: 0, night: 0 };

  for (const res of commitResponses) {
    if (!res) continue;
    const edges = (res as any).repository?.defaultBranchRef?.target?.history?.edges ?? [];
    for (const edge of edges) {
      const hour = parseInt(
        new Date(edge.node.committedDate).toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: config.timezone,
        }).split(':')[0],
        10
      );
      if (hour >= 6 && hour < 12) time.morning++;
      else if (hour >= 12 && hour < 18) time.daytime++;
      else if (hour >= 18 && hour < 24) time.evening++;
      else time.night++;
    }
  }

  const sum = time.morning + time.daytime + time.evening + time.night;
  if (!sum) {
    console.info('[productive] No commits found, skipping.');
    return;
  }

  const rows = [
    { label: '🌞 Morning', commits: time.morning },
    { label: '🌆 Daytime', commits: time.daytime },
    { label: '🌃 Evening', commits: time.evening },
    { label: '🌙 Night  ', commits: time.night },
  ];

  const lines = rows.map((row) => {
    const percent = (row.commits / sum) * 100;
    return [
      row.label.padEnd(10),
      `${String(row.commits).padStart(5)} commits`.padEnd(14),
      generateBarChart(percent, 21),
      `${percent.toFixed(1).padStart(5)}%`,
    ].join(' ');
  });

  const octokit = new Octokit({ auth: config.ghToken });
  const gist = await octokit.gists.get({ gist_id: config.gistIdProductive });
  const filename = Object.keys(gist.data.files!)[0];

  const isEarlyBird = time.morning + time.daytime > time.evening + time.night;
  const newFilename = isEarlyBird ? "I'm an early 🐤" : "I'm a night 🦉";
  const content = lines.join('\n');

  await octokit.gists.update({
    gist_id: config.gistIdProductive,
    files: {
      [filename]: {
        filename: newFilename,
        content,
      },
    },
  });

  console.info(`[productive] Updated gist → ${newFilename}`);
}
