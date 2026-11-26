import { describe, expect, it } from 'vitest';
import { layoutPines } from '../src/core/question-gen';

function assertSeparated(spots: { x: number; y: number; size: number }[]) {
  expect(spots.length).toBeGreaterThan(0);
  for (let i = 0; i < spots.length; i++) {
    for (let j = i + 1; j < spots.length; j++) {
      const a = spots[i]!;
      const b = spots[j]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      expect(dist + 0.5).toBeGreaterThanOrEqual(Math.min(a.size, b.size));
    }
  }
}

describe('layoutPines', () => {
  it('keeps ten pinecones from covering each other', () => {
    for (const scatter of [false, true]) {
      for (const seed of [1, 7, 42, 99]) {
        assertSeparated(layoutPines(10, 1180, 560, scatter, seed));
        assertSeparated(layoutPines(10, 820, 980, scatter, seed));
        assertSeparated(layoutPines(5, 1180, 560, scatter, seed));
      }
    }
  });
});
