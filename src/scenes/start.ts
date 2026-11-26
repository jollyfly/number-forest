import { tuantuan } from '../art/characters';
import { cloudSvg } from '../art/objects';
import { playIcon } from '../art/icons';
import { lines } from '../content/lines';
import { getAudio } from '../core/audio';
import { onVoiceStatus, primeVoices, unlockVoice } from '../core/voice';
import { el } from '../ui/dom';

export function renderStart(root: HTMLElement, onStart: () => void): void {
  primeVoices();
  root.replaceChildren();
  const screen = el('div', 'screen start-screen sky-map');
  screen.dataset.screen = 'start';

  const cloudA = el('div', 'float-cloud cloud-a');
  cloudA.innerHTML = cloudSvg();
  const cloudB = el('div', 'float-cloud cloud-b');
  cloudB.innerHTML = cloudSvg();

  const sign = el('div', 'title-sign');
  sign.textContent = '数字森林';

  const hero = el('div', 'hero-panda');
  hero.innerHTML = tuantuan('happy', { wave: true });

  const button = el('button', 'start-btn');
  button.type = 'button';
  button.dataset.action = 'start';
  button.innerHTML = `<span class="play">${playIcon()}</span><span>开始</span>`;

  const note = el('p', 'voice-note');
  note.hidden = true;
  note.textContent = lines.noVoice;

  screen.append(cloudA, cloudB, sign, hero, button, note);
  root.append(screen);

  const off = onVoiceStatus((has) => {
    note.hidden = has !== false;
  });

  button.addEventListener('click', () => {
    off();
    getAudio().unlock();
    unlockVoice(lines.hello);
    onStart();
  });
}
