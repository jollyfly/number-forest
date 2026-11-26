import { beadById, type BeadId } from '../content/beads';
import { starPoints, svg } from './svg';

const INK = '#2c3a2e';

export function pineconeSvg(): string {
  return svg(
    `<path d="M50 16 C66 30 74 52 68 82 C64 104 50 116 50 116 C50 116 36 104 32 82 C26 52 34 30 50 16 Z" fill="#d4893a" stroke="${INK}" stroke-width="4"/>
     <path d="M38 46 Q50 54 62 46 M34 62 Q50 72 66 62 M36 80 Q50 90 64 80 M42 96 Q50 102 58 96" stroke="#8a4e1c" stroke-width="3" stroke-linecap="round" fill="none"/>
     <path d="M50 16 C50 8 60 8 58 18" stroke="#3e8f45" stroke-width="4" stroke-linecap="round" fill="none"/>`,
  );
}

export function appleSvg(): string {
  return svg(
    `<ellipse cx="50" cy="86" rx="18" ry="6" fill="#2c3a2e" opacity="0.12"/>
     <circle cx="50" cy="58" r="30" fill="#ff5a5a" stroke="${INK}" stroke-width="4"/>
     <ellipse cx="38" cy="48" rx="8" ry="5" fill="#fff" opacity="0.55"/>
     <path d="M50 30 C50 18 62 16 64 26" stroke="#6b3a22" stroke-width="4" stroke-linecap="round" fill="none"/>
     <path d="M52 30 C64 22 74 30 68 40 C60 34 54 34 52 30 Z" fill="#5cbf6a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  );
}

export function starFruitSvg(): string {
  return svg(
    `<polygon points="${starPoints(50, 54, 40, 18)}" fill="#ffd84a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <path d="M50 18 C50 8 62 10 58 20" stroke="#3e8f45" stroke-width="4" stroke-linecap="round" fill="none"/>
     <circle cx="42" cy="52" r="3" fill="${INK}"/>
     <circle cx="58" cy="52" r="3" fill="${INK}"/>
     <path d="M44 62 Q50 68 56 62" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  );
}

export function lilySvg(): string {
  return svg(
    `<ellipse cx="50" cy="58" rx="44" ry="28" fill="#3dcf78" stroke="${INK}" stroke-width="4"/>
     <path d="M50 40 C50 70 50 78 50 86" stroke="#1f8a4c" stroke-width="3" stroke-linecap="round"/>
     <path d="M50 58 C28 48 24 70 40 72" stroke="#1f8a4c" stroke-width="3" fill="none"/>
     <ellipse cx="78" cy="34" rx="10" ry="6" fill="#ff8fab" stroke="${INK}" stroke-width="3"/>
     <circle cx="78" cy="34" r="2.5" fill="#ffd15c"/>`,
    '0 0 100 100',
  );
}

export function basketSvg(): string {
  return svg(
    `<path d="M22 42 H78 L70 88 H30 Z" fill="#e7b56a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <path d="M30 42 C30 24 70 24 70 42" stroke="${INK}" stroke-width="4" fill="none"/>
     <path d="M34 56 H66 M36 70 H64" stroke="#c4893a" stroke-width="3" stroke-linecap="round"/>
     <path d="M38 36 C38 28 62 28 62 36" stroke="${INK}" stroke-width="4" fill="none"/>`,
  );
}

export function beadSvg(id: BeadId): string {
  const bead = beadById(id);
  const common = `fill="${bead.fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  let shape = '';
  if (bead.shape === 'circle') {
    shape = `<circle cx="50" cy="50" r="34" ${common}/><circle cx="38" cy="38" r="8" fill="#fff" opacity="0.45"/>`;
  } else if (bead.shape === 'squircle') {
    shape = `<rect x="16" y="16" width="68" height="68" rx="18" ${common}/><path d="M28 40 H72 M28 54 H72" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`;
  } else if (bead.shape === 'triangle') {
    shape = `<polygon points="50,12 92,84 8,84" ${common}/><circle cx="50" cy="62" r="6" fill="#fff"/><circle cx="38" cy="72" r="4" fill="#fff"/><circle cx="62" cy="72" r="4" fill="#fff"/>`;
  } else if (bead.shape === 'diamond') {
    shape = `<polygon points="50,8 92,50 50,92 8,50" ${common}/><polygon points="50,24 76,50 50,76 24,50" fill="none" stroke="#fff" stroke-width="4"/>`;
  } else {
    shape = `<polygon points="${starPoints(50, 50, 40, 18)}" ${common}/><circle cx="50" cy="50" r="7" fill="#fff"/>`;
  }
  return svg(shape, '0 0 100 100', `class="bead bead-${id}"`);
}

export function treeSvg(): string {
  return svg(
    `<ellipse cx="200" cy="360" rx="120" ry="22" fill="#2c3a2e" opacity="0.12"/>
     <rect x="176" y="210" width="48" height="150" rx="16" fill="#8a5a32" stroke="${INK}" stroke-width="5"/>
     <circle cx="140" cy="180" r="78" fill="#6fbf63" stroke="${INK}" stroke-width="5"/>
     <circle cx="230" cy="160" r="90" fill="#8ed36a" stroke="${INK}" stroke-width="5"/>
     <circle cx="200" cy="120" r="74" fill="#b6e98a" stroke="${INK}" stroke-width="5"/>
     <circle cx="250" cy="210" r="64" fill="#5eae55" stroke="${INK}" stroke-width="5"/>`,
    '0 0 400 390',
    'class="tree"',
  );
}

export function treehouseSvg(tier: number): string {
  const swing =
    tier >= 1
      ? `<path d="M196 150 V210" stroke="${INK}" stroke-width="3"/><path d="M228 150 V210" stroke="${INK}" stroke-width="3"/><rect x="190" y="206" width="44" height="10" rx="4" fill="#e7b56a" stroke="${INK}" stroke-width="3"/>`
      : '';
  const flowers =
    tier >= 3
      ? `<g>
          <circle cx="70" cy="286" r="8" fill="#ff8fab" stroke="${INK}" stroke-width="3"/>
          <circle cx="90" cy="294" r="7" fill="#ffd15c" stroke="${INK}" stroke-width="3"/>
          <circle cx="210" cy="292" r="8" fill="#ff8fab" stroke="${INK}" stroke-width="3"/>
          <circle cx="230" cy="284" r="7" fill="#b07be0" stroke="${INK}" stroke-width="3"/>
        </g>`
      : '';
  const bird =
    tier >= 2
      ? `<g transform="translate(206,118) scale(0.55)">
          <ellipse cx="40" cy="30" rx="22" ry="14" fill="#7ec8ff" stroke="${INK}" stroke-width="4"/>
          <circle cx="60" cy="22" r="12" fill="#7ec8ff" stroke="${INK}" stroke-width="4"/>
          <circle cx="64" cy="20" r="2.5" fill="${INK}"/>
          <polygon points="72,22 84,18 72,28" fill="#ffb703" stroke="${INK}" stroke-width="3"/>
        </g>`
      : '';
  const lanterns =
    tier >= 4
      ? `<g>
          <path d="M78 120 V150" stroke="${INK}" stroke-width="3"/>
          <rect x="66" y="150" width="24" height="28" rx="6" fill="#ffd15c" stroke="${INK}" stroke-width="3"/>
          <path d="M250 96 V128" stroke="${INK}" stroke-width="3"/>
          <rect x="238" y="128" width="24" height="28" rx="6" fill="#ff8a5b" stroke="${INK}" stroke-width="3"/>
        </g>`
      : '';
  const flag =
    tier >= 5
      ? `<path d="M168 78 V40" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
         <polygon points="168,40 206,52 168,64" fill="#ff5a5a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
         <ellipse cx="250" cy="300" rx="28" ry="10" fill="#7fd4ee" stroke="${INK}" stroke-width="3"/>`
      : '';

  return svg(
    `<ellipse cx="140" cy="300" rx="110" ry="16" fill="#2c3a2e" opacity="0.12"/>
     <rect x="118" y="168" width="36" height="120" rx="12" fill="#8a5a32" stroke="${INK}" stroke-width="4"/>
     <circle cx="78" cy="150" r="58" fill="#7dcc68" stroke="${INK}" stroke-width="4"/>
     <circle cx="150" cy="120" r="70" fill="#9adf78" stroke="${INK}" stroke-width="4"/>
     <circle cx="210" cy="156" r="54" fill="#62b85a" stroke="${INK}" stroke-width="4"/>
     <path d="M108 150 L140 112 L176 150 Z" fill="#e15b3a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
     <rect x="112" y="148" width="60" height="46" rx="6" fill="#fff6ea" stroke="${INK}" stroke-width="4"/>
     <rect x="132" y="166" width="18" height="28" rx="4" fill="#c47a32" stroke="${INK}" stroke-width="3"/>
     <rect x="116" y="156" width="14" height="14" rx="2" fill="#9fd8ff" stroke="${INK}" stroke-width="3"/>
     ${swing}${bird}${lanterns}${flowers}${flag}`,
    '0 0 280 320',
    'class="treehouse"',
  );
}

export function cloudSvg(): string {
  return svg(
    `<g fill="#fff" stroke="${INK}" stroke-width="4">
      <ellipse cx="40" cy="40" rx="22" ry="16"/>
      <ellipse cx="62" cy="36" rx="26" ry="20"/>
      <ellipse cx="86" cy="42" rx="18" ry="14"/>
      <rect x="28" y="40" width="68" height="16" rx="8" stroke="none"/>
    </g>`,
    '0 0 110 70',
  );
}

export function groundPatch(fill: string): string {
  return svg(
    `<ellipse cx="100" cy="36" rx="92" ry="26" fill="${fill}" stroke="${INK}" stroke-width="4"/>`,
    '0 0 200 70',
  );
}
