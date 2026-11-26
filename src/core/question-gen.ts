import { BEAD_IDS, type BeadId } from '../content/beads';
import { choicesFor, mulberry32, pick, randInt, rngOf, shuffle, type Rng } from './random';

export type Level = 1 | 2 | 3 | 4;
export type GameId = 'count' | 'cart' | 'add' | 'frog' | 'pattern';

export const GAME_IDS: GameId[] = ['count', 'cart', 'add', 'frog', 'pattern'];

export interface GenOpts {
  level: Level;
  rng?: Rng;
  /** JSON of a previous miss. Reused a bit more than half the time when it still fits. */
  missKey?: string | null;
  avoidKey?: string | null;
}

export interface CountQ {
  type: 'count';
  key: string;
  count: number;
  layout: 'neat' | 'scatter' | 'flash';
  choices: number[];
}

export interface CartQ {
  type: 'cart';
  key: string;
  target: number;
  frame: 5 | 10;
  /** picture = match real pinecones; dots = ten-frame dots; digit = numeral only. */
  mode: 'picture' | 'dots' | 'digit';
}

export interface AddQ {
  type: 'add';
  key: string;
  a: number;
  b: number;
  answer: number;
  presentation: 'apples' | 'tenframe' | 'tenframe-eq' | 'equation';
  choices: number[];
}

export interface FrogQ {
  type: 'frog';
  key: string;
  start: number;
  delta: number;
  answer: number;
  showEquation: boolean;
}

export interface PatternQ {
  type: 'pattern';
  key: string;
  mode: 'ab' | 'aab' | 'abc' | 'number';
  beads?: BeadId[];
  answerBead?: BeadId;
  choiceBeads?: BeadId[];
  numbers?: number[];
  answerNum?: number;
  choiceNums?: number[];
}

export type Question = CountQ | CartQ | AddQ | FrogQ | PatternQ;

const REPEAT_ODDS = 0.55;

function maybeRepeat<T extends { type: string; key: string }>(
  opts: GenOpts,
  rng: Rng,
  type: string,
  legal: (q: T) => boolean,
  reshuffle: (q: T) => T,
): T | null {
  if (!opts.missKey || rng() >= REPEAT_ODDS) return null;
  try {
    const q = JSON.parse(opts.missKey) as T;
    if (!q || q.type !== type || !legal(q)) return null;
    return reshuffle(q);
  } catch {
    return null;
  }
}

function avoid<T extends { key: string }>(made: T, avoidKey: string | null | undefined, again: () => T): T {
  if (avoidKey && made.key === avoidKey) return again();
  return made;
}

export function genCount(opts: GenOpts): CountQ {
  const rng = rngOf(opts.rng);
  const repeated = maybeRepeat<CountQ>(opts, rng, 'count', (q) => countLegal(opts.level, q), (q) => ({
    ...q,
    choices: shuffle(rng, q.choices),
  }));
  if (repeated) return repeated;

  const make = (): CountQ => {
    let count = 1;
    let layout: CountQ['layout'] = 'neat';
    if (opts.level === 1) count = randInt(rng, 1, 5);
    else if (opts.level === 2) count = randInt(rng, 1, 10);
    else if (opts.level === 3) {
      count = randInt(rng, 4, 10);
      layout = 'scatter';
    } else {
      count = randInt(rng, 3, 8);
      layout = 'flash';
    }
    const q: CountQ = {
      type: 'count',
      key: '',
      count,
      layout,
      choices: choicesFor(count, 1, 10, rng),
    };
    q.key = JSON.stringify(q);
    return q;
  };

  return avoid(make(), opts.avoidKey, make);
}

function countLegal(level: Level, q: CountQ): boolean {
  if (!Number.isInteger(q.count) || q.choices.length !== 3) return false;
  if (!q.choices.includes(q.count)) return false;
  if (level === 1) return q.layout === 'neat' && q.count >= 1 && q.count <= 5;
  if (level === 2) return q.layout === 'neat' && q.count >= 1 && q.count <= 10;
  if (level === 3) return q.layout === 'scatter' && q.count >= 4 && q.count <= 10;
  return q.layout === 'flash' && q.count >= 3 && q.count <= 8;
}

export function genCart(opts: GenOpts): CartQ {
  const rng = rngOf(opts.rng);
  const repeated = maybeRepeat<CartQ>(opts, rng, 'cart', (q) => cartLegal(opts.level, q), (q) => q);
  if (repeated) return repeated;

  const make = (): CartQ => {
    let frame: 5 | 10 = 10;
    let target = 1;
    let mode: CartQ['mode'] = 'digit';
    if (opts.level === 1) {
      frame = 5;
      target = randInt(rng, 1, 5);
      mode = 'picture';
    } else if (opts.level === 2) {
      frame = 10;
      target = randInt(rng, 1, 10);
      mode = 'dots';
    } else if (opts.level === 3) {
      frame = 10;
      target = randInt(rng, 1, 10);
      mode = 'digit';
    } else {
      frame = 10;
      target = randInt(rng, 6, 10);
      mode = 'digit';
    }
    const q: CartQ = { type: 'cart', key: '', target, frame, mode };
    q.key = JSON.stringify(q);
    return q;
  };
  return avoid(make(), opts.avoidKey, make);
}

function cartLegal(level: Level, q: CartQ): boolean {
  if (!Number.isInteger(q.target) || q.target < 1 || q.target > q.frame) return false;
  if (level === 1) return q.frame === 5 && q.mode === 'picture' && q.target <= 5;
  if (level === 2) return q.frame === 10 && q.mode === 'dots';
  if (level === 3) return q.frame === 10 && q.mode === 'digit';
  return q.frame === 10 && q.mode === 'digit' && q.target >= 6;
}

export function genAdd(opts: GenOpts): AddQ {
  const rng = rngOf(opts.rng);
  const repeated = maybeRepeat<AddQ>(opts, rng, 'add', (q) => addLegal(opts.level, q), (q) => ({
    ...q,
    choices: shuffle(rng, q.choices),
  }));
  if (repeated) return repeated;

  const make = (): AddQ => {
    const maxSum = opts.level === 1 ? 5 : 10;
    const a = randInt(rng, 1, maxSum - 1);
    const b = randInt(rng, 1, maxSum - a);
    const presentation: AddQ['presentation'] =
      opts.level === 1 ? 'apples' : opts.level === 2 ? 'tenframe' : opts.level === 3 ? 'tenframe-eq' : 'equation';
    const q: AddQ = {
      type: 'add',
      key: '',
      a,
      b,
      answer: a + b,
      presentation,
      choices: choicesFor(a + b, 0, 10, rng),
    };
    q.key = JSON.stringify(q);
    return q;
  };
  return avoid(make(), opts.avoidKey, make);
}

function addLegal(level: Level, q: AddQ): boolean {
  if (q.a < 1 || q.b < 1 || q.a + q.b !== q.answer || q.answer > 10) return false;
  if (q.choices.length !== 3 || !q.choices.includes(q.answer)) return false;
  if (level === 1) return q.presentation === 'apples' && q.answer <= 5;
  if (level === 2) return q.presentation === 'tenframe';
  if (level === 3) return q.presentation === 'tenframe-eq';
  return q.presentation === 'equation';
}

export function genFrog(opts: GenOpts): FrogQ {
  const rng = rngOf(opts.rng);
  const repeated = maybeRepeat<FrogQ>(opts, rng, 'frog', (q) => frogLegal(opts.level, q), (q) => q);
  if (repeated) return repeated;

  const make = (): FrogQ => {
    const showEquation = opts.level >= 3;
    for (let attempt = 0; attempt < 40; attempt++) {
      let dir: 1 | -1 = 1;
      let mag = 1;
      if (opts.level === 1) {
        dir = 1;
        mag = randInt(rng, 1, 3);
      } else if (opts.level === 2) {
        dir = -1;
        mag = randInt(rng, 1, 3);
      } else if (opts.level === 3) {
        dir = rng() < 0.5 ? 1 : -1;
        mag = randInt(rng, 1, 4);
      } else {
        dir = rng() < 0.5 ? 1 : -1;
        mag = randInt(rng, 2, 5);
      }
      const delta = dir * mag;
      const startMin = delta < 0 ? -delta : 0;
      const startMax = delta > 0 ? 10 - delta : 10;
      if (startMin > startMax) continue;
      const start = randInt(rng, startMin, startMax);
      const q: FrogQ = {
        type: 'frog',
        key: '',
        start,
        delta,
        answer: start + delta,
        showEquation,
      };
      q.key = JSON.stringify(q);
      return q;
    }
    const fallback: FrogQ = {
      type: 'frog',
      key: '',
      start: 0,
      delta: 1,
      answer: 1,
      showEquation: opts.level >= 3,
    };
    fallback.key = JSON.stringify(fallback);
    return fallback;
  };
  return avoid(make(), opts.avoidKey, make);
}

function frogLegal(level: Level, q: FrogQ): boolean {
  if (q.answer !== q.start + q.delta) return false;
  if (q.answer < 0 || q.answer > 10 || q.start < 0 || q.start > 10) return false;
  if (q.delta === 0) return false;
  if (level === 1) return q.delta > 0 && q.delta <= 3 && !q.showEquation;
  if (level === 2) return q.delta < 0 && q.delta >= -3 && !q.showEquation;
  if (level === 3) return Math.abs(q.delta) >= 1 && Math.abs(q.delta) <= 4 && q.showEquation;
  return Math.abs(q.delta) >= 2 && Math.abs(q.delta) <= 5 && q.showEquation;
}

export function genPattern(opts: GenOpts): PatternQ {
  const rng = rngOf(opts.rng);
  const repeated = maybeRepeat<PatternQ>(opts, rng, 'pattern', (q) => patternLegal(opts.level, q), (q) => {
    if (q.choiceBeads) return { ...q, choiceBeads: shuffle(rng, q.choiceBeads) };
    if (q.choiceNums) return { ...q, choiceNums: shuffle(rng, q.choiceNums) };
    return q;
  });
  if (repeated) return repeated;

  const make = (): PatternQ => {
    if (opts.level <= 3) {
      const mode: PatternQ['mode'] = opts.level === 1 ? 'ab' : opts.level === 2 ? 'aab' : 'abc';
      const ids = shuffle(rng, BEAD_IDS);
      let unit: BeadId[];
      if (mode === 'ab') unit = [ids[0]!, ids[1]!];
      else if (mode === 'aab') unit = [ids[0]!, ids[0]!, ids[1]!];
      else unit = [ids[0]!, ids[1]!, ids[2]!];
      const cycles = mode === 'ab' ? 3 : 2;
      const full: BeadId[] = [];
      for (let i = 0; i < cycles; i++) full.push(...unit);
      const answerBead = full[full.length - 1]!;
      const beads = full.slice(0, -1);
      const set = new Set<BeadId>([answerBead]);
      const prefer = shuffle(rng, BEAD_IDS.filter((id) => id !== answerBead));
      for (const id of prefer) {
        if (set.size >= 3) break;
        set.add(id);
      }
      const q: PatternQ = {
        type: 'pattern',
        key: '',
        mode,
        beads,
        answerBead,
        choiceBeads: shuffle(rng, [...set]),
      };
      q.key = JSON.stringify(q);
      return q;
    }

    const steps = [1, 2, -1] as const;
    for (let attempt = 0; attempt < 30; attempt++) {
      const step = pick(rng, steps);
      const maxIndex = 4;
      let start: number;
      if (step > 0) {
        const maxStart = 10 - maxIndex * step;
        if (maxStart < 0) continue;
        start = randInt(rng, 0, maxStart);
      } else {
        start = randInt(rng, maxIndex * -step, 10);
      }
      const numbers = [0, 1, 2, 3].map((i) => start + i * step);
      const answerNum = start + 4 * step;
      if (numbers.some((n) => n < 0 || n > 10) || answerNum < 0 || answerNum > 10) continue;
      const q: PatternQ = {
        type: 'pattern',
        key: '',
        mode: 'number',
        numbers,
        answerNum,
        choiceNums: choicesFor(answerNum, 0, 10, rng),
      };
      q.key = JSON.stringify(q);
      return q;
    }
    const fallback: PatternQ = {
      type: 'pattern',
      key: '',
      mode: 'number',
      numbers: [1, 2, 3, 4],
      answerNum: 5,
      choiceNums: [5, 4, 6],
    };
    fallback.key = JSON.stringify(fallback);
    return fallback;
  };

  return avoid(make(), opts.avoidKey, make);
}

function patternLegal(level: Level, q: PatternQ): boolean {
  if (level < 4) {
    const mode = level === 1 ? 'ab' : level === 2 ? 'aab' : 'abc';
    if (q.mode !== mode || !q.beads || !q.answerBead || !q.choiceBeads) return false;
    if (q.choiceBeads.length !== 3 || !q.choiceBeads.includes(q.answerBead)) return false;
    const full = [...q.beads, q.answerBead];
    const unit = mode === 'ab' ? 2 : 3;
    if (full.length % unit !== 0) return false;
    for (let i = unit; i < full.length; i++) {
      if (full[i] !== full[i % unit]) return false;
    }
    return true;
  }
  if (q.mode !== 'number' || !q.numbers || q.numbers.length !== 4 || q.answerNum == null || !q.choiceNums) {
    return false;
  }
  if (q.choiceNums.length !== 3 || !q.choiceNums.includes(q.answerNum)) return false;
  const seq = [...q.numbers, q.answerNum];
  const step = seq[1]! - seq[0]!;
  if (step !== 1 && step !== 2 && step !== -1) return false;
  return seq.every((n, i) => (i === 0 ? n >= 0 && n <= 10 : n === seq[0]! + i * step));
}

export function generateQuestion(id: GameId, opts: GenOpts): Question {
  if (id === 'count') return genCount(opts);
  if (id === 'cart') return genCart(opts);
  if (id === 'add') return genAdd(opts);
  if (id === 'frog') return genFrog(opts);
  return genPattern(opts);
}

export interface PineSpot {
  x: number;
  y: number;
  size: number;
}

/**
 * Centers for the pinecones on the tree. Spacing is at least the drawn size,
 * so a cone cannot hide the one next to it. Scatter only jitters inside that gap.
 */
export function layoutPines(
  count: number,
  width: number,
  height: number,
  scatter: boolean,
  seed: number,
): PineSpot[] {
  const rng = mulberry32(seed);
  const left = width * 0.24;
  const right = Math.max(left + 80, width * 0.76);
  const top = height * 0.14;
  const bottom = Math.max(top + 80, height * 0.6);
  const availW = right - left;
  const availH = bottom - top;
  const cols = Math.min(count, Math.max(1, Math.floor(availW / 84)));
  const rows = Math.ceil(count / cols);
  const stepX = availW / cols;
  const stepY = availH / rows;
  const size = Math.min(92, Math.max(56, Math.floor(Math.min(stepX, stepY) - 10)));
  const jitterRoom = Math.max(0, Math.min(stepX, stepY) - size) / 2 - 1;
  const spots: PineSpot[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    let x = left + (col + 0.5) * stepX;
    let y = top + (row + 0.5) * stepY;
    if (scatter && jitterRoom > 0) {
      x += (rng() * 2 - 1) * jitterRoom;
      y += (rng() * 2 - 1) * jitterRoom;
    }
    spots.push({ x, y, size });
  }
  return spots;
}
