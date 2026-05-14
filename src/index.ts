import { resolve } from 'path';
import { config } from 'dotenv';
import { updateActivityGist } from './modules/activity';
import { updateOverviewGist } from './modules/overview';
import { updateProjectGist } from './modules/project';
import { loadProjectConfig } from './utils/projectConfig';
import type { Config } from './types';

config({ path: resolve(__dirname, '../.env') });

function loadConfig(): Config {
  const ghToken = process.env.GH_TOKEN;
  if (!ghToken) {
    throw new Error('GH_TOKEN is required');
  }

  return {
    ghToken,
    gistIdActivity: process.env.GIST_ID_ACTIVITY ?? '',
    gistIdOverview: process.env.GIST_ID_OVERVIEW ?? '',
    gistIdProject: process.env.GIST_ID_PROJECT ?? '',
    projectConfigPath: process.env.PROJECT_CONFIG ?? 'config/project.json',
    timezone: process.env.TIMEZONE ?? 'Asia/Seoul',
    allCommits: process.env.ALL_COMMITS === 'true',
    kFormat: process.env.K_FORMAT === 'true',
    outputSvg: process.env.OUTPUT_SVG !== 'false',
    outputDir: process.env.OUTPUT_DIR ?? 'output',
  };
}

async function main() {
  const cfg = loadConfig();

  const tasks: Promise<void>[] = [];

  if (cfg.gistIdActivity || cfg.outputSvg) {
    tasks.push(
      updateActivityGist(cfg).catch((err) =>
        console.error(`[activity] Failed: ${err.message}`)
      )
    );
  } else {
    console.info('[activity] No GIST_ID_ACTIVITY and OUTPUT_SVG=false, skipping.');
  }

  if (cfg.gistIdOverview || cfg.outputSvg) {
    tasks.push(
      updateOverviewGist(cfg).catch((err) =>
        console.error(`[overview] Failed: ${err.message}`)
      )
    );
  } else {
    console.info('[overview] No GIST_ID_OVERVIEW and OUTPUT_SVG=false, skipping.');
  }

  const projectConfig = await loadProjectConfig(cfg.projectConfigPath).catch((err) => {
    console.error(`[project] Config load failed: ${err.message}`);
    return null;
  });

  if (projectConfig && (cfg.gistIdProject || cfg.outputSvg)) {
    tasks.push(
      updateProjectGist(cfg, projectConfig).catch((err) =>
        console.error(`[project] Failed: ${err.message}`)
      )
    );
  } else if (!projectConfig) {
    console.info(`[project] No ${cfg.projectConfigPath}, skipping.`);
  } else {
    console.info('[project] No GIST_ID_PROJECT and OUTPUT_SVG=false, skipping.');
  }

  await Promise.all(tasks);
  console.info('Done.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
