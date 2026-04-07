import { resolve } from 'path';
import { config } from 'dotenv';
import { updateProductiveGist } from './modules/productive';
import { updateStatsGist } from './modules/stats';
import type { Config } from './types';

config({ path: resolve(__dirname, '../.env') });

function loadConfig(): Config {
  const ghToken = process.env.GH_TOKEN;
  if (!ghToken) {
    throw new Error('GH_TOKEN is required');
  }

  return {
    ghToken,
    gistIdProductive: process.env.GIST_ID_PRODUCTIVE ?? '',
    gistIdStats: process.env.GIST_ID_STATS ?? '',
    timezone: process.env.TIMEZONE ?? 'Asia/Seoul',
    allCommits: process.env.ALL_COMMITS === 'true',
    kFormat: process.env.K_FORMAT === 'true',
  };
}

async function main() {
  const cfg = loadConfig();

  const tasks: Promise<void>[] = [];

  if (cfg.gistIdProductive) {
    tasks.push(
      updateProductiveGist(cfg).catch((err) =>
        console.error(`[productive] Failed: ${err.message}`)
      )
    );
  } else {
    console.info('[productive] GIST_ID_PRODUCTIVE not set, skipping.');
  }

  if (cfg.gistIdStats) {
    tasks.push(
      updateStatsGist(cfg).catch((err) =>
        console.error(`[stats] Failed: ${err.message}`)
      )
    );
  } else {
    console.info('[stats] GIST_ID_STATS not set, skipping.');
  }

  await Promise.all(tasks);
  console.info('Done.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
