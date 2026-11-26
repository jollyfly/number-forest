import { describe, expect, it } from 'vitest';
import { applyAnswer, freshGame, starsForRound, treeTier } from '../src/core/adaptive';

describe('applyAnswer', () => {
  it('raises a level after 3 correct and resets the streak', () => {
    let state = freshGame();
    state = applyAnswer(state, true).state;
    state = applyAnswer(state, true).state;
    const third = applyAnswer(state, true);
    expect(third.change).toBe('up');
    expect(third.state.level).toBe(2);
    expect(third.state.rightStreak).toBe(0);
    expect(third.state.wrongStreak).toBe(0);
  });

  it('does not pass level 4', () => {
    let state = freshGame();
    state.level = 4;
    state.rightStreak = 2;
    const next = applyAnswer(state, true);
    expect(next.change).toBeNull();
    expect(next.state.level).toBe(4);
    expect(next.state.rightStreak).toBe(3);
  });

  it('drops a level after 2 wrong and never below 1', () => {
    let state = freshGame();
    state.level = 3;
    state.rightStreak = 2;
    const first = applyAnswer(state, false);
    expect(first.change).toBeNull();
    expect(first.state.level).toBe(3);
    expect(first.state.rightStreak).toBe(0);
    expect(first.state.wrongStreak).toBe(1);
    const second = applyAnswer(first.state, false);
    expect(second.change).toBe('down');
    expect(second.state.level).toBe(2);
    expect(second.state.wrongStreak).toBe(0);

    let floor = freshGame();
    floor = applyAnswer(floor, false).state;
    const stuck = applyAnswer(floor, false);
    expect(stuck.change).toBeNull();
    expect(stuck.state.level).toBe(1);
  });

  it('counts answered questions and first-try successes', () => {
    let state = freshGame();
    state = applyAnswer(state, true).state;
    state = applyAnswer(state, false).state;
    expect(state.answered).toBe(2);
    expect(state.firstTryCorrect).toBe(1);
  });
});

describe('starsForRound', () => {
  it('always gives at least one, and three only for a perfect round', () => {
    expect(starsForRound(0, 6)).toBe(1);
    expect(starsForRound(3, 6)).toBe(1);
    expect(starsForRound(4, 6)).toBe(2);
    expect(starsForRound(5, 6)).toBe(2);
    expect(starsForRound(6, 6)).toBe(3);
    expect(starsForRound(0, 0)).toBe(1);
  });
});

describe('treeTier', () => {
  it('unlocks decorations at the planned star counts', () => {
    expect(treeTier(0)).toBe(0);
    expect(treeTier(4)).toBe(0);
    expect(treeTier(5)).toBe(1);
    expect(treeTier(10)).toBe(2);
    expect(treeTier(20)).toBe(3);
    expect(treeTier(30)).toBe(4);
    expect(treeTier(50)).toBe(5);
    expect(treeTier(80)).toBe(5);
  });
});
