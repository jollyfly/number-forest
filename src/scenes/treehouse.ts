import { tuantuan } from '../art/characters';
import { backIcon } from '../art/icons';
import { appleSvg, beadSvg, lilySvg, pineconeSvg, starFruitSvg, treehouseSvg } from '../art/objects';
import { lines } from '../content/lines';
import { treeTier } from '../core/adaptive';
import { getAudio } from '../core/audio';
import { GAME_IDS, type GameId } from '../core/question-gen';
import { loadSave } from '../core/progress';
import { speakNow } from '../core/voice';
import { el } from '../ui/dom';

const ICONS: Record<GameId, string> = {
  count: pineconeSvg(),
  cart: pineconeSvg(),
  add: appleSvg(),
  frog: lilySvg(),
  pattern: beadSvg('c'),
};

export function renderTreehouse(root: HTMLElement, onBack: () => void): void {
  const save = loadSave();
  const tier = treeTier(save.stars);
  root.replaceChildren();
  const screen = el('div', 'screen tree-screen sky-map');
  screen.dataset.screen = 'tree';
  screen.dataset.tier = String(tier);

  const top = el('header', 'topbar');
  const back = el('button', 'round-btn');
  back.type = 'button';
  back.dataset.action = 'back';
  back.setAttribute('aria-label', '回到森林');
  back.innerHTML = backIcon();
  const panda = el('div', 'mascot-btn');
  panda.innerHTML = tuantuan('happy');
  const spacer = el('div', 'top-spacer');
  const stars = el('div', 'star-pill');
  stars.dataset.stars = String(save.stars);
  stars.innerHTML = `${starFruitSvg()}<span>${save.stars}</span>`;
  top.append(back, panda, spacer, stars);

  const house = el('div', 'tree-hero');
  house.innerHTML = treehouseSvg(tier);

  const board = el('div', 'sticker-board');
  for (const id of GAME_IDS) {
    const card = el('div', 'sticker-card');
    card.innerHTML = ICONS[id];
    const row = el('div', 'sticker-pips');
    for (let level = 1; level <= 4; level++) {
      const pip = el('span', save.games[id].stickers.includes(level as 1 | 2 | 3 | 4) ? 'sticker is-on' : 'sticker');
      row.append(pip);
    }
    card.append(row);
    board.append(card);
  }

  screen.append(top, house, board);
  root.append(screen);
  speakNow(lines.treehouse);

  back.addEventListener('click', () => {
    getAudio().pop();
    onBack();
  });
}
