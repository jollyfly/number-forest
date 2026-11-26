import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/core/random';
import {
  genAdd,
  genCart,
  genCount,
  genFrog,
  genPattern,
  type Level,
} from '../src/core/question-gen';

const levels: Level[] = [1, 2, 3, 4];

function samples(seed = 1) {
  return levels.flatMap((level) =>
    Array.from({ length: 40 }, (_, i) => ({ level, rng: mulberry32(seed * 1000 + level * 100 + i) })),
  );
}

describe('genCount', () => {
  it('stays inside each level and offers three unique choices', () => {
    for (const s of samples()) {
      const q = genCount(s);
      expect(q.choices).toHaveLength(3);
      expect(new Set(q.choices).size).toBe(3);
      expect(q.choices).toContain(q.count);
      expect(q.choices.every((n) => n >= 0 && n <= 10)).toBe(true);
      if (s.level === 1) {
        expect(q.count).toBeGreaterThanOrEqual(1);
        expect(q.count).toBeLessThanOrEqual(5);
        expect(q.layout).toBe('neat');
      } else if (s.level === 2) {
        expect(q.layout).toBe('neat');
        expect(q.count).toBeLessThanOrEqual(10);
      } else if (s.level === 3) {
        expect(q.layout).toBe('scatter');
        expect(q.count).toBeGreaterThanOrEqual(4);
      } else {
        expect(q.layout).toBe('flash');
        expect(q.count).toBeGreaterThanOrEqual(3);
        expect(q.count).toBeLessThanOrEqual(8);
      }
    }
  });

  it('repeats a legal miss when the roll says so', () => {
    const first = genCount({ level: 1, rng: mulberry32(4) });
    const again = genCount({ level: 1, rng: () => 0, missKey: first.key });
    expect(again.count).toBe(first.count);
    expect(again.layout).toBe(first.layout);
  });

  it('ignores a miss that is too hard for the current level', () => {
    const hard = genCount({ level: 4, rng: mulberry32(9) });
    const q = genCount({ level: 1, rng: mulberry32(3), missKey: hard.key });
    expect(q.layout).toBe('neat');
    expect(q.count).toBeLessThanOrEqual(5);
  });
});

describe('genCart', () => {
  it('fits the target in the frame for every level', () => {
    for (const s of samples(2)) {
      const q = genCart(s);
      expect(q.target).toBeGreaterThanOrEqual(1);
      expect(q.target).toBeLessThanOrEqual(q.frame);
      if (s.level === 1) {
        expect(q.frame).toBe(5);
        expect(q.mode).toBe('picture');
      } else if (s.level === 2) expect(q.mode).toBe('dots');
      else if (s.level === 4) expect(q.target).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('genAdd', () => {
  it('keeps sums inside 10 and never negative', () => {
    for (const s of samples(3)) {
      const q = genAdd(s);
      expect(q.a).toBeGreaterThanOrEqual(1);
      expect(q.b).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBe(q.a + q.b);
      expect(q.answer).toBeLessThanOrEqual(s.level === 1 ? 5 : 10);
      expect(q.choices).toContain(q.answer);
      expect(new Set(q.choices).size).toBe(3);
      expect(q.choices.every((n) => n >= 0 && n <= 10)).toBe(true);
    }
  });
});

describe('genFrog', () => {
  it('lands on the number line', () => {
    for (const s of samples(5)) {
      const q = genFrog(s);
      expect(q.answer).toBe(q.start + q.delta);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(10);
      expect(q.start).toBeGreaterThanOrEqual(0);
      expect(q.start).toBeLessThanOrEqual(10);
      if (s.level === 1) expect(q.delta).toBeGreaterThan(0);
      if (s.level === 2) expect(q.delta).toBeLessThan(0);
      if (s.level >= 3) expect(q.showEquation).toBe(true);
      else expect(q.showEquation).toBe(false);
    }
  });
});

describe('genPattern', () => {
  it('asks for the item the repeating rule predicts', () => {
    for (const s of samples(7)) {
      const q = genPattern(s);
      if (s.level < 4) {
        expect(q.answerBead).toBeTruthy();
        expect(q.choiceBeads).toContain(q.answerBead!);
        expect(new Set(q.choiceBeads).size).toBe(3);
        const full = [...q.beads!, q.answerBead!];
        const unit = q.mode === 'ab' ? 2 : 3;
        for (let i = 0; i < full.length; i++) expect(full[i]).toBe(full[i % unit]);
      } else {
        const seq = [...q.numbers!, q.answerNum!];
        const step = seq[1]! - seq[0]!;
        expect([1, 2, -1]).toContain(step);
        seq.forEach((n, i) => expect(n).toBe(seq[0]! + i * step));
        expect(q.choiceNums).toContain(q.answerNum!);
        expect(seq.every((n) => n >= 0 && n <= 10)).toBe(true);
      }
    }
  });
});
