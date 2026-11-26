import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(file, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

function draw(size, { padding = 0, round = 0.22 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const px = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    const oa = rgba[i + 3] / 255;
    const na = a / 255;
    const out = na + oa * (1 - na);
    if (out <= 0) return;
    rgba[i] = Math.round((r * na + rgba[i] * oa * (1 - na)) / out);
    rgba[i + 1] = Math.round((g * na + rgba[i + 1] * oa * (1 - na)) / out);
    rgba[i + 2] = Math.round((b * na + rgba[i + 2] * oa * (1 - na)) / out);
    rgba[i + 3] = Math.round(out * 255);
  };
  const fill = (fn) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) fn(x + 0.5, y + 0.5, (c) => px(x, y, ...c));
    }
  };
  const circle = (cx, cy, rad, color) => {
    fill((x, y, put) => {
      const d = Math.hypot(x - cx, y - cy) - rad;
      if (d < -0.8) put(color);
      else if (d < 0.8) put([...color.slice(0, 3), Math.round(color[3] * (0.8 - d) / 1.6)]);
    });
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    fill((x, y, put) => {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry) - 1;
      const aa = 1.2 / Math.min(rx, ry);
      if (d < -aa) put(color);
      else if (d < aa) put([...color.slice(0, 3), Math.round((color[3] ?? 255) * (aa - d) / (2 * aa))]);
    });
  };

  const s = size;
  const bg = [125, 204, 104, 255];
  const ink = [44, 58, 46, 255];
  const fur = [225, 91, 58, 255];
  const cream = [255, 246, 234, 255];
  const radius = s * round;
  fill((x, y, put) => {
    const x0 = padding;
    const y0 = padding;
    const x1 = s - padding;
    const y1 = s - padding;
    const cx = Math.min(Math.max(x, x0 + radius), x1 - radius);
    const cy = Math.min(Math.max(y, y0 + radius), y1 - radius);
    if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) put(bg);
  });

  const face = s * 0.28;
  circle(s * 0.3, s * 0.34, s * 0.12, fur);
  circle(s * 0.7, s * 0.34, s * 0.12, fur);
  circle(s * 0.3, s * 0.36, s * 0.06, [246, 199, 180, 255]);
  circle(s * 0.7, s * 0.36, s * 0.06, [246, 199, 180, 255]);
  circle(s * 0.5, s * 0.56, face, fur);
  ellipse(s * 0.5, s * 0.62, face * 0.62, face * 0.5, cream);
  circle(s * 0.4, s * 0.54, s * 0.045, ink);
  circle(s * 0.6, s * 0.54, s * 0.045, ink);
  circle(s * 0.412, s * 0.528, s * 0.015, [255, 255, 255, 255]);
  circle(s * 0.612, s * 0.528, s * 0.015, [255, 255, 255, 255]);
  ellipse(s * 0.5, s * 0.62, s * 0.035, s * 0.025, ink);
  return rgba;
}

const sizes = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['apple-touch-icon.png', 180, {}],
  ['icon-maskable-512.png', 512, { padding: 54, round: 0 }],
];

for (const [name, size, opts] of sizes) {
  writePng(path.join(outDir, name), size, size, draw(size, opts));
  console.log('wrote', name);
}
