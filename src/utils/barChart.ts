const SYMS = '░▏▎▍▌▋▊▉█';

export function generateBarChart(percent: number, size: number): string {
  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);

  if (barsFull >= size) {
    return SYMS.substring(8, 9).repeat(size);
  }

  const semi = frac % 8;
  return [SYMS.substring(8, 9).repeat(barsFull), SYMS.substring(semi, semi + 1)]
    .join('')
    .padEnd(size, SYMS.substring(0, 1));
}
