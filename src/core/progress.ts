import { freshGame, type GameState } from './adaptive';
import { GAME_IDS, type GameId, type Level } from './question-gen';

export interface SaveData {
  v: 1;
  stars: number;
  games: Record<GameId, GameState>;
}

const KEY = 'number-forest-v1';

export function defaultSave(): SaveData {
  const games = {} as Record<GameId, GameState>;
  for (const id of GAME_IDS) games[id] = freshGame();
  return { v: 1, stars: 0, games };
}

function isLevel(n: unknown): n is Level {
  return n === 1 || n === 2 || n === 3 || n === 4;
}

function sanitizeGame(raw: unknown): GameState {
  const base = freshGame();
  if (!raw || typeof raw !== 'object') return base;
  const g = raw as Partial<GameState>;
  if (isLevel(g.level)) base.level = g.level;
  if (typeof g.rightStreak === 'number' && g.rightStreak >= 0) base.rightStreak = Math.floor(g.rightStreak);
  if (typeof g.wrongStreak === 'number' && g.wrongStreak >= 0) base.wrongStreak = Math.floor(g.wrongStreak);
  if (typeof g.rounds === 'number') base.rounds = Math.max(0, Math.floor(g.rounds));
  if (typeof g.answered === 'number') base.answered = Math.max(0, Math.floor(g.answered));
  if (typeof g.firstTryCorrect === 'number') base.firstTryCorrect = Math.max(0, Math.floor(g.firstTryCorrect));
  if (Array.isArray(g.stickers)) {
    base.stickers = g.stickers.filter(isLevel);
  }
  if (typeof g.missKey === 'string') base.missKey = g.missKey;
  return base;
}

export function sanitizeSave(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<SaveData>;
  if (typeof s.stars === 'number' && Number.isFinite(s.stars)) base.stars = Math.max(0, Math.floor(s.stars));
  if (s.games && typeof s.games === 'object') {
    for (const id of GAME_IDS) {
      base.games[id] = sanitizeGame((s.games as Record<string, unknown>)[id]);
    }
  }
  return base;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return sanitizeSave(JSON.parse(raw));
  } catch {
    return defaultSave();
  }
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or full storage — play continues, progress just won't stick */
  }
}

export const SAVE_KEY = KEY;
