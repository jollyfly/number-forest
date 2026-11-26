import { tuantuan } from '../art/characters';
import { homeIcon } from '../art/icons';
import { starFruitSvg, treehouseSvg } from '../art/objects';
import { lines } from '../content/lines';
import { treeTier } from '../core/adaptive';
import { getAudio } from '../core/audio';
import type { Level } from '../core/question-gen';
import { loadSave } from '../core/progress';
import { speakNow } from '../core/voice';
import type { RoundEnd } from '../games/run';
import { el } from '../ui/dom';

const STICKER_COUNT = 4;

export function renderReward(root: HTMLElement, result: RoundEnd, onDone: () => void): void {
  root.replaceChildren();
  const screen = el('div', 'screen reward-screen sky-map');
  screen.dataset.screen = 'reward';
  screen.dataset.earned = String(result.earned);

  const panda = el('div', 'reward-panda');
  panda.innerHTML = tuantuan('wow');

  const stars = el('div', 'star-row');
  for (let i = 0; i < result.earned; i++) {
    const fruit = el('div', 'star-pop');
    fruit.style.animationDelay = `${i * 0.18}s`;
    fruit.innerHTML = starFruitSvg();
    stars.append(fruit);
  }

  const house = el('div', 'reward-house');
  house.innerHTML = treehouseSvg(treeTier(result.stars));

  const owned = new Set(loadSave().games[result.gameId].stickers);
  const stickers = el('div', 'sticker-row');
  for (let level = 1; level <= STICKER_COUNT; level++) {
    const got = owned.has(level as Level);
    const pip = el('span', got ? (result.sticker === level ? 'sticker is-new' : 'sticker is-on') : 'sticker');
    pip.dataset.level = String(level);
    stickers.append(pip);
  }

  const total = el('div', 'star-pill reward-total');
  total.dataset.stars = String(result.stars);
  total.innerHTML = `${starFruitSvg()}<span>${result.stars}</span>`;

  const done = el('button', 'home-btn');
  done.type = 'button';
  done.dataset.action = 'done';
  done.setAttribute('aria-label', '回到森林');
  done.innerHTML = homeIcon();

  screen.append(panda, stars, house, stickers, total, done);
  root.append(screen);

  speakNow(lines.reward(result.earned));
  getAudio().star();

  done.addEventListener('click', () => {
    getAudio().pop();
    onDone();
  });
}
