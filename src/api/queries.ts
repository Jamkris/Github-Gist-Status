export const USER_INFO_QUERY = `
  query {
    viewer {
      login
      id
      name
    }
  }
`;

export const createContributedRepoQuery = (username: string) => `
  query {
    user(login: "${username}") {
      repositoriesContributedTo(last: 100, includeUserRepositories: true) {
        nodes {
          isFork
          name
          owner {
            login
          }
        }
      }
    }
  }
`;

export const createCommitHistoryQuery = (id: string, name: string, owner: string) => `
  query {
    repository(owner: "${owner}", name: "${name}") {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, author: { id: "${id}" }) {
              edges {
                node {
                  committedDate
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const OVERVIEW_QUERY = `
  query {
    viewer {
      name
      login
      contributionsCollection {
        totalCommitContributions
      }
      repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
        totalCount
      }
      pullRequests(first: 1) {
        totalCount
      }
      issues(first: 1) {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {direction: DESC, field: STARGAZERS}) {
        nodes {
          stargazers {
            totalCount
          }
        }
      }
    }
  }
`;

export const createTotalCommitsQuery = (login: string) =>
  `https://api.github.com/search/commits?q=author:${login}`;

export const createProjectInfoQuery = (
  entries: ReadonlyArray<{ owner: string; name: string }>
): string => {
  const fields = entries
    .map(
      (e, i) => `
    r${i}: repository(owner: "${e.owner}", name: "${e.name}") {
      nameWithOwner
      description
      stargazerCount
      forkCount
      latestRelease { tagName }
    }`
    )
    .join('');
  return `query {${fields}\n  }`;
};

