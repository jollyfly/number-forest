import { frog, owl, squirrel, tuantuan } from '../art/characters';
import { speakerIcon } from '../art/icons';
import { appleSvg, basketSvg, cloudSvg, lilySvg, pineconeSvg, starFruitSvg, treehouseSvg } from '../art/objects';
import { lines } from '../content/lines';
import { treeTier } from '../core/adaptive';
import { getAudio } from '../core/audio';
import type { GameId } from '../core/question-gen';
import { loadSave } from '../core/progress';
import { speak } from '../core/voice';
import { el } from '../ui/dom';

export function renderMap(
  root: HTMLElement,
  handlers: { onGame: (id: GameId) => void; onHome: () => void },
): void {
  const save = loadSave();
  root.replaceChildren();
  const screen = el('div', 'screen map-screen sky-map');
  screen.dataset.screen = 'map';

  const top = el('header', 'topbar');
  const mascot = el('button', 'mascot-btn');
  mascot.type = 'button';
  mascot.setAttribute('aria-label', '团团');
  mascot.innerHTML = tuantuan('happy');
  const spacer = el('div', 'top-spacer');
  const stars = el('div', 'star-pill');
  stars.dataset.stars = String(save.stars);
  stars.innerHTML = `${starFruitSvg()}<span>${save.stars}</span>`;
  stars.setAttribute('aria-label', `${save.stars} 颗星星果`);
  const speaker = el('button', 'round-btn speaker');
  speaker.type = 'button';
  speaker.dataset.action = 'speak';
  speaker.setAttribute('aria-label', '再听一遍');
  speaker.innerHTML = speakerIcon();
  top.append(mascot, spacer, stars, speaker);

  const scroll = el('div', 'map-scroll');
  const row = el('div', 'map-row');

  const home = clearing('clearing-home', '');
  home.append(spot('treehouse', treehouseSvg(treeTier(save.stars)), '树屋', '团团的树屋', true));
  const pines = clearing('clearing-pines', '<div class="bush bush-a"></div><div class="bush bush-b"></div>');
  pines.append(
    spot('count', `${squirrel()}${mini(pineconeSvg())}`, '数松果', '数松果'),
    spot('cart', wagonArt(), '装松果', '装松果车'),
  );
  const orchard = clearing('clearing-orchard', '<div class="bush bush-c"></div>');
  orchard.append(spot('add', `${basketSvg()}${mini(appleSvg())}`, '果篮', '果篮加法'));
  const pond = clearing('clearing-pond', '<div class="pond-water"></div>');
  pond.append(spot('frog', `${lilySvg()}${frog()}`, '荷叶', '呱呱跳荷叶'));
  const tower = clearing('clearing-tower', '<div class="tower"></div>');
  tower.append(spot('pattern', owl(), '找规律', '找规律'));

  row.append(home, pines, orchard, pond, tower);
  scroll.append(row);

  const cloudA = el('div', 'float-cloud cloud-a');
  cloudA.innerHTML = cloudSvg();
  const cloudB = el('div', 'float-cloud cloud-b');
  cloudB.innerHTML = cloudSvg();

  const hint = el('div', 'scroll-hint');
  hint.setAttribute('aria-hidden', 'true');
  hint.textContent = '›';

  screen.append(cloudA, cloudB, top, scroll, hint);
  root.append(screen);

  const audio = getAudio();
  const say = () => {
    audio.pop();
    speak(lines.map);
  };
  speaker.addEventListener('click', say);
  mascot.addEventListener('click', say);
  speak(lines.map);

  scroll.addEventListener('scroll', () => {
    hint.hidden = scroll.scrollLeft > 24;
  });

  screen.querySelectorAll<HTMLButtonElement>('.spot').forEach((button) => {
    button.addEventListener('click', () => {
      audio.pop();
      const game = button.dataset.game;
      if (game === 'treehouse') handlers.onHome();
      else if (game) handlers.onGame(game as GameId);
    });
  });
}

function clearing(className: string, scenery: string): HTMLElement {
  const node = el('section', `clearing ${className}`);
  if (scenery) {
    const bg = el('div', 'scenery');
    bg.innerHTML = scenery;
    node.append(bg);
  }
  return node;
}

function spot(id: string, art: string, label: string, aria: string, home = false): HTMLButtonElement {
  const button = el('button', home ? 'spot tree-spot' : 'spot');
  button.type = 'button';
  button.dataset.game = id;
  if (id === 'treehouse') button.dataset.action = 'treehouse';
  button.setAttribute('aria-label', aria);
  button.innerHTML = `<div class="spot-art">${art}</div><span class="spot-cap">${label}</span>`;
  return button;
}

function mini(inner: string): string {
  return `<div class="spot-badge">${inner}</div>`;
}

function wagonArt(): string {
  return `<div class="mini-wagon"><div class="mini-bed"></div><div class="mini-wheels"><i></i><i></i></div></div>${mini(pineconeSvg())}`;
}
