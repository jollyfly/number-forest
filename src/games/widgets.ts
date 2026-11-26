import { digitSvg, opSvg } from '../art/digits';
import { beadSvg } from '../art/objects';
import type { BeadId } from '../content/beads';
import { numCN } from '../content/lines';
import { el } from '../ui/dom';

export function numberChoices(
  dock: HTMLElement,
  values: number[],
  onPick: (n: number, button: HTMLButtonElement) => void,
): HTMLButtonElement[] {
  dock.replaceChildren();
  const row = el('div', 'choice-row');
  dock.append(row);
  return values.map((n) => {
    const button = el('button', n >= 10 ? 'choice choice-wide' : 'choice');
    button.type = 'button';
    button.dataset.choice = String(n);
    button.setAttribute('aria-label', numCN(n));
    button.innerHTML = digitSvg(n);
    button.addEventListener('click', () => onPick(n, button));
    row.append(button);
    return button;
  });
}

export function beadChoices(
  dock: HTMLElement,
  ids: BeadId[],
  onPick: (id: BeadId, button: HTMLButtonElement) => void,
): HTMLButtonElement[] {
  dock.replaceChildren();
  const row = el('div', 'choice-row');
  dock.append(row);
  return ids.map((id) => {
    const button = el('button', 'choice choice-bead');
    button.type = 'button';
    button.dataset.choice = id;
    button.setAttribute('aria-label', id);
    button.innerHTML = beadSvg(id);
    button.addEventListener('click', () => onPick(id, button));
    row.append(button);
    return button;
  });
}

export function equationHtml(a: number, op: '+' | '-', b: number): string {
  return `<div class="eq-row">${digitSvg(a)}${opSvg(op)}${digitSvg(b)}${opSvg('=')}<div class="socket"></div></div>`;
}

export function tenFrameHtml(a: number, b: number): string {
  const cells = Array.from({ length: 10 }, (_, i) => {
    if (i < a) return `<div class="tf-cell"><span class="dot dot-a"></span></div>`;
    if (i < a + b) return `<div class="tf-cell"><span class="dot dot-b"></span></div>`;
    return `<div class="tf-cell"></div>`;
  }).join('');
  return `<div class="tenframe">${cells}</div>`;
}
