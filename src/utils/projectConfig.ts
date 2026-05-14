import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type { ProjectConfigFile, ProjectEntry, ProjectTag } from '../types';

const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validateTag(raw: unknown, ctx: string): ProjectTag {
  if (!isRecord(raw)) {
    throw new Error(`${ctx}: tag must be an object`);
  }
  if (typeof raw.label !== 'string' || !raw.label.trim()) {
    throw new Error(`${ctx}: tag.label is required`);
  }
  const tag: ProjectTag = { label: raw.label.trim() };
  if (raw.icon !== undefined) {
    if (typeof raw.icon !== 'string') {
      throw new Error(`${ctx}: tag.icon must be a string`);
    }
    tag.icon = raw.icon;
  }
  return tag;
}

function validateEntry(raw: unknown, index: number): ProjectEntry {
  const ctx = `projects[${index}]`;
  if (!isRecord(raw)) {
    throw new Error(`${ctx}: must be an object`);
  }
  if (typeof raw.repo !== 'string' || !REPO_PATTERN.test(raw.repo)) {
    throw new Error(`${ctx}.repo must be "owner/name"`);
  }
  const entry: ProjectEntry = { repo: raw.repo };
  if (raw.description !== undefined) {
    if (typeof raw.description !== 'string') {
      throw new Error(`${ctx}.description must be a string`);
    }
    entry.description = raw.description;
  }
  if (raw.tags !== undefined) {
    if (!Array.isArray(raw.tags)) {
      throw new Error(`${ctx}.tags must be an array`);
    }
    entry.tags = raw.tags.map((t, i) => validateTag(t, `${ctx}.tags[${i}]`));
  }
  return entry;
}

export async function loadProjectConfig(
  path: string
): Promise<ProjectConfigFile | null> {
  const absolute = resolve(process.cwd(), path);
  let raw: string;
  try {
    raw = await readFile(absolute, 'utf-8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'invalid JSON';
    throw new Error(`Failed to parse ${path}: ${msg}`);
  }

  if (!isRecord(parsed)) {
    throw new Error(`${path}: root must be an object`);
  }
  if (!Array.isArray(parsed.projects)) {
    throw new Error(`${path}: "projects" array is required`);
  }

  const config: ProjectConfigFile = {
    projects: parsed.projects.map((p, i) => validateEntry(p, i)),
  };
  if (parsed.title !== undefined) {
    if (typeof parsed.title !== 'string') {
      throw new Error(`${path}: "title" must be a string`);
    }
    config.title = parsed.title;
  }
  return config;
}
