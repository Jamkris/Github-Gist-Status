export type Theme = 'light' | 'dark';

interface ThemeColors {
  bg: string;
  titlebar: string;
  border: string;
  text: string;
  subtext: string;
  barFill: string;
  barEmpty: string;
  accent: string;
}

const THEMES: Record<Theme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    titlebar: '#f6f8fa',
    border: '#d0d7de',
    text: '#1f2328',
    subtext: '#656d76',
    barFill: '#218bff',
    barEmpty: '#eaeef2',
    accent: '#1a7f37',
  },
  dark: {
    bg: '#0d1117',
    titlebar: '#161b22',
    border: '#30363d',
    text: '#e6edf3',
    subtext: '#8b949e',
    barFill: '#58a6ff',
    barEmpty: '#21262d',
    accent: '#7ee787',
  },
};

const FONT_FAMILY =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const WIDTH = 500;
const PADDING_X = 20;
const HEADER_H = 38;
const ROW_H = 26;
const BODY_PAD_Y = 18;
const TARGET_ROWS = 5;
const TOTAL_HEIGHT = HEADER_H + BODY_PAD_Y * 2 + ROW_H * TARGET_ROWS;

function rowCenterY(rowCount: number, i: number): number {
  const bodyTop = HEADER_H + BODY_PAD_Y;
  const bodyH = TOTAL_HEIGHT - HEADER_H - BODY_PAD_Y * 2;
  const spacing = bodyH / rowCount;
  return bodyTop + (i + 0.5) * spacing;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function header(title: string, c: ThemeColors): string {
  return `
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEADER_H}" fill="${c.titlebar}" stroke="${c.border}" rx="8" />
  <rect x="0.5" y="${HEADER_H / 2}" width="${WIDTH - 1}" height="${HEADER_H / 2}" fill="${c.titlebar}" stroke="none" />
  <circle cx="20" cy="${HEADER_H / 2}" r="6" fill="#ff5f57" />
  <circle cx="40" cy="${HEADER_H / 2}" r="6" fill="#febc2e" />
  <circle cx="60" cy="${HEADER_H / 2}" r="6" fill="#28c840" />
  <text x="${WIDTH / 2}" y="${HEADER_H / 2 + 5}" text-anchor="middle" fill="${c.subtext}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(title)}</text>`;
}

interface ActivityRow {
  emoji: string;
  label: string;
  commits: number;
  percent: number;
}

export function buildActivitySvg(
  title: string,
  rows: ActivityRow[],
  theme: Theme
): string {
  const c = THEMES[theme];

  const labelX = PADDING_X;
  const commitsX = 195;
  const barX = 205;
  const barW = 220;
  const percentX = WIDTH - PADDING_X;

  const rowsSvg = rows
    .map((row, i) => {
      const center = rowCenterY(rows.length, i);
      const textY = center + 5;
      const barY = center - 5;
      const fillW = Math.max(0, Math.min(barW, (barW * row.percent) / 100));
      const labelText = `${row.emoji}  ${row.label}`;
      const commitsText = `${row.commits.toLocaleString()} commits`;
      const pctText = `${row.percent.toFixed(1)}%`;

      return `
    <text x="${labelX}" y="${textY}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(labelText)}</text>
    <text x="${commitsX}" y="${textY}" text-anchor="end" fill="${c.subtext}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(commitsText)}</text>
    <rect x="${barX}" y="${barY}" width="${barW}" height="10" rx="5" fill="${c.barEmpty}" />
    <rect x="${barX}" y="${barY}" width="${fillW}" height="10" rx="5" fill="${c.barFill}" />
    <text x="${percentX}" y="${textY}" text-anchor="end" fill="${c.accent}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(pctText)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${TOTAL_HEIGHT}" viewBox="0 0 ${WIDTH} ${TOTAL_HEIGHT}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${TOTAL_HEIGHT - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
  ${header(title, c)}
  ${rowsSvg}
</svg>`;
}

interface OverviewRow {
  emoji: string;
  label: string;
  value: string;
}

export function buildOverviewSvg(
  title: string,
  rows: OverviewRow[],
  theme: Theme
): string {
  const c = THEMES[theme];

  const labelX = PADDING_X;
  const valueX = WIDTH - PADDING_X;

  const rowsSvg = rows
    .map((row, i) => {
      const textY = rowCenterY(rows.length, i) + 5;
      const labelText = `${row.emoji}  ${row.label}`;

      return `
    <text x="${labelX}" y="${textY}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(labelText)}</text>
    <text x="${valueX}" y="${textY}" text-anchor="end" fill="${c.accent}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(row.value)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${TOTAL_HEIGHT}" viewBox="0 0 ${WIDTH} ${TOTAL_HEIGHT}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${TOTAL_HEIGHT - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
  ${header(title, c)}
  ${rowsSvg}
</svg>`;
}

interface ProjectChip {
  icon?: string;
  label: string;
}

interface ProjectRow {
  name: string;
  description: string;
  metrics: ProjectChip[];
  tags: ProjectChip[];
}

const NAME_ROW_H = 22;
const DESC_ROW_H = 20;
const TAGS_ROW_H = 22;
const BLOCK_GAP = 14;
const PROJECT_BODY_PAD_Y = 14;
const MAX_DESC_CHARS = 56;

function chipToString(chip: ProjectChip): string {
  return chip.icon ? `${chip.icon} ${chip.label}` : chip.label;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function blockHeight(row: ProjectRow): number {
  let h = NAME_ROW_H;
  if (row.description) h += DESC_ROW_H;
  if (row.tags.length > 0) h += TAGS_ROW_H;
  return h;
}

export function buildProjectSvg(
  title: string,
  rows: ProjectRow[],
  theme: Theme
): string {
  const c = THEMES[theme];

  if (rows.length === 0) {
    const empty = HEADER_H + PROJECT_BODY_PAD_Y * 2 + NAME_ROW_H;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${empty}" viewBox="0 0 ${WIDTH} ${empty}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${empty - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
  ${header(title, c)}
  <text x="${WIDTH / 2}" y="${HEADER_H + PROJECT_BODY_PAD_Y + NAME_ROW_H / 2 + 5}" text-anchor="middle" fill="${c.subtext}" font-family="${FONT_FAMILY}" font-size="13">No projects configured</text>
</svg>`;
  }

  const blockHeights = rows.map(blockHeight);
  const bodyHeight =
    blockHeights.reduce((sum, h) => sum + h, 0) +
    BLOCK_GAP * Math.max(0, rows.length - 1);
  const totalHeight = HEADER_H + PROJECT_BODY_PAD_Y * 2 + bodyHeight;

  const labelX = PADDING_X;
  const rightX = WIDTH - PADDING_X;

  let cursorY = HEADER_H + PROJECT_BODY_PAD_Y;
  const blocks: string[] = [];

  rows.forEach((row, i) => {
    const blockTop = cursorY;
    const parts: string[] = [];

    const nameY = blockTop + NAME_ROW_H - 6;
    parts.push(
      `<text x="${labelX}" y="${nameY}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(row.name)}</text>`
    );
    if (row.metrics.length > 0) {
      const metricsText = row.metrics.map(chipToString).join('  ');
      parts.push(
        `<text x="${rightX}" y="${nameY}" text-anchor="end" fill="${c.accent}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(metricsText)}</text>`
      );
    }

    let nextY = blockTop + NAME_ROW_H;

    if (row.description) {
      const descY = nextY + DESC_ROW_H - 6;
      parts.push(
        `<text x="${labelX}" y="${descY}" fill="${c.subtext}" font-family="${FONT_FAMILY}" font-size="12">${escapeXml(truncate(row.description, MAX_DESC_CHARS))}</text>`
      );
      nextY += DESC_ROW_H;
    }

    if (row.tags.length > 0) {
      const tagsText = row.tags.map(chipToString).join('   ');
      const tagsY = nextY + TAGS_ROW_H - 6;
      parts.push(
        `<text x="${labelX}" y="${tagsY}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="12">${escapeXml(truncate(tagsText, 64))}</text>`
      );
    }

    blocks.push(parts.join('\n  '));
    cursorY += blockHeights[i] + (i < rows.length - 1 ? BLOCK_GAP : 0);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${totalHeight}" viewBox="0 0 ${WIDTH} ${totalHeight}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${totalHeight - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
  ${header(title, c)}
  ${blocks.join('\n  ')}
</svg>`;
}
