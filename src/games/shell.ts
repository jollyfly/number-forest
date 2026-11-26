import { tuantuan, type Expr } from '../art/characters';
import { starFruitSvg } from '../art/objects';
import { backIcon, speakerIcon } from '../art/icons';
import { getAudio } from '../core/audio';
import type { GameId } from '../core/question-gen';
import { speak, speakNow } from '../core/voice';
import { el } from '../ui/dom';
import type { PlayCtx } from './types';

export interface Shell {
  signal: AbortSignal;
  abort: () => void;
  setFace: (expr: Expr) => void;
  setStars: (n: number) => void;
  setPip: (index: number, total: number) => void;
  prepare: () => void;
  ctx: (extraHint: boolean) => PlayCtx;
}

export function mountShell(
  root: HTMLElement,
  opts: { gameId: GameId; stars: number; onBack: () => void },
): Shell {
  const audio = getAudio();
  const controller = new AbortController();
  root.replaceChildren();

  const screen = el('div', `screen game-screen sky-${opts.gameId}`);
  screen.dataset.screen = 'game';
  screen.dataset.game = opts.gameId;

  const top = el('header', 'topbar');
  const back = el('button', 'round-btn');
  back.type = 'button';
  back.dataset.action = 'back';
  back.setAttribute('aria-label', '回到森林');
  back.innerHTML = backIcon();

  const mascot = el('button', 'mascot-btn');
  mascot.type = 'button';
  mascot.setAttribute('aria-label', '团团');
  const pips = el('div', 'pips');
  pips.dataset.pips = '1';
  const stars = el('div', 'star-pill');
  stars.dataset.stars = String(opts.stars);
  const speaker = el('button', 'round-btn speaker');
  speaker.type = 'button';
  speaker.dataset.action = 'speak';
  speaker.setAttribute('aria-label', '再听一遍');
  speaker.innerHTML = speakerIcon();

  top.append(back, mascot, pips, stars, speaker);

  const stage = el('main', 'stage');
  stage.dataset.stage = opts.gameId;
  const dock = el('footer', 'dock');

  screen.append(top, stage, dock);
  root.append(screen);

  let line = '';
  let onSpeak: () => void = () => {
    if (line) speakNow(line);
  };
  let face: Expr = 'happy';

  const paintFace = () => {
    mascot.innerHTML = tuantuan(face);
  };
  const paintStars = (n: number) => {
    stars.dataset.stars = String(n);
    stars.innerHTML = `${starFruitSvg()}<span>${n}</span>`;
    stars.setAttribute('aria-label', `${n} 颗星星果`);
  };

  paintFace();
  paintStars(opts.stars);

  const setFace = (expr: Expr) => {
    face = expr;
    paintFace();
  };
  const setLine = (next: string) => {
    line = next;
  };
  const setOnSpeak = (fn: (() => void) | null) => {
    onSpeak = fn ?? (() => {
      if (line) speakNow(line);
    });
  };

  back.addEventListener('click', () => {
    audio.pop();
    opts.onBack();
  });
  speaker.addEventListener('click', () => {
    audio.pop();
    onSpeak();
  });
  mascot.addEventListener('click', () => {
    audio.pop();
    onSpeak();
  });

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    setFace,
    setStars: paintStars,
    setPip(index, total) {
      pips.dataset.index = String(index);
      pips.replaceChildren();
      for (let i = 0; i < total; i++) {
        const pip = el('span', i < index ? 'pip is-done' : i === index ? 'pip is-now' : 'pip');
        pips.append(pip);
      }
    },
    prepare() {
      stage.replaceChildren();
      dock.replaceChildren();
      setOnSpeak(null);
      setFace('happy');
    },
    ctx(extraHint: boolean): PlayCtx {
      return {
        stage,
        dock,
        signal: controller.signal,
        setFace,
        setLine,
        speak,
        speakNow: (text) => {
          line = text;
          speakNow(text);
        },
        audio,
        extraHint,
        setOnSpeak,
      };
    },
  };
}
