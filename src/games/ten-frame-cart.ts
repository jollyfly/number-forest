import { digitSvg } from '../art/digits';
import { checkIcon } from '../art/icons';
import { pineconeSvg } from '../art/objects';
import { lines, numCN } from '../content/lines';
import { delay } from '../core/delay';
import type { CartQ } from '../core/question-gen';
import { el } from '../ui/dom';
import { bindTapDrag, nearestCenter } from '../ui/pointer';
import { celebrate, encourage } from './feedback';
import { createOutcome } from './outcome';
import type { Outcome } from './outcome';
import type { PlayCtx } from './types';

export async function playCart(ctx: PlayCtx, q: CartQ): Promise<Outcome> {
  const out = createOutcome(ctx.signal);
  const pool = q.frame === 5 ? 8 : 12;
  const cells: (number | null)[] = Array.from({ length: q.frame }, () => null);

  ctx.stage.dataset.answer = String(q.target);
  ctx.stage.dataset.ready = '1';

  const layout = el('div', 'cart-layout');
  const task = el('div', 'task-card');
  task.innerHTML = taskArt(q);
  const wagon = el('div', 'wagon');
  const bed = el('div', q.frame === 5 ? 'bed bed-5' : 'bed bed-10');
  bed.dataset.bed = '1';
  const wheels = el('div', 'wheels');
  wheels.innerHTML = `<span class="wheel"></span><span class="wheel"></span>`;
  wagon.append(bed, wheels);
  const pile = el('div', 'pile');
  pile.dataset.pile = '1';
  const check = el('button', 'check-btn');
  check.type = 'button';
  check.dataset.action = 'check';
  check.setAttribute('aria-label', '装好了');
  check.innerHTML = checkIcon();

  layout.append(task, wagon, pile, check);
  ctx.stage.append(layout);

  const line = lines.cart(q.target);
  ctx.setLine(line);
  ctx.speakNow(line);

  let wrongs = 0;
  let busy = false;
  let revealGoal = ctx.extraHint;

  const render = () => {
    bed.replaceChildren();
    cells.forEach((id, index) => {
      const cell = el('div', 'cell');
      cell.dataset.cell = String(index);
      if (revealGoal && index < q.target) cell.classList.add('is-hint');
      if (id !== null) {
        const pine = el('button', 'pine-btn in-cell');
        pine.type = 'button';
        pine.dataset.pine = String(id);
        pine.innerHTML = pineconeSvg();
        pine.setAttribute('aria-label', '拿下松果');
        bindTapDrag(pine, {
          onTap: () => {
            if (busy || out.locked) return;
            cells[index] = null;
            ctx.audio.pop();
            render();
          },
          onDrop: (x, y) => {
            if (busy || out.locked) return;
            const dest = nearestCenter(x, y, [...bed.querySelectorAll<HTMLElement>('.cell')]);
            cells[index] = null;
            if (dest) {
              const di = Number(dest.dataset.cell);
              if (cells[di] == null) cells[di] = id;
              else cells[index] = id;
            }
            ctx.audio.place();
            render();
          },
        });
        cell.append(pine);
      }
      bed.append(cell);
    });

    pile.replaceChildren();
    const used = new Set(cells.filter((id): id is number => id !== null));
    for (let id = 0; id < pool; id++) {
      if (used.has(id)) continue;
      const pine = el('button', 'pine-btn');
      pine.type = 'button';
      pine.dataset.pine = String(id);
      pine.dataset.source = '1';
      pine.innerHTML = pineconeSvg();
      pine.setAttribute('aria-label', '松果');
      bindTapDrag(pine, {
        onTap: () => {
          if (busy || out.locked) return;
          const empty = cells.findIndex((c) => c == null);
          if (empty < 0) return;
          cells[empty] = id;
          ctx.audio.place();
          render();
        },
        onDrop: (x, y) => {
          if (busy || out.locked) return;
          const dest = nearestCenter(x, y, [...bed.querySelectorAll<HTMLElement>('.cell')]);
          if (!dest) return;
          const di = Number(dest.dataset.cell);
          if (cells[di] != null) return;
          cells[di] = id;
          ctx.audio.place();
          render();
        },
      });
      pile.append(pine);
    }
    const filled = cells.filter((cell) => cell != null).length;
    check.classList.toggle('is-ready', filled === q.target);
  };

  render();

  check.addEventListener('click', () => {
    void onCheck();
  });

  async function onCheck() {
    if (busy || out.locked) return;
    const filled = cells.filter((c) => c != null).length;
    if (filled === q.target) {
      busy = true;
      out.mark(wrongs === 0);
      await celebrate(ctx, check);
      out.close();
      return;
    }
    busy = true;
    wrongs += 1;
    await encourage(ctx, check);
    ctx.speak(filled < q.target ? lines.cartMore : lines.cartLess);
    revealGoal = true;
    render();
    task.classList.add('is-hint');
    if (wrongs >= 2) {
      for (let i = 0; i < cells.length; i++) cells[i] = i < q.target ? i : null;
      render();
      bed.querySelectorAll('.cell').forEach((cell, index) => {
        if (index < q.target) cell.classList.add('is-right');
      });
      ctx.setFace('cheer');
      ctx.speak(numCN(q.target));
      ctx.audio.ok();
      out.mark(false);
      await delay(800, ctx.signal);
      out.close();
      return;
    }
    if (!ctx.signal.aborted) busy = false;
  }

  return out.promise;
}

function taskArt(q: CartQ): string {
  const digit = `<div class="task-digit">${digitSvg(q.target)}</div>`;
  if (q.mode === 'picture') {
    const pines = Array.from({ length: q.target }, () => `<span class="mini-pine">${pineconeSvg()}</span>`).join('');
    return `<div class="task-picture">${pines}</div>${digit}`;
  }
  if (q.mode === 'dots') {
    const dots = Array.from({ length: 10 }, (_, i) =>
      `<span class="${i < q.target ? 'mini-dot is-on' : 'mini-dot'}"></span>`,
    ).join('');
    return `<div class="mini-dots">${dots}</div>${digit}`;
  }
  return `<div class="task-digit task-digit-big">${digitSvg(q.target)}</div>`;
}
