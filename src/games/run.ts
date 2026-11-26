import { applyAnswer, starsForRound, type GameState } from '../core/adaptive';
import { delay } from '../core/delay';
import { generateQuestion, type GameId, type Level, type Question } from '../core/question-gen';
import { loadSave, saveSave } from '../core/progress';
import { lines } from '../content/lines';
import { getAudio } from '../core/audio';
import { speak, stopVoice } from '../core/voice';
import { playAdd } from './fruit-add';
import { playCart } from './ten-frame-cart';
import { playCount } from './count-pinecones';
import { playFrog } from './frog-jump';
import { playPattern } from './pattern';
import { mountShell } from './shell';
import type { PlayCtx } from './types';
import type { Outcome } from './outcome';

export const ROUND_LENGTH = 6;

export interface RoundEnd {
  completed: boolean;
  earned: number;
  stars: number;
  correct: number;
  total: number;
  gameId: GameId;
  sticker: Level | null;
}

export function runRound(root: HTMLElement, gameId: GameId, onDone: (result: RoundEnd) => void): void {
  const audio = getAudio();
  const save = loadSave();
  let gs: GameState = save.games[gameId];
  const startLevel = gs.level;
  let correct = 0;
  let extraHint = false;
  let ended = false;
  let lastKey: string | null = null;

  const shell = mountShell(root, {
    gameId,
    stars: save.stars,
    onBack: () =>
      finish({
        completed: false,
        earned: 0,
        stars: save.stars,
        correct,
        total: ROUND_LENGTH,
        gameId,
        sticker: null,
      }),
  });

  function finish(result: RoundEnd) {
    if (ended) return;
    ended = true;
    shell.abort();
    stopVoice();
    onDone(result);
  }

  void (async () => {
    try {
      for (let i = 0; i < ROUND_LENGTH; i++) {
        if (shell.signal.aborted || ended) return;
        shell.prepare();
        shell.setPip(i, ROUND_LENGTH);
        const q = generateQuestion(gameId, {
          level: gs.level,
          missKey: gs.missKey,
          avoidKey: lastKey,
        });
        lastKey = q.key;
        const outcome = await playOne(shell.ctx(extraHint), q);
        if (shell.signal.aborted || ended) return;
        const first = outcome === 'abort' ? false : outcome;
        const applied = applyAnswer(gs, first);
        gs = applied.state;
        if (!first) gs.missKey = q.key;
        extraHint = !first || applied.change === 'down';
        if (first) correct += 1;
        save.games[gameId] = gs;
        saveSave(save);
        shell.setStars(save.stars);
        if (applied.change === 'up' && !shell.signal.aborted) {
          shell.setFace('wow');
          speak(lines.levelUp);
          audio.star();
          await delay(800, shell.signal);
        }
      }
      if (ended || shell.signal.aborted) return;
      if (!gs.stickers.includes(startLevel)) gs.stickers = [...gs.stickers, startLevel];
      gs.rounds += 1;
      save.games[gameId] = gs;
      const earned = starsForRound(correct, ROUND_LENGTH);
      save.stars += earned;
      saveSave(save);
      audio.star();
      finish({
        completed: true,
        earned,
        stars: save.stars,
        correct,
        total: ROUND_LENGTH,
        gameId,
        sticker: startLevel,
      });
    } catch (err) {
      console.error(err);
      finish({
        completed: false,
        earned: 0,
        stars: save.stars,
        correct,
        total: ROUND_LENGTH,
        gameId,
        sticker: null,
      });
    }
  })();
}

function playOne(ctx: PlayCtx, q: Question): Promise<Outcome> {
  if (q.type === 'count') return playCount(ctx, q);
  if (q.type === 'cart') return playCart(ctx, q);
  if (q.type === 'add') return playAdd(ctx, q);
  if (q.type === 'frog') return playFrog(ctx, q);
  return playPattern(ctx, q);
}
