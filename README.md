# Github-Gist-Status

Automatically update your pinned GitHub Gists with commit activity analysis and GitHub overview.

[한국어](README.ko.md)

**Supports 2 Gists:**

| Gist | Description | Example |
|------|-------------|---------|
| **Activity** | Commit time distribution analysis | `🌞 Morning  120 commits ██████░░░░░░░  25.0%` |
| **Overview** | GitHub statistics summary | `⭐ Total Stars: 142` |

### Activity Gist

Analyzes your commit history and displays activity by time of day as a bar chart.
The gist title changes to `I'm an early 🐤` or `I'm a night 🦉` depending on when you commit most.

```
🌞 Morning    73 commits ███████▍░░░░░░░░░░░░░  19.3%
🌆 Daytime   142 commits ██████████████▍░░░░░░░  37.6%
🌃 Evening   112 commits ███████████▎░░░░░░░░░░  29.6%
🌙 Night      51 commits █████▏░░░░░░░░░░░░░░░  13.5%
```

### Overview Gist

Shows your GitHub profile statistics at a glance.

```
⭐    Total Stars:                                142
➕    Total Commits:                            1,234
🔀    Total PRs:                                   56
🚩    Total Issues:                                23
📦    Contributed to:                              18
```

---

## Setup

### 1. Create Gists

1. Create **2 Gists** at [gist.github.com](https://gist.github.com).
   - One for Activity, one for Overview
   - The filename and content can be anything (they will be updated automatically)
2. Copy the ID from each Gist URL.
   - `https://gist.github.com/username/`**`abc123...`** — this part

### 2. Generate a GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) and create a token
2. Required scopes: **`gist`**, **`repo`** (if you want to include private repo commits), **`read:user`**

### 3. Repository Configuration

Fork this repository or create a new one, then:

1. Go to **Settings > Secrets and variables > Actions** and add the following secrets:

   | Secret | Description |
   |--------|-------------|
   | `GH_TOKEN` | GitHub Personal Access Token |
   | `GIST_ID_ACTIVITY` | Activity Gist ID |
   | `GIST_ID_OVERVIEW` | Overview Gist ID |

2. If you only want to use one Gist, just set that Gist ID.
   The other will be skipped automatically.

### 4. Workflow Configuration (Optional)

You can modify environment variables in `.github/workflows/schedule.yml`:

```yaml
env:
  TIMEZONE: Asia/Seoul      # Timezone (default: Asia/Seoul)
  ALL_COMMITS: 'true'       # true: all-time commits / false: past year only
  K_FORMAT: 'false'         # true: 1.5k format / false: 1,500 format
```

### 5. Enable GitHub Actions

1. Go to the **Actions** tab and enable the workflow.
2. It runs automatically every 7 hours and on push to `main`.
3. You can also trigger it manually via **Actions > Update Gists > Run workflow**.

### 6. Pin the Gists

Pin the Gists on your GitHub profile to display them publicly.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your token and Gist IDs in .env

# Run in development
npm run dev

# Build
npm run build
```

---

## Project Structure

```
Github-Gist-Status/
├── .github/workflows/
│   └── schedule.yml        # GitHub Actions (runs every 7 hours)
├── src/
│   ├── index.ts            # Main entry point
│   ├── types.ts            # Shared type definitions
│   ├── api/
│   │   ├── graphql.ts      # GraphQL client
│   │   └── queries.ts      # GraphQL queries
│   ├── modules/
│   │   ├── activity.ts     # Commit activity analysis module
│   │   └── overview.ts     # GitHub overview module
│   └── utils/
│       ├── barChart.ts     # Bar chart generator
│       └── format.ts       # Number formatting
├── action.yml              # GitHub Action metadata
├── package.json
├── tsconfig.json
└── .env.example
```

## License

[MIT](LICENSE) (c) 2026 Jamkris
