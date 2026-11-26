export function bindTapDrag(
  target: HTMLElement,
  opts: {
    onTap: () => void;
    onDrop: (x: number, y: number) => void;
  },
): void {
  let pid = -1;
  let sx = 0;
  let sy = 0;
  let dragging = false;
  let suppressClick = false;
  let ghost: HTMLElement | null = null;

  const clearGhost = () => {
    if (ghost) {
      ghost.remove();
      ghost = null;
    }
    target.style.visibility = '';
  };

  target.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pid = e.pointerId;
    sx = e.clientX;
    sy = e.clientY;
    dragging = false;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* some browsers reject capture; click still handles the tap */
    }
  });

  target.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (!dragging && dx * dx + dy * dy > 144) {
      dragging = true;
      suppressClick = true;
      ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.margin = '0';
      ghost.style.width = `${target.offsetWidth}px`;
      ghost.style.height = `${target.offsetHeight}px`;
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '80';
      ghost.style.opacity = '0.92';
      document.body.append(ghost);
      target.style.visibility = 'hidden';
    }
    if (ghost) {
      ghost.style.left = `${e.clientX - target.offsetWidth / 2}px`;
      ghost.style.top = `${e.clientY - target.offsetHeight / 2}px`;
    }
  });

  target.addEventListener('pointerup', (e) => {
    if (e.pointerId !== pid) return;
    const wasDrag = dragging;
    const x = e.clientX;
    const y = e.clientY;
    pid = -1;
    dragging = false;
    clearGhost();
    if (wasDrag) opts.onDrop(x, y);
  });

  target.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== pid) return;
    pid = -1;
    dragging = false;
    suppressClick = true;
    clearGhost();
  });

  target.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    opts.onTap();
  });
}

export function nearestCenter(
  x: number,
  y: number,
  nodes: HTMLElement[],
  slopScale = 0.85,
): HTMLElement | null {
  let best: HTMLElement | null = null;
  let bestD = Infinity;
  for (const node of nodes) {
    const r = node.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const d = Math.hypot(x - cx, y - cy);
    const limit = Math.max(r.width, r.height) * slopScale;
    if (d <= limit && d < bestD) {
      best = node;
      bestD = d;
    }
  }
  return best;
}
