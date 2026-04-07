export function humanize(n: number, kFormat: boolean): string {
  if (n < 1000) return String(n);
  if (kFormat) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString('en-US');
}
