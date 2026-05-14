export interface Repo {
  name: string;
  owner: string;
}

export interface GitHubOverview {
  name: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
}

export interface TimeCommits {
  morning: number;
  daytime: number;
  evening: number;
  night: number;
}

export interface ProjectTag {
  icon?: string;
  label: string;
}

export interface ProjectEntry {
  repo: string;
  description?: string;
  tags?: ProjectTag[];
}

export interface ProjectConfigFile {
  title?: string;
  projects: ProjectEntry[];
}

export interface ProjectInfo {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  version: string | null;
  tags: ProjectTag[];
}

export interface Config {
  ghToken: string;
  gistIdActivity: string;
  gistIdOverview: string;
  gistIdProject: string;
  projectConfigPath: string;
  timezone: string;
  allCommits: boolean;
  kFormat: boolean;
  outputSvg: boolean;
  outputDir: string;
}
