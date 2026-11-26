import { svg } from './svg';

export type Expr = 'happy' | 'think' | 'wow' | 'cheer';

const INK = '#2c3a2e';
const FUR = '#e15b3a';
const FUR2 = '#c2412a';
const CREAM = '#fff6ea';
const BLUSH = '#ffb4b0';

export function tuantuan(expr: Expr, opts?: { wave?: boolean }): string {
  const think = expr === 'think';
  const wow = expr === 'wow';
  const cheer = expr === 'cheer';
  const eyeRy = wow ? 15 : 12.5;
  const py = think ? 100 : wow ? 112 : 110;
  const px = think ? 0 : 2;
  const mouth = wow
    ? `<ellipse cx="110" cy="146" rx="11" ry="13" fill="${INK}"/>`
    : think
      ? `<path d="M98 144 Q110 148 122 142" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`
      : cheer
        ? `<path d="M90 138 Q110 166 130 138" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`
        : `<path d="M94 140 Q110 158 126 140" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const wave = Boolean(opts?.wave) || cheer;
  const leftArm = wave
    ? `<g class="arm-wave"><ellipse cx="48" cy="168" rx="16" ry="22" transform="rotate(-50 48 168)" fill="${FUR}" stroke="${INK}" stroke-width="4"/><circle cx="34" cy="146" r="12" fill="${FUR}" stroke="${INK}" stroke-width="4"/></g>`
    : `<ellipse cx="52" cy="196" rx="16" ry="20" fill="${FUR}" stroke="${INK}" stroke-width="4"/>`;
  const rightArm = cheer
    ? `<ellipse cx="172" cy="168" rx="16" ry="22" transform="rotate(50 172 168)" fill="${FUR}" stroke="${INK}" stroke-width="4"/><circle cx="186" cy="146" r="12" fill="${FUR}" stroke="${INK}" stroke-width="4"/>`
    : `<ellipse cx="168" cy="196" rx="16" ry="20" fill="${FUR}" stroke="${INK}" stroke-width="4"/>`;
  const tilt = think ? 'rotate(-8 110 120)' : '';

  return svg(
    `<g transform="${tilt}">
      <ellipse cx="176" cy="188" rx="30" ry="22" fill="${FUR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="186" cy="186" rx="16" ry="12" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="196" cy="184" rx="8" ry="7" fill="${FUR2}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="110" cy="196" rx="62" ry="36" fill="${FUR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="110" cy="206" rx="36" ry="20" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      ${leftArm}${rightArm}
      <ellipse cx="62" cy="78" rx="24" ry="28" fill="${FUR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="158" cy="78" rx="24" ry="28" fill="${FUR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="62" cy="82" rx="12" ry="16" fill="#f6c7b4"/>
      <ellipse cx="158" cy="82" rx="12" ry="16" fill="#f6c7b4"/>
      <circle cx="110" cy="112" r="70" fill="${FUR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="110" cy="128" rx="46" ry="40" fill="${CREAM}"/>
      <ellipse cx="80" cy="112" rx="20" ry="18" fill="#f3b89a"/>
      <ellipse cx="140" cy="112" rx="20" ry="18" fill="#f3b89a"/>
      <g class="eye" style="transform-origin: 80px 112px">
        <ellipse cx="80" cy="112" rx="11" ry="${eyeRy}" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="${80 + px}" cy="${py}" rx="5.5" ry="6.5" fill="${INK}"/>
        <circle cx="${83 + px}" cy="${py - 3}" r="2" fill="#fff"/>
      </g>
      <g class="eye" style="transform-origin: 140px 112px">
        <ellipse cx="140" cy="112" rx="11" ry="${eyeRy}" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="${140 + px}" cy="${py}" rx="5.5" ry="6.5" fill="${INK}"/>
        <circle cx="${143 + px}" cy="${py - 3}" r="2" fill="#fff"/>
      </g>
      <ellipse cx="110" cy="130" rx="7" ry="5.5" fill="${INK}"/>
      ${mouth}
      <ellipse cx="62" cy="136" rx="10" ry="7" fill="${BLUSH}" opacity="0.9"/>
      <ellipse cx="158" cy="136" rx="10" ry="7" fill="${BLUSH}" opacity="0.9"/>
      ${think ? `<ellipse cx="92" cy="156" rx="12" ry="10" fill="${FUR}" stroke="${INK}" stroke-width="3" transform="rotate(-20 92 156)"/>` : ''}
    </g>`,
    '0 0 220 240',
    `class="tuantuan expr-${expr}"`,
  );
}

export function squirrel(): string {
  return svg(
    `<ellipse cx="46" cy="108" rx="36" ry="28" fill="#f0a04a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="40" cy="104" rx="18" ry="16" fill="#ffe0b0" stroke="#2c3a2e" stroke-width="3"/>
     <ellipse cx="118" cy="128" rx="48" ry="36" fill="#e0903a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="118" cy="138" rx="26" ry="18" fill="#ffe7c4"/>
     <circle cx="150" cy="78" r="36" fill="#e0903a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="132" cy="52" rx="10" ry="16" fill="#e0903a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="168" cy="50" rx="10" ry="16" fill="#e0903a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="138" cy="78" rx="8" ry="9" fill="#fff" stroke="#2c3a2e" stroke-width="3"/>
     <ellipse cx="162" cy="78" rx="8" ry="9" fill="#fff" stroke="#2c3a2e" stroke-width="3"/>
     <circle cx="140" cy="80" r="4" fill="#2c3a2e"/>
     <circle cx="164" cy="80" r="4" fill="#2c3a2e"/>
     <ellipse cx="150" cy="92" rx="5" ry="4" fill="#2c3a2e"/>
     <path d="M140 100 Q150 108 160 100" stroke="#2c3a2e" stroke-width="3" stroke-linecap="round"/>
     <ellipse cx="124" cy="104" rx="8" ry="5" fill="#ffb4b0"/>
     <ellipse cx="176" cy="104" rx="8" ry="5" fill="#ffb4b0"/>
     <ellipse cx="96" cy="150" rx="14" ry="10" fill="#c47a32" stroke="#2c3a2e" stroke-width="3"/>
     <ellipse cx="150" cy="156" rx="14" ry="10" fill="#c47a32" stroke="#2c3a2e" stroke-width="3"/>`,
    '0 0 200 190',
    'class="squirrel"',
  );
}

export function frog(): string {
  return svg(
    `<ellipse cx="100" cy="150" rx="70" ry="28" fill="#1f8a4c" opacity="0.25"/>
     <ellipse cx="70" cy="118" rx="28" ry="18" fill="#3dbe6a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="132" cy="118" rx="28" ry="18" fill="#3dbe6a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="100" cy="120" rx="58" ry="46" fill="#4ed07a" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="100" cy="132" rx="36" ry="28" fill="#e9ffc8" stroke="#2c3a2e" stroke-width="4"/>
     <g class="eye" style="transform-origin: 70px 78px">
       <circle cx="70" cy="78" r="22" fill="#fff" stroke="#2c3a2e" stroke-width="4"/>
       <circle cx="74" cy="80" r="10" fill="#2c3a2e"/>
       <circle cx="78" cy="76" r="4" fill="#fff"/>
     </g>
     <g class="eye" style="transform-origin: 130px 78px">
       <circle cx="130" cy="78" r="22" fill="#fff" stroke="#2c3a2e" stroke-width="4"/>
       <circle cx="134" cy="80" r="10" fill="#2c3a2e"/>
       <circle cx="138" cy="76" r="4" fill="#fff"/>
     </g>
     <path d="M82 128 Q100 146 118 128" stroke="#2c3a2e" stroke-width="4" stroke-linecap="round" fill="none"/>
     <circle cx="78" cy="118" r="6" fill="#ff9aa8"/>
     <circle cx="122" cy="118" r="6" fill="#ff9aa8"/>`,
    '0 0 200 180',
    'class="frog"',
  );
}

export function owl(): string {
  return svg(
    `<ellipse cx="100" cy="150" rx="46" ry="14" fill="#2c3a2e" opacity="0.12"/>
     <ellipse cx="58" cy="110" rx="22" ry="36" fill="#8a6239" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="142" cy="110" rx="22" ry="36" fill="#8a6239" stroke="#2c3a2e" stroke-width="4"/>
     <ellipse cx="100" cy="112" rx="58" ry="64" fill="#c4884a" stroke="#2c3a2e" stroke-width="4"/>
     <polygon points="78,42 100,18 108,48" fill="#6b4528" stroke="#2c3a2e" stroke-width="4" stroke-linejoin="round"/>
     <polygon points="122,42 100,18 92,48" fill="#6b4528" stroke="#2c3a2e" stroke-width="4" stroke-linejoin="round"/>
     <ellipse cx="100" cy="128" rx="36" ry="40" fill="#fff3d6" stroke="#2c3a2e" stroke-width="4"/>
     <path d="M86 120 H114 M88 134 H112 M90 148 H110" stroke="#e6c48a" stroke-width="4" stroke-linecap="round"/>
     <circle cx="78" cy="96" r="20" fill="#fff" stroke="#2c3a2e" stroke-width="4"/>
     <circle cx="122" cy="96" r="20" fill="#fff" stroke="#2c3a2e" stroke-width="4"/>
     <circle cx="80" cy="98" r="8" fill="#2c3a2e"/>
     <circle cx="124" cy="98" r="8" fill="#2c3a2e"/>
     <circle cx="83" cy="95" r="3" fill="#fff"/>
     <circle cx="127" cy="95" r="3" fill="#fff"/>
     <path d="M62 96 H42 M138 96 H158" stroke="#2c3a2e" stroke-width="4" stroke-linecap="round"/>
     <polygon points="100,112 90,126 110,126" fill="#f2a13a" stroke="#2c3a2e" stroke-width="4" stroke-linejoin="round"/>
     <path d="M78 78 Q70 64 86 70" stroke="#2c3a2e" stroke-width="4" stroke-linecap="round" fill="none"/>
     <path d="M122 78 Q130 64 114 70" stroke="#2c3a2e" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    '0 0 200 190',
    'class="owl"',
  );
}

export function bird(): string {
  return svg(
    `<ellipse cx="70" cy="58" rx="28" ry="18" fill="#7ec8ff" stroke="#2c3a2e" stroke-width="4"/>
     <circle cx="96" cy="48" r="16" fill="#7ec8ff" stroke="#2c3a2e" stroke-width="4"/>
     <circle cx="102" cy="46" r="3.5" fill="#2c3a2e"/>
     <polygon points="112,48 126,44 112,54" fill="#ffb703" stroke="#2c3a2e" stroke-width="3" stroke-linejoin="round"/>
     <path d="M48 54 Q30 40 24 58" stroke="#2c3a2e" stroke-width="4" fill="#b5e4ff" stroke-linejoin="round"/>
     <path d="M64 74 L58 88 M78 74 L84 88" stroke="#2c3a2e" stroke-width="4" stroke-linecap="round"/>`,
    '0 0 140 100',
    'class="bird"',
  );
}
