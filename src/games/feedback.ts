import { linePraise, lines } from '../content/lines';
import { delay } from '../core/delay';
import type { PlayCtx } from './types';

export function sparkles(anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = `${rect.left + rect.width / 2}px`;
    spark.style.top = `${rect.top + rect.height / 2}px`;
    const ang = (i / 8) * Math.PI * 2;
    spark.style.setProperty('--dx', `${Math.cos(ang) * 54}px`);
    spark.style.setProperty('--dy', `${Math.sin(ang) * 46}px`);
    document.body.append(spark);
    window.setTimeout(() => spark.remove(), 700);
  }
}

export async function celebrate(ctx: PlayCtx, anchor?: HTMLElement): Promise<void> {
  ctx.audio.ok();
  ctx.setFace('cheer');
  ctx.speak(linePraise());
  anchor?.classList.add('is-right');
  if (anchor) sparkles(anchor);
  await delay(680, ctx.signal);
}

export async function encourage(ctx: PlayCtx, anchor?: HTMLElement): Promise<void> {
  ctx.audio.oops();
  ctx.setFace('think');
  ctx.speakNow(lines.tryAgain);
  if (anchor) {
    anchor.classList.add('wiggle');
    window.setTimeout(() => anchor.classList.remove('wiggle'), 450);
  }
  await delay(320, ctx.signal);
}
