/** Each bead pairs a color with a unique shape so patterns are not color-only. */
export const BEADS = [
  { id: 'a', shape: 'circle', fill: '#ff5d6c', label: '圆' },
  { id: 'b', shape: 'squircle', fill: '#3aa0e8', label: '方' },
  { id: 'c', shape: 'triangle', fill: '#ffc53d', label: '三角' },
  { id: 'd', shape: 'star', fill: '#5cbf6a', label: '星' },
  { id: 'e', shape: 'diamond', fill: '#b07be0', label: '菱形' },
] as const;

export type BeadId = (typeof BEADS)[number]['id'];
export type BeadShape = (typeof BEADS)[number]['shape'];

export function beadById(id: BeadId) {
  return BEADS.find((b) => b.id === id)!;
}

export const BEAD_IDS: BeadId[] = BEADS.map((b) => b.id);
