import { svg, starPoints } from './svg';

export function speakerIcon(): string {
  return svg(
    `<path d="M18 38 H34 L52 22 V78 L34 62 H18 Z" fill="#fffdf8" stroke="#2c3a2e" stroke-width="5" stroke-linejoin="round"/>
     <path d="M64 38 C72 44 72 56 64 62" stroke="#2c3a2e" stroke-width="5" stroke-linecap="round" fill="none"/>
     <path d="M70 28 C84 38 84 62 70 72" stroke="#2c3a2e" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  );
}

export function backIcon(): string {
  return svg(
    `<path d="M62 20 L30 50 L62 80" stroke="#2c3a2e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  );
}

export function checkIcon(): string {
  return svg(
    `<path d="M22 52 L42 72 L80 30" stroke="#2c3a2e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  );
}

export function playIcon(): string {
  return svg(`<polygon points="34,22 82,50 34,78" fill="#2c3a2e"/>`);
}

export function homeIcon(): string {
  return svg(
    `<path d="M18 48 L50 20 L82 48 V82 H62 V60 H38 V82 H18 Z" fill="#fffdf8" stroke="#2c3a2e" stroke-width="5" stroke-linejoin="round"/>`,
  );
}

export function sparkleIcon(): string {
  return svg(`<polygon points="${starPoints(50, 50, 42, 18)}" fill="#ffd15c" stroke="#2c3a2e" stroke-width="5" stroke-linejoin="round"/>`);
}
