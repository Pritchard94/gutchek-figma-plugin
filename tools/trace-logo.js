// Traces the two-colour Gutchek mark from a PNG into smooth SVG paths on a 48 by 48 grid.
// Usage: node tools/trace-logo.js path/to/logo.png
const fs = require('fs');
const zlib = require('zlib');

function decodePng(buf) {
  let p = 8;
  let w, h, depth, type;
  const idat = [];
  let palette = null;
  let trns = null;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const kind = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (kind === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      type = data[9];
      if (data[12] !== 0) throw new Error('interlaced PNG not supported');
    } else if (kind === 'PLTE') palette = data;
    else if (kind === 'tRNS') trns = data;
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8) throw new Error('only 8-bit PNG supported, got ' + depth);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (type === 6) line.copy(out, o, x * 4, x * 4 + 4);
      else if (type === 2) {
        out[o] = line[x * 3]; out[o + 1] = line[x * 3 + 1]; out[o + 2] = line[x * 3 + 2]; out[o + 3] = 255;
      } else if (type === 3) {
        const i = line[x];
        out[o] = palette[i * 3]; out[o + 1] = palette[i * 3 + 1]; out[o + 2] = palette[i * 3 + 2]; out[o + 3] = trns && i < trns.length ? trns[i] : 255;
      } else if (type === 0) {
        out[o] = out[o + 1] = out[o + 2] = line[x]; out[o + 3] = 255;
      } else if (type === 4) {
        out[o] = out[o + 1] = out[o + 2] = line[x * 2]; out[o + 3] = line[x * 2 + 1];
      }
    }
    prev = line;
  }
  return { w, h, px: out };
}

function boundary(mask, w, h) {
  // Moore-neighbour tracing of the outer boundary of the first foreground pixel found.
  let start = -1;
  for (let i = 0; i < w * h; i++) if (mask[i]) { start = i; break; }
  if (start < 0) return [];
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x];
  let x = start % w, y = (start / w) | 0;
  const sx = x, sy = y;
  const pts = [[x, y]];
  let d = 6;
  for (let guard = 0; guard < w * h * 4; guard++) {
    let found = false;
    for (let k = 0; k < 8; k++) {
      const nd = (d + 6 + k) % 8;
      const nx = x + dirs[nd][0], ny = y + dirs[nd][1];
      if (at(nx, ny)) {
        x = nx; y = ny; d = nd; found = true;
        break;
      }
    }
    if (!found || (x === sx && y === sy)) break;
    pts.push([x, y]);
  }
  return pts;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  let md = 0, mi = 0;
  const len = Math.hypot(bx - ax, by - ay) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((by - ay) * pts[i][0] - (bx - ax) * pts[i][1] + bx * ay - by * ax) / len;
    if (d > md) { md = d; mi = i; }
  }
  if (md <= eps) return [pts[0], pts[pts.length - 1]];
  const l = rdp(pts.slice(0, mi + 1), eps), r = rdp(pts.slice(mi), eps);
  return l.slice(0, -1).concat(r);
}

function smoothClosed(pts) {
  // Closed Catmull-Rom spline as cubic Beziers.
  const n = pts.length;
  const f = (v) => +v.toFixed(2);
  let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + [c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]].map(f).join(' ');
  }
  return d + 'Z';
}

const file = process.argv[2];
const { w, h, px } = decodePng(fs.readFileSync(file));
// Classify by luminance: dark navy, light lavender, background (white or transparent).
const masks = { dark: new Uint8Array(w * h), light: new Uint8Array(w * h) };
const sums = { dark: [0, 0, 0, 0], light: [0, 0, 0, 0] };
for (let i = 0; i < w * h; i++) {
  const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2], a = px[i * 4 + 3];
  if (a < 128) continue;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (lum < 90) { masks.dark[i] = 1; sums.dark[0] += r; sums.dark[1] += g; sums.dark[2] += b; sums.dark[3]++; }
  else if (sat > 40 && lum < 230) { masks.light[i] = 1; sums.light[0] += r; sums.light[1] += g; sums.light[2] += b; sums.light[3]++; }
}
const hex = (s) => '#' + s.slice(0, 3).map((v) => Math.round(v / s[3]).toString(16).padStart(2, '0')).join('').toUpperCase();
let minX = w, minY = h, maxX = 0, maxY = 0;
const shapes = {};
for (const k of ['dark', 'light']) {
  const b = boundary(masks[k], w, h);
  for (const [x, y] of b) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  shapes[k] = b;
}
const size = Math.max(maxX - minX, maxY - minY);
const margin = 1;
const scale = (48 - margin * 2) / size;
const ox = margin + ((48 - margin * 2) - (maxX - minX) * scale) / 2;
const oy = margin + ((48 - margin * 2) - (maxY - minY) * scale) / 2;
const out = {};
for (const k of ['dark', 'light']) {
  const simple = rdp(shapes[k], 2.2).slice(0, -1);
  const pts = simple.map(([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale]);
  out[k] = { color: hex(sums[k]), points: pts.length, d: smoothClosed(pts) };
}
console.log(JSON.stringify({ source: { w, h, box: [minX, minY, maxX, maxY] }, ...out }, null, 2));
