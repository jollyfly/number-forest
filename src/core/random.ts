export type Rng = () => number;

export function rngOf(rng?: Rng): Rng {
  return rng ?? Math.random;
}

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** Mulberry32 — small seeded generator for tests and stable scatter layouts. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Three choices: the answer and its two nearest neighbours, so a miss is off-by-one. */
export function choicesFor(answer: number, min: number, max: number, rng: Rng): number[] {
  const pool: number[] = [];
  for (let n = min; n <= max; n++) if (n !== answer) pool.push(n);
  pool.sort((a, b) => Math.abs(a - answer) - Math.abs(b - answer) || a - b);
  const nearest = pool.slice(0, 2);
  return shuffle(rng, [answer, nearest[0]!, nearest[1]!]);
}
