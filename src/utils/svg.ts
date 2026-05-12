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

const WIDTH = 620;
const PADDING_X = 24;
const HEADER_H = 38;
const ROW_H = 26;
const BODY_PAD_Y = 18;

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
  const height = HEADER_H + BODY_PAD_Y * 2 + ROW_H * rows.length;

  const barX = 230;
  const barW = 220;
  const labelX = PADDING_X;
  const commitsX = 215;
  const percentX = WIDTH - PADDING_X;

  const rowsSvg = rows
    .map((row, i) => {
      const y = HEADER_H + BODY_PAD_Y + i * ROW_H + 18;
      const barY = y - 12;
      const fillW = Math.max(0, Math.min(barW, (barW * row.percent) / 100));
      const labelText = `${row.emoji}  ${row.label}`;
      const commitsText = `${row.commits.toLocaleString()} commits`;
      const pctText = `${row.percent.toFixed(1)}%`;

      return `
    <text x="${labelX}" y="${y}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(labelText)}</text>
    <text x="${commitsX}" y="${y}" text-anchor="end" fill="${c.subtext}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(commitsText)}</text>
    <rect x="${barX}" y="${barY}" width="${barW}" height="10" rx="5" fill="${c.barEmpty}" />
    <rect x="${barX}" y="${barY}" width="${fillW}" height="10" rx="5" fill="${c.barFill}" />
    <text x="${percentX}" y="${y}" text-anchor="end" fill="${c.accent}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(pctText)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
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
  const height = HEADER_H + BODY_PAD_Y * 2 + ROW_H * rows.length;

  const labelX = PADDING_X;
  const valueX = WIDTH - PADDING_X;

  const rowsSvg = rows
    .map((row, i) => {
      const y = HEADER_H + BODY_PAD_Y + i * ROW_H + 18;
      const labelText = `${row.emoji}  ${row.label}`;

      return `
    <text x="${labelX}" y="${y}" fill="${c.text}" font-family="${FONT_FAMILY}" font-size="13">${escapeXml(labelText)}</text>
    <text x="${valueX}" y="${y}" text-anchor="end" fill="${c.accent}" font-family="${FONT_FAMILY}" font-size="13" font-weight="600">${escapeXml(row.value)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" fill="${c.bg}" stroke="${c.border}" rx="8" />
  ${header(title, c)}
  ${rowsSvg}
</svg>`;
}
