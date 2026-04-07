export interface Repo {
  name: string;
  owner: string;
}

export interface GitHubStats {
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
  gistIdProductive: string;
  gistIdStats: string;
  timezone: string;
  allCommits: boolean;
  kFormat: boolean;
}
