import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import {
  USER_INFO_QUERY,
  createContributedRepoQuery,
  createCommitHistoryQuery,
} from '../api/queries';
import { generateBarChart } from '../utils/barChart';
import { buildActivitySvg } from '../utils/svg';
import type { Config, Repo, TimeCommits } from '../types';

interface ActivityRow {
  emoji: string;
  label: string;
  commits: number;
  percent: number;
}

async function writeActivitySvgs(
  outputDir: string,
  title: string,
  rows: ActivityRow[]
): Promise<void> {
  const dir = resolve(process.cwd(), outputDir);
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(resolve(dir, 'activity-light.svg'), buildActivitySvg(title, rows, 'light')),
    writeFile(resolve(dir, 'activity-dark.svg'), buildActivitySvg(title, rows, 'dark')),
  ]);
  console.info(`[activity] Wrote SVGs → ${outputDir}/activity-{light,dark}.svg`);
}

export async function updateActivityGist(config: Config): Promise<void> {
  const graphql = createGraphqlClient(config.ghToken);

  const userResponse: any = await graphql(USER_INFO_QUERY);
  const { login: username, id, name } = userResponse.viewer;

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
    console.info('[activity] No commits found, skipping.');
    return;
  }

  const segments: Array<{ emoji: string; label: string; commits: number }> = [
    { emoji: '🌞', label: 'Morning', commits: time.morning },
    { emoji: '🌆', label: 'Daytime', commits: time.daytime },
    { emoji: '🌃', label: 'Evening', commits: time.evening },
    { emoji: '🌙', label: 'Night  ', commits: time.night },
  ];

  const rows: ActivityRow[] = segments.map((s) => ({
    ...s,
    percent: (s.commits / sum) * 100,
  }));

  const lines = rows.map((row) => {
    return [
      `${row.emoji} ${row.label}`.padEnd(10),
      `${String(row.commits).padStart(5)} commits`.padEnd(14),
      generateBarChart(row.percent, 21),
      `${row.percent.toFixed(1).padStart(5)}%`,
    ].join(' ');
  });

  const displayName = name || username;
  const title = `${displayName}'s Commit Activity`;

  if (config.outputSvg) {
    await writeActivitySvgs(config.outputDir, title, rows);
  }

  if (!config.gistIdActivity) return;

  const octokit = new Octokit({ auth: config.ghToken });
  const gist = await octokit.gists.get({ gist_id: config.gistIdActivity });
  const filename = Object.keys(gist.data.files!)[0];
  const content = lines.join('\n');

  await octokit.gists.update({
    gist_id: config.gistIdActivity,
    files: {
      [filename]: {
        filename: title,
        content,
      },
    },
  });

  console.info(`[activity] Updated gist → ${title}`);
}
