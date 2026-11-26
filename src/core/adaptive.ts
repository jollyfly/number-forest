import type { Level } from './question-gen';

export interface GameState {
  level: Level;
  rightStreak: number;
  wrongStreak: number;
  rounds: number;
  answered: number;
  firstTryCorrect: number;
  stickers: Level[];
  /** JSON of the last missed question, so the next one can come back to it. */
  missKey: string | null;
}

export interface AnswerUpdate {
  state: GameState;
  change: 'up' | 'down' | null;
}

export function freshGame(): GameState {
  return {
    level: 1,
    rightStreak: 0,
    wrongStreak: 0,
    rounds: 0,
    answered: 0,
    firstTryCorrect: 0,
    stickers: [],
    missKey: null,
  };
}

/**
 * 3 right in a row moves up a level. 2 wrong in a row moves down.
 * Streaks reset when the level changes, and a success clears the miss streak.
 */
export function applyAnswer(state: GameState, correct: boolean): AnswerUpdate {
  const next: GameState = {
    ...state,
    stickers: state.stickers.slice(),
    answered: state.answered + 1,
  };
  let change: AnswerUpdate['change'] = null;

  if (correct) {
    next.firstTryCorrect += 1;
    next.rightStreak += 1;
    next.wrongStreak = 0;
    next.missKey = null;
    if (next.rightStreak >= 3 && next.level < 4) {
      next.level = (next.level + 1) as Level;
      next.rightStreak = 0;
      change = 'up';
    }
  } else {
    next.rightStreak = 0;
    next.wrongStreak += 1;
    if (next.wrongStreak >= 2 && next.level > 1) {
      next.level = (next.level - 1) as Level;
      next.wrongStreak = 0;
      change = 'down';
    }
  }

  return { state: next, change };
}

/** Finishing a round always yields at least one star fruit. Speed is not scored. */
export function starsForRound(correct: number, total: number): number {
  if (total <= 0) return 1;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export const TREE_TIERS = [
  { stars: 0, id: 'house' },
  { stars: 5, id: 'swing' },
  { stars: 10, id: 'bird' },
  { stars: 20, id: 'flowers' },
  { stars: 30, id: 'lanterns' },
  { stars: 50, id: 'flag' },
] as const;

export function treeTier(stars: number): number {
  let tier = 0;
  for (let i = 0; i < TREE_TIERS.length; i++) {
    if (stars >= TREE_TIERS[i]!.stars) tier = i;
  }
  return tier;
}
