import { svg } from './svg';

/** Chunky pebble digits. Readable without a font, and they double as tracing shapes later. */
const MATRIX: Record<string, string[]> = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['10010', '10010', '10010', '11111', '00010', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
};

function pebbles(rows: string[], ox: number): string {
  const dots: string[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '1') dots.push(`<circle cx="${ox + x}" cy="${y}" r="0.46" fill="#2c3a2e"/>`);
    }
  });
  return dots.join('');
}

export function digitSvg(n: number): string {
  const s = String(Math.max(0, Math.min(99, Math.floor(n))));
  if (s.length === 1) {
    return svg(pebbles(MATRIX[s] ?? MATRIX['0']!, 0), '-0.6 -0.7 5.2 7.4', 'class="digit"');
  }
  const body = s
    .split('')
    .map((ch, i) => pebbles(MATRIX[ch] ?? MATRIX['0']!, i * 6))
    .join('');
  return svg(body, '-0.6 -0.7 11.2 7.4', 'class="digit digit-wide"');
}

export function opSvg(op: '+' | '-' | '='): string {
  if (op === '+') {
    return svg(
      '<rect x="18" y="42" width="64" height="16" rx="8" fill="#2c3a2e"/><rect x="42" y="18" width="16" height="64" rx="8" fill="#2c3a2e"/>',
      '0 0 100 100',
      'class="op"',
    );
  }
  if (op === '-') {
    return svg('<rect x="16" y="42" width="68" height="16" rx="8" fill="#2c3a2e"/>', '0 0 100 100', 'class="op"');
  }
  return svg(
    '<rect x="16" y="30" width="68" height="14" rx="7" fill="#2c3a2e"/><rect x="16" y="56" width="68" height="14" rx="7" fill="#2c3a2e"/>',
    '0 0 100 100',
    'class="op"',
  );
}

export function arrowSvg(dir: 'left' | 'right'): string {
  const d =
    dir === 'right'
      ? 'M16 50 H70 M70 50 L48 28 M70 50 L48 72'
      : 'M84 50 H30 M30 50 L52 28 M30 50 L52 72';
  return svg(
    `<path d="${d}" stroke="#2c3a2e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    '0 0 100 100',
    'class="arrow"',
  );
}
