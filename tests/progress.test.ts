import { describe, expect, it } from 'vitest';
import { sanitizeSave } from '../src/core/progress';

describe('sanitizeSave', () => {
  it('fills defaults for missing games and clamps junk', () => {
    const save = sanitizeSave({
      v: 1,
      stars: -4,
      games: {
        count: { level: 9, rightStreak: 2, stickers: [1, 7, 2], missKey: 'nope' },
        frog: { level: 2, answered: 3.8 },
      },
    });
    expect(save.stars).toBe(0);
    expect(save.games.count.level).toBe(1);
    expect(save.games.count.rightStreak).toBe(2);
    expect(save.games.count.stickers).toEqual([1, 2]);
    expect(save.games.count.missKey).toBe('nope');
    expect(save.games.frog.level).toBe(2);
    expect(save.games.frog.answered).toBe(3);
    expect(save.games.pattern.level).toBe(1);
    expect(save.games.cart.stickers).toEqual([]);
  });

  it('accepts a valid level 4 game', () => {
    const save = sanitizeSave({
      stars: 12.9,
      games: { add: { level: 4, stickers: [1, 2, 3, 4] } },
    });
    expect(save.stars).toBe(12);
    expect(save.games.add.level).toBe(4);
    expect(save.games.add.stickers).toEqual([1, 2, 3, 4]);
  });
});
