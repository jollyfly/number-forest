import { svg } from './svg';

/** Rounded picture-book numerals. One thick stroke, no font file. */
const GLYPH: Record<string, string> = {
  '0': 'M50 24 C78 24 86 46 86 70 C86 94 78 116 50 116 C22 116 14 94 14 70 C14 46 22 24 50 24 Z',
  '1': 'M36 48 L58 26 V116 M32 116 H80',
  '2': 'M22 50 C22 26 44 16 64 32 C84 48 80 72 58 88 L24 116 H84',
  '3': 'M24 38 H68 C68 38 88 44 76 62 C94 70 92 108 64 118 C40 128 20 110 28 92',
  '4': 'M64 22 V118 M64 22 L20 76 H88',
  '5': 'M80 30 H34 L26 62 H60 C84 62 90 92 64 110 C42 126 16 108 24 88',
  '6': 'M74 40 C60 20 28 26 26 60 C24 98 44 120 66 110 C88 100 86 72 62 64 C40 56 28 68 26 60',
  '7': 'M20 32 H82 L40 118',
  '8': 'M50 68 C28 68 16 54 28 40 C38 26 66 24 76 40 C86 56 72 68 50 68 C24 68 14 86 28 104 C40 120 74 120 84 102 C94 84 76 68 50 68',
  '9': 'M26 100 C40 120 72 114 74 80 C76 42 56 18 34 28 C12 38 14 66 38 74 C58 82 72 70 74 80',
};

function stroke(d: string): string {
  return `<path d="${d}" fill="none" stroke="#2c3a2e" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function digitSvg(n: number): string {
  const text = String(Math.max(0, Math.min(99, Math.floor(Math.abs(n)))));
  if (text.length === 1) {
    return svg(stroke(GLYPH[text] ?? GLYPH['0']!), '4 8 92 124', 'class="digit"');
  }
  const body = text
    .split('')
    .map((ch, i) => `<g transform="translate(${i * 70} 0)">${stroke(GLYPH[ch] ?? GLYPH['0']!)}</g>`)
    .join('');
  return svg(body, '4 8 162 124', 'class="digit digit-wide"');
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
