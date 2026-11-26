export const INK = '#2c3a2e';

export function svg(body: string, viewBox = '0 0 100 100', attrs = ''): string {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" ${attrs}>${body}</svg>`;
}

export function starPoints(cx: number, cy: number, outer: number, inner: number, n = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}
