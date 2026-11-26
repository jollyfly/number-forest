import { frog } from '../art/characters';
import { arrowSvg, digitSvg } from '../art/digits';
import { lilySvg } from '../art/objects';
import { lines, numCN } from '../content/lines';
import { delay } from '../core/delay';
import type { FrogQ } from '../core/question-gen';
import { el } from '../ui/dom';
import { celebrate, encourage } from './feedback';
import { createOutcome } from './outcome';
import type { Outcome } from './outcome';
import type { PlayCtx } from './types';
import { equationHtml } from './widgets';

export async function playFrog(ctx: PlayCtx, q: FrogQ): Promise<Outcome> {
  const out = createOutcome(ctx.signal);
  ctx.stage.dataset.answer = String(q.answer);
  ctx.stage.dataset.ready = '0';

  const layout = el('div', 'frog-layout');
  const task = el('div', 'hop-task');
  if (q.showEquation) {
    task.innerHTML = equationHtml(q.start, q.delta > 0 ? '+' : '-', Math.abs(q.delta));
  }
  if (!q.showEquation || ctx.extraHint) {
    task.append(hopMarks(q.delta));
  }

  const scroller = el('div', 'pad-scroll');
  const pads = el('div', 'pads');
  for (let n = 0; n <= 10; n++) {
    const pad = el('button', 'pad');
    pad.type = 'button';
    pad.dataset.pad = String(n);
    pad.setAttribute('aria-label', numCN(n));
    pad.innerHTML = `<span class="pad-art">${lilySvg()}</span><span class="pad-num">${digitSvg(n)}</span>`;
    if (n === q.start) pad.classList.add('is-start');
    pads.append(pad);
  }
  const frogEl = el('div', 'frog-piece');
  frogEl.innerHTML = frog();
  pads.append(frogEl);
  scroller.append(pads);
  layout.append(task, scroller);
  ctx.stage.append(layout);

  let current = q.start;
  const place = (animate: boolean) => {
    const pad = pads.querySelector<HTMLElement>(`[data-pad="${current}"]`);
    if (!pad) return;
    if (!animate) frogEl.style.transition = 'none';
    frogEl.style.left = `${pad.offsetLeft + pad.offsetWidth / 2 - frogEl.offsetWidth / 2}px`;
    pad.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
    if (!animate) {
      void frogEl.offsetWidth;
      frogEl.style.transition = '';
    }
  };
  const onResize = () => place(false);
  window.addEventListener('resize', onResize);
  ctx.signal.addEventListener('abort', () => window.removeEventListener('resize', onResize));

  place(false);
  ctx.stage.dataset.ready = '1';

  const line = frogLine(q);
  ctx.setLine(line);
  ctx.speakNow(line);

  let wrongs = 0;
  let busy = false;

  pads.querySelectorAll<HTMLButtonElement>('.pad').forEach((pad) => {
    pad.addEventListener('click', () => {
      void onPad(Number(pad.dataset.pad));
    });
  });

  async function hop(to: number) {
    const step = to > current ? 1 : -1;
    while (current !== to && !ctx.signal.aborted) {
      current += step;
      place(true);
      frogEl.classList.remove('is-hop');
      void frogEl.offsetWidth;
      frogEl.classList.add('is-hop');
      ctx.audio.hop();
      await delay(200, ctx.signal);
    }
  }

  function showPath() {
    pads.querySelectorAll('.pad').forEach((pad) => {
      const n = Number((pad as HTMLElement).dataset.pad);
      const lo = Math.min(q.start, q.answer);
      const hi = Math.max(q.start, q.answer);
      if (n >= lo && n <= hi) pad.classList.add('is-hint');
    });
  }

  async function onPad(dest: number) {
    if (busy || out.locked || ctx.signal.aborted || ctx.stage.dataset.ready !== '1') return;
    if (dest === current) return;
    busy = true;
    await hop(dest);
    if (ctx.signal.aborted) return;
    if (current === q.answer) {
      out.mark(wrongs === 0);
      const pad = pads.querySelector<HTMLElement>(`[data-pad="${q.answer}"]`) ?? undefined;
      await celebrate(ctx, pad);
      out.close();
      return;
    }
    wrongs += 1;
    ctx.setFace('think');
    await encourage(ctx);
    await hop(q.start);
    showPath();
    if (!task.querySelector('.hop-arrows')) task.append(hopMarks(q.delta));
    if (wrongs >= 2) {
      await hop(q.answer);
      out.mark(false);
      ctx.setFace('cheer');
      ctx.audio.ok();
      ctx.speak(numCN(q.answer));
      await delay(700, ctx.signal);
      out.close();
      return;
    }
    if (!ctx.signal.aborted) busy = false;
  }

  return out.promise;
}

function hopMarks(delta: number): HTMLElement {
  const arrows = el('div', 'hop-arrows');
  const dir = delta > 0 ? 'right' : 'left';
  for (let i = 0; i < Math.abs(delta); i++) {
    const chip = el('span', 'hop-chip');
    chip.innerHTML = arrowSvg(dir);
    arrows.append(chip);
  }
  return arrows;
}

function frogLine(q: FrogQ): string {
  if (q.showEquation) {
    return q.delta > 0 ? lines.frogAdd(q.start, q.delta) : lines.frogSub(q.start, -q.delta);
  }
  return q.delta > 0 ? lines.frogForward(q.start, q.delta) : lines.frogBack(q.start, -q.delta);
}
