import { appleSvg, basketSvg } from '../art/objects';
import { lines, numCN } from '../content/lines';
import { delay } from '../core/delay';
import type { AddQ } from '../core/question-gen';
import { el } from '../ui/dom';
import { celebrate, encourage } from './feedback';
import { createOutcome } from './outcome';
import type { Outcome } from './outcome';
import type { PlayCtx } from './types';
import { equationHtml, numberChoices, tenFrameHtml } from './widgets';

export async function playAdd(ctx: PlayCtx, q: AddQ): Promise<Outcome> {
  const out = createOutcome(ctx.signal);
  ctx.stage.dataset.answer = String(q.answer);
  ctx.stage.dataset.ready = '0';

  const board = el('div', 'add-board');
  if (q.presentation === 'apples') {
    const row = el('div', 'apple-row');
    const groupA = el('div', 'cluster');
    const plus = el('div', 'plus-bubble');
    plus.innerHTML = '<span>+</span>';
    const groupB = el('div', 'cluster cluster-b');
    for (let i = 0; i < q.a; i++) groupA.append(appleButton(ctx, i));
    for (let i = 0; i < q.b; i++) groupB.append(appleButton(ctx, q.a + i));
    row.append(groupA, plus, groupB);
    const basket = el('div', 'basket-back');
    basket.innerHTML = basketSvg();
    board.append(row, basket);
  } else if (q.presentation === 'equation') {
    board.innerHTML = `<div class="eq-wrap eq-large">${equationHtml(q.a, '+', q.b)}</div><div class="hint-frame" hidden></div>`;
  } else {
    board.innerHTML = tenFrameHtml(q.a, q.b);
    if (q.presentation === 'tenframe-eq') {
      const eq = el('div', 'eq-wrap');
      eq.innerHTML = equationHtml(q.a, '+', q.b);
      board.append(eq);
    }
  }
  ctx.stage.append(board);

  const line = lines.add(q.a, q.b);
  ctx.setLine(line);

  if (q.presentation === 'equation') {
    ctx.setOnSpeak(() => {
      ctx.speakNow(line);
      const frame = board.querySelector<HTMLElement>('.hint-frame');
      if (!frame) return;
      frame.hidden = false;
      frame.innerHTML = tenFrameHtml(q.a, q.b);
      window.setTimeout(() => {
        frame.hidden = true;
      }, 2200);
    });
  }

  let wrongs = 0;
  let busy = false;
  const buttons = numberChoices(ctx.dock, q.choices, (n, button) => {
    void onPick(n, button);
  });
  buttons.forEach((b) => {
    b.disabled = true;
  });

  async function onPick(n: number, button: HTMLButtonElement) {
    if (busy || out.locked || ctx.signal.aborted || ctx.stage.dataset.ready !== '1') return;
    busy = true;
    if (n === q.answer) {
      out.mark(wrongs === 0);
      await celebrate(ctx, button);
      out.close();
      return;
    }
    wrongs += 1;
    await encourage(ctx, button);
    const correct = buttons.find((b) => Number(b.dataset.choice) === q.answer);
    correct?.classList.add('is-hint');
    board.classList.add('hint-bob');
    ctx.speak(lines.look);
    if (q.presentation === 'apples') {
      const apples = [...board.querySelectorAll<HTMLButtonElement>('.apple-btn')];
      for (let i = 0; i < apples.length; i++) {
        apples[i]!.classList.add('is-counted');
        ctx.speak(numCN(i + 1));
        await delay(180, ctx.signal);
      }
    }
    if (wrongs >= 2) {
      out.mark(false);
      ctx.setFace('cheer');
      ctx.audio.ok();
      ctx.speak(numCN(q.answer));
      correct?.classList.add('is-right');
      await delay(800, ctx.signal);
      out.close();
      return;
    }
    if (!ctx.signal.aborted) busy = false;
  }

  ctx.speakNow(line);
  await delay(q.presentation === 'apples' ? 700 : 350, ctx.signal);
  if (!ctx.signal.aborted) {
    buttons.forEach((b) => {
      b.disabled = false;
    });
    ctx.stage.dataset.ready = '1';
    board.classList.add('is-in');
  }

  return out.promise;
}

function appleButton(ctx: PlayCtx, index: number): HTMLButtonElement {
  const button = el('button', 'apple-btn');
  button.type = 'button';
  button.dataset.apple = String(index);
  button.setAttribute('aria-label', '苹果');
  button.innerHTML = appleSvg();
  button.addEventListener('click', () => {
    const all = [...button.parentElement!.parentElement!.querySelectorAll<HTMLButtonElement>('.apple-btn')];
    const order = all.filter((a) => a.dataset.counted === '1').length + 1;
    if (button.dataset.counted === '1') return;
    button.dataset.counted = '1';
    button.classList.add('is-counted');
    const badge = document.createElement('span');
    badge.className = 'count-badge';
    badge.textContent = String(order);
    button.append(badge);
    ctx.audio.pop();
    ctx.speak(numCN(order));
  });
  return button;
}
