import { pineconeSvg, treeSvg } from '../art/objects';
import { lines, numCN } from '../content/lines';
import { delay } from '../core/delay';
import { PINE_SLOTS, scatterSlots, type CountQ } from '../core/question-gen';
import { el } from '../ui/dom';
import { celebrate, encourage } from './feedback';
import { createOutcome } from './outcome';
import type { Outcome } from './outcome';
import type { PlayCtx } from './types';
import { numberChoices } from './widgets';

export async function playCount(ctx: PlayCtx, q: CountQ): Promise<Outcome> {
  const out = createOutcome(ctx.signal);
  ctx.stage.dataset.answer = String(q.count);
  ctx.stage.dataset.ready = '0';

  const tree = el('div', 'tree-wrap');
  tree.innerHTML = treeSvg();
  const layer = el('div', 'pine-layer');
  ctx.stage.append(tree, layer);

  const slots = q.layout === 'scatter' ? scatterSlots(q.count, q.key) : PINE_SLOTS.slice(0, q.count);
  let counted = 0;
  const pines: HTMLButtonElement[] = [];

  slots.forEach((pos, i) => {
    const button = el('button', 'pine-btn');
    button.type = 'button';
    button.dataset.pine = String(i);
    button.style.left = `${pos.x}%`;
    button.style.top = `${pos.y}%`;
    button.setAttribute('aria-label', '松果');
    button.innerHTML = pineconeSvg();
    button.addEventListener('click', () => {
      if (out.locked || ctx.signal.aborted || button.dataset.counted === '1' || q.layout === 'flash') return;
      counted += 1;
      button.dataset.counted = '1';
      button.classList.add('is-counted');
      const badge = el('span', 'count-badge');
      badge.textContent = String(counted);
      button.append(badge);
      ctx.audio.pop();
      ctx.speak(numCN(counted));
    });
    layer.append(button);
    pines.push(button);
  });

  const line = q.layout === 'flash' ? lines.countAfterFlash : lines.count;
  ctx.setLine(line);
  let wrongs = 0;
  let busy = false;

  const buttons = numberChoices(ctx.dock, q.choices, (n, button) => {
    void onPick(n, button);
  });

  async function onPick(n: number, button: HTMLButtonElement) {
    if (busy || out.locked || ctx.signal.aborted || ctx.stage.dataset.ready !== '1') return;
    busy = true;
    if (n === q.count) {
      out.mark(wrongs === 0);
      await celebrate(ctx, button);
      out.close();
      return;
    }
    wrongs += 1;
    await encourage(ctx, button);
    const correct = buttons.find((b) => Number(b.dataset.choice) === q.count);
    correct?.classList.add('is-hint');
    if (q.layout === 'flash') {
      pines.forEach((p) => p.classList.remove('is-hidden'));
      await delay(1400, ctx.signal);
      if (wrongs < 2) pines.forEach((p) => p.classList.add('is-hidden'));
    } else {
      pines.forEach((p) => p.classList.add('hint-bob'));
      if (counted < q.count) ctx.speak(lines.recount);
    }
    if (wrongs >= 2) {
      out.mark(false);
      ctx.setFace('cheer');
      ctx.speak(numCN(q.count));
      ctx.audio.ok();
      correct?.classList.add('is-right');
      await delay(800, ctx.signal);
      out.close();
      return;
    }
    if (!ctx.signal.aborted) busy = false;
  }

  if (q.layout === 'flash') {
    buttons.forEach((b) => {
      b.disabled = true;
    });
    ctx.speakNow(lines.count);
    await delay(2000, ctx.signal);
    if (!ctx.signal.aborted) {
      pines.forEach((p) => p.classList.add('is-hidden'));
      buttons.forEach((b) => {
        b.disabled = false;
      });
      ctx.stage.dataset.ready = '1';
      ctx.speakNow(lines.countAfterFlash);
    }
  } else {
    ctx.stage.dataset.ready = '1';
    ctx.speakNow(lines.count);
    if (ctx.extraHint) {
      pines.forEach((p, i) => {
        p.style.animationDelay = `${i * 0.08}s`;
        p.classList.add('hint-bob');
      });
    }
  }

  return out.promise;
}
