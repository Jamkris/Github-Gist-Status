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

export interface Config {
  ghToken: string;
  gistIdActivity: string;
  gistIdOverview: string;
  timezone: string;
  allCommits: boolean;
  kFormat: boolean;
  outputSvg: boolean;
  outputDir: string;
}
