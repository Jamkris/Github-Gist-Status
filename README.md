# Github-Gist-Status

Automatically update your pinned GitHub Gists with commit activity analysis and GitHub overview.

<img width="907" height="195" alt="preview" src="https://github.com/user-attachments/assets/7ee75ec5-1d2f-41c4-9c3c-6c1b0b68272a" />

[한국어](README.ko.md)

**Supports 3 Gists:**

| Gist | Description | Example |
|------|-------------|---------|
| **Activity** | Commit time distribution analysis | `🌞 Morning  120 commits ██████░░░░░░░  25.0%` |
| **Overview** | GitHub statistics summary | `⭐ Total Stars: 142` |
| **Project** | Ongoing projects with custom tags | `📦 my-project  ⭐ 12  🍴 3  v1.0` |

### Activity Gist

Analyzes your commit history and displays activity by time of day as a bar chart.
The gist title is displayed as `{name}'s Commit Activity`.

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

### Project Gist

Highlights ongoing projects from a list you define in `config/project.json`.
Each entry pulls live stars/forks/version from GitHub, and you can add custom
tags such as `🚧 WIP`, `🎯 Focus`, or `TypeScript`.

```
📦  everything-gemini-code   ⭐ 12   🍴 3   v1.0
    A harness engineering toolkit for Gemini CLI & Antigravity.
    🚧 WIP    🎯 Focus    TypeScript

📦  Github-Gist-Status   ⭐ 8   🍴 1   v1.0
    ✅ Stable
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

   | Secret | Value | Description |
   |--------|-------|-------------|
   | `GH_TOKEN` | `ghp_xxxxxxxxxxxx` | GitHub Personal Access Token |
   | `GIST_ID_ACTIVITY` | `a62343a5341...` | Activity Gist ID |
   | `GIST_ID_OVERVIEW` | `4b422dc6ce1...` | Overview Gist ID |
   | `GIST_ID_PROJECT` | `9f0a8b7c6d5...` | Project Gist ID (optional) |

   > **Note**: Enter only the **ID** at the end of the Gist URL, not the full URL.
   > e.g. `https://gist.github.com/username/`**`4b422dc6ce14fc228c191cdad3da4d9c`** → `4b422dc6ce14fc228c191cdad3da4d9c`

2. If you only want to use one Gist, just set that Gist ID.
   The other will be skipped automatically.

### 4. Workflow Configuration (Optional)

You can modify environment variables in `.github/workflows/schedule.yml`:

```yaml
env:
  TIMEZONE: Asia/Seoul              # Timezone (default: Asia/Seoul)
  ALL_COMMITS: 'true'               # true: all-time commits / false: past year only
  K_FORMAT: 'false'                 # true: 1.5k format / false: 1,500 format
  OUTPUT_SVG: 'true'                # true: also generate SVGs into output/ for README embed
  OUTPUT_DIR: 'output'              # SVG output directory
  PROJECT_CONFIG: 'config/project.json'  # Project list (skip module if file missing)
```

### 5. Enable GitHub Actions

1. Go to the **Actions** tab and enable the workflow.
2. It runs automatically every 7 hours and on push to `main`.
3. You can also trigger it manually via **Actions > Update Gists > Run workflow**.

### 6. Pin the Gists

Pin the Gists on your GitHub profile to display them publicly.

### 7. Embed SVG on your README (optional)

In addition to Gists, this action generates SVG files into the `output/` folder
and commits them back to the repository. You can embed them on any README using
the `<picture>` tag, which switches automatically between light/dark themes:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/<user>/<repo>/main/output/activity-dark.svg" />
  <img alt="Commit Activity" src="https://raw.githubusercontent.com/<user>/<repo>/main/output/activity-light.svg" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/<user>/<repo>/main/output/overview-dark.svg" />
  <img alt="GitHub Overview" src="https://raw.githubusercontent.com/<user>/<repo>/main/output/overview-light.svg" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/<user>/<repo>/main/output/project-dark.svg" />
  <img alt="Ongoing Projects" src="https://raw.githubusercontent.com/<user>/<repo>/main/output/project-light.svg" />
</picture>
```

To disable SVG generation, set `OUTPUT_SVG: 'false'` in the workflow env.

### Configuring the Project SVG

Create `config/project.json` listing the projects you want to showcase. Each
project pulls stars/forks/version from GitHub automatically; you can add
optional custom tags (status, stack, focus, anything) to highlight context:

```json
{
  "title": "Ongoing Projects",
  "projects": [
    {
      "repo": "Jamkris/everything-gemini-code",
      "description": "A harness engineering toolkit for Gemini CLI & Antigravity.",
      "tags": [
        { "icon": "🚧", "label": "WIP" },
        { "icon": "🎯", "label": "Focus" },
        { "label": "TypeScript" }
      ]
    },
    {
      "repo": "Jamkris/Github-Gist-Status",
      "tags": [{ "icon": "✅", "label": "Stable" }]
    }
  ]
}
```

- `repo` is required (`owner/name`).
- `description` is optional — falls back to the GitHub repo description.
- `tags` is an array of `{ icon?, label }`. Both fields accept any emoji or text.
- If the config file is missing, the Project module is silently skipped.

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
├── config/
│   └── project.json        # Project list (consumed by Project module)
├── src/
│   ├── index.ts            # Main entry point
│   ├── types.ts            # Shared type definitions
│   ├── api/
│   │   ├── graphql.ts      # GraphQL client
│   │   └── queries.ts      # GraphQL queries
│   ├── modules/
│   │   ├── activity.ts     # Commit activity analysis module
│   │   ├── overview.ts     # GitHub overview module
│   │   └── project.ts      # Project showcase module
│   └── utils/
│       ├── barChart.ts     # Bar chart generator (Gist text)
│       ├── svg.ts          # SVG builder (light/dark themes)
│       ├── format.ts       # Number formatting
│       └── projectConfig.ts # config/project.json loader
├── output/                 # Generated SVGs (committed by Action)
│   ├── activity-{light,dark}.svg
│   ├── overview-{light,dark}.svg
│   └── project-{light,dark}.svg
├── action.yml              # GitHub Action metadata
├── package.json
├── tsconfig.json
└── .env.example
```

## License

[MIT](LICENSE) (c) 2026 Jamkris
