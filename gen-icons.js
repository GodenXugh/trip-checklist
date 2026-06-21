// Generates suitcase PWA icons (no external deps) using raw PNG + zlib.
const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c, table = crc32.t;
  if (!table) {
    table = crc32.t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  // rest 0 (compression, filter, interlace)
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Drawing ---
function lerp(a, b, t) { return a + (b - a) * t; }

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // alpha blend over existing
    const ea = buf[i + 3] / 255, na = a / 255;
    const oa = na + ea * (1 - na);
    if (oa === 0) return;
    buf[i] = (r * na + buf[i] * ea * (1 - na)) / oa;
    buf[i + 1] = (g * na + buf[i + 1] * ea * (1 - na)) / oa;
    buf[i + 2] = (b * na + buf[i + 2] * ea * (1 - na)) / oa;
    buf[i + 3] = oa * 255;
  };

  // Background: vertical gradient indigo -> blue, full bleed (maskable safe)
  for (let y = 0; y < size; y++) {
    const t = y / size;
    const r = Math.round(lerp(79, 37, t));   // 4f -> 25
    const g = Math.round(lerp(70, 99, t));
    const b = Math.round(lerp(229, 235, t));
    for (let x = 0; x < size; x++) set(x, y, r, g, b, 255);
  }

  // Suitcase geometry (centered)
  const cx = size / 2, cy = size * 0.54;
  const w = size * 0.46, h = size * 0.40;
  const left = cx - w / 2, top = cy - h / 2;
  const radius = size * 0.05;

  const inRoundRect = (x, y, l, t, ww, hh, rad) => {
    if (x < l || x > l + ww || y < t || y > t + hh) return false;
    const dx = Math.min(x - l, l + ww - x);
    const dy = Math.min(y - t, t + hh - y);
    if (dx >= rad || dy >= rad) return true;
    const ddx = rad - dx, ddy = rad - dy;
    return ddx * ddx + ddy * ddy <= rad * rad;
  };

  // Handle (drawn behind body): rounded bar on top
  const hw = w * 0.34, hh2 = h * 0.22;
  const hl = cx - hw / 2, ht = top - hh2 * 0.75;
  for (let y = Math.floor(ht); y < top + 4; y++) {
    for (let x = Math.floor(hl); x < hl + hw; x++) {
      const outer = inRoundRect(x, y, hl, ht, hw, hh2, hh2 * 0.45);
      const innerT = ht + hh2 * 0.42;
      const inner = inRoundRect(x, y, hl + hw * 0.16, innerT, hw * 0.68, hh2, hh2 * 0.4);
      if (outer && !inner) set(x, y, 226, 232, 240, 255);
    }
  }

  // Body (white-ish)
  for (let y = Math.floor(top); y < top + h; y++) {
    for (let x = Math.floor(left); x < left + w; x++) {
      if (inRoundRect(x, y, left, top, w, h, radius)) set(x, y, 248, 250, 252, 255);
    }
  }

  // Latch / center clasp band
  const bandH = h * 0.12;
  const bandT = cy - bandH / 2;
  for (let y = Math.floor(bandT); y < bandT + bandH; y++) {
    for (let x = Math.floor(left); x < left + w; x++) {
      if (inRoundRect(x, y, left, top, w, h, radius)) set(x, y, 99, 102, 241, 255);
    }
  }
  // Clasp block in middle
  const clw = w * 0.16, clh = h * 0.20;
  const cll = cx - clw / 2, clt = cy - clh / 2;
  for (let y = Math.floor(clt); y < clt + clh; y++)
    for (let x = Math.floor(cll); x < cll + clw; x++)
      set(x, y, 67, 56, 202, 255);

  // Vertical accent stripes on body
  const stripe = (fx) => {
    const sx = left + w * fx;
    const sw = w * 0.045;
    for (let y = Math.floor(top + h * 0.08); y < top + h * 0.92; y++)
      for (let x = Math.floor(sx); x < sx + sw; x++)
        if (inRoundRect(x, y, left, top, w, h, radius) && (y < bandT - 2 || y > bandT + bandH + 2))
          set(x, y, 203, 213, 225, 255);
  };
  stripe(0.22); stripe(0.74);

  return buf;
}

[180, 192, 512].forEach((s) => {
  const png = encodePNG(s, s, drawIcon(s));
  fs.writeFileSync(`icon-${s}.png`, png);
  console.log(`wrote icon-${s}.png (${png.length} bytes)`);
});
