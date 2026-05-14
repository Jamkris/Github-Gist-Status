import { mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Octokit } from '@octokit/rest';
import { createGraphqlClient } from '../api/graphql';
import { createProjectInfoQuery } from '../api/queries';
import { humanize } from '../utils/format';
import { buildProjectSvg } from '../utils/svg';
import type {
  Config,
  ProjectConfigFile,
  ProjectEntry,
  ProjectInfo,
  ProjectTag,
} from '../types';

interface ProjectRow {
  name: string;
  description: string;
  metrics: ProjectTag[];
  tags: ProjectTag[];
}

function parseRepo(repo: string): { owner: string; name: string } {
  const [owner, name] = repo.split('/');
  return { owner, name };
}

async function fetchProjects(
  config: Config,
  entries: ProjectEntry[]
): Promise<ProjectInfo[]> {
  const parsed = entries.map((e) => ({ entry: e, ...parseRepo(e.repo) }));
  const graphql = createGraphqlClient(config.ghToken);

  let response: Record<string, unknown>;
  try {
    response = await graphql<Record<string, unknown>>(
      createProjectInfoQuery(parsed)
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.warn(`[project] GraphQL query failed: ${msg}`);
    return [];
  }

  const infos: ProjectInfo[] = [];
  parsed.forEach((p, i) => {
    const node = response[`r${i}`] as
      | {
          nameWithOwner: string;
          description: string | null;
          stargazerCount: number;
          forkCount: number;
          latestRelease: { tagName: string } | null;
        }
      | null
      | undefined;

    if (!node) {
      console.warn(`[project] Skipping ${p.entry.repo} (not accessible).`);
      return;
    }

    infos.push({
      owner: p.owner,
      name: p.name,
      description: p.entry.description ?? node.description ?? '',
      stars: node.stargazerCount,
      forks: node.forkCount,
      version: node.latestRelease?.tagName ?? null,
      tags: p.entry.tags ?? [],
    });
  });

  return infos;
}

function buildRows(infos: ProjectInfo[], kFormat: boolean): ProjectRow[] {
  const h = (n: number) => humanize(n, kFormat);
  return infos.map((info) => {
    const metrics: ProjectTag[] = [
      { icon: '⭐', label: h(info.stars) },
      { icon: '🍴', label: h(info.forks) },
    ];
    if (info.version) {
      metrics.push({ label: info.version });
    }
    return {
      name: info.name,
      description: info.description,
      metrics,
      tags: info.tags,
    };
  });
}

async function writeProjectSvgs(
  outputDir: string,
  title: string,
  rows: ProjectRow[]
): Promise<void> {
  const dir = resolve(process.cwd(), outputDir);
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(resolve(dir, 'project-light.svg'), buildProjectSvg(title, rows, 'light')),
    writeFile(resolve(dir, 'project-dark.svg'), buildProjectSvg(title, rows, 'dark')),
  ]);
  console.info(`[project] Wrote SVGs → ${outputDir}/project-{light,dark}.svg`);
}

function chipText(chip: ProjectTag): string {
  return chip.icon ? `${chip.icon} ${chip.label}` : chip.label;
}

function buildGistContent(rows: ProjectRow[]): string {
  return (
    rows
      .map((row) => {
        const metricsLine = row.metrics.map(chipText).join('   ');
        const lines = [`📦  ${row.name}   ${metricsLine}`];
        if (row.description) lines.push(`    ${row.description}`);
        if (row.tags.length > 0) {
          lines.push(`    ${row.tags.map(chipText).join('    ')}`);
        }
        return lines.join('\n');
      })
      .join('\n\n') + '\n'
  );
}

export async function updateProjectGist(
  config: Config,
  file: ProjectConfigFile
): Promise<void> {
  if (file.projects.length === 0) {
    console.info('[project] No projects configured, skipping.');
    return;
  }

  const infos = await fetchProjects(config, file.projects);
  if (infos.length === 0) {
    console.info('[project] No project info available, skipping.');
    return;
  }

  const rows = buildRows(infos, config.kFormat);
  const title = file.title ?? 'Ongoing Projects';

  if (config.outputSvg) {
    await writeProjectSvgs(config.outputDir, title, rows);
  }

  if (!config.gistIdProject) return;

  const content = buildGistContent(rows);

  const octokit = new Octokit({ auth: config.ghToken });
  const gist = await octokit.gists.get({ gist_id: config.gistIdProject });
  const filename = Object.keys(gist.data.files!)[0];

  if (gist.data.files![filename]!.content === content) {
    console.info('[project] Nothing to update.');
    return;
  }

  await octokit.gists.update({
    gist_id: config.gistIdProject,
    files: {
      [filename]: {
        filename: title,
        content,
      },
    },
  });

  console.info(`[project] Updated gist → ${title}`);
}
