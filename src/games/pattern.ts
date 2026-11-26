import { digitSvg } from '../art/digits';
import { beadSvg } from '../art/objects';
import type { BeadId } from '../content/beads';
import { lines, numCN } from '../content/lines';
import { delay } from '../core/delay';
import type { PatternQ } from '../core/question-gen';
import { el } from '../ui/dom';
import { celebrate, encourage } from './feedback';
import { createOutcome } from './outcome';
import type { Outcome } from './outcome';
import type { PlayCtx } from './types';
import { beadChoices, numberChoices } from './widgets';

export async function playPattern(ctx: PlayCtx, q: PatternQ): Promise<Outcome> {
  const out = createOutcome(ctx.signal);
  const numeric = q.mode === 'number';
  const answer = numeric ? String(q.answerNum) : String(q.answerBead);
  ctx.stage.dataset.answer = answer;
  ctx.stage.dataset.ready = '1';

  const row = el('div', 'pattern-row');
  const unit = q.mode === 'ab' ? 2 : 3;
  if (numeric) {
    q.numbers?.forEach((n) => {
      const item = el('div', 'pattern-num');
      item.innerHTML = digitSvg(n);
      row.append(item);
    });
  } else {
    q.beads?.forEach((id, i) => {
      const item = el('div', i % unit === 0 ? 'pattern-bead group-start' : 'pattern-bead');
      item.innerHTML = beadSvg(id);
      row.append(item);
    });
  }
  const socket = el('div', 'socket socket-lg');
  row.append(socket);
  ctx.stage.append(row);

  const line = numeric ? lines.patternNum : lines.pattern;
  ctx.setLine(line);
  ctx.speakNow(line);

  if (ctx.extraHint) row.classList.add('show-groups');

  let wrongs = 0;
  let busy = false;

  const buttons = numeric
    ? numberChoices(ctx.dock, q.choiceNums ?? [], (n, button) => {
        void onPick(String(n), button);
      })
    : beadChoices(ctx.dock, q.choiceBeads ?? [], (id, button) => {
        void onPick(id, button);
      });

  async function onPick(value: string, button: HTMLButtonElement) {
    if (busy || out.locked || ctx.signal.aborted) return;
    busy = true;
    if (value === answer) {
      out.mark(wrongs === 0);
      socket.classList.add('is-filled');
      socket.innerHTML = numeric ? digitSvg(q.answerNum ?? 0) : beadSvg(value as BeadId);
      await celebrate(ctx, button);
      out.close();
      return;
    }
    wrongs += 1;
    await encourage(ctx, button);
    row.classList.add('show-groups');
    const correct = buttons.find((b) => b.dataset.choice === answer);
    correct?.classList.add('is-hint');
    ctx.speak(lines.look);
    if (wrongs >= 2) {
      out.mark(false);
      socket.innerHTML = numeric ? digitSvg(q.answerNum ?? 0) : beadSvg((q.answerBead ?? 'a') as BeadId);
      ctx.setFace('cheer');
      ctx.audio.ok();
      if (numeric) ctx.speak(numCN(q.answerNum ?? 0));
      correct?.classList.add('is-right');
      await delay(800, ctx.signal);
      out.close();
      return;
    }
    if (!ctx.signal.aborted) busy = false;
  }

  return out.promise;
}
