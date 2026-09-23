import zlib from 'node:zlib';

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

export function encodePng(width, height, pixel) {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('not a png');
  let width = 0;
  let height = 0;
  let colorType = 2;
  let interlace = 0;
  const idat = [];
  let o = 8;
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8) throw new Error('only 8-bit png');
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (interlace) throw new Error('interlaced png is not supported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`color type ${colorType} is not supported`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 3);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = Buffer.from(raw.subarray(pos, pos + stride));
    pos += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? row[i - channels] : 0;
      const up = prev[i];
      const ul = i >= channels ? prev[i - channels] : 0;
      if (filter === 1) row[i] = (row[i] + left) & 255;
      else if (filter === 2) row[i] = (row[i] + up) & 255;
      else if (filter === 3) row[i] = (row[i] + ((left + up) >> 1)) & 255;
      else if (filter === 4) row[i] = (row[i] + paeth(left, up, ul)) & 255;
    }
    for (let x = 0; x < width; x++) {
      const s = x * channels;
      const r = colorType === 0 ? row[s] : row[s];
      const g = colorType === 0 ? row[s] : row[s + 1] || r;
      const b = colorType === 0 ? row[s] : row[s + 2] || r;
      const d = (y * width + x) * 3;
      out[d] = r;
      out[d + 1] = g;
      out[d + 2] = b;
    }
    prev = row;
  }
  return { width, height, rgb: out };
}

function sampleGray(img, grid) {
  const cells = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const sx = Math.min(img.width - 1, Math.floor(((x + 0.5) * img.width) / grid));
      const sy = Math.min(img.height - 1, Math.floor(((y + 0.5) * img.height) / grid));
      const i = (sy * img.width + sx) * 3;
      cells.push((img.rgb[i] * 0.299 + img.rgb[i + 1] * 0.587 + img.rgb[i + 2] * 0.114) | 0);
    }
  }
  return cells;
}

function dHash(img) {
  const w = 9;
  const h = 8;
  const bits = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor(((x + 0.5) * img.width) / w));
      const sy = Math.min(img.height - 1, Math.floor(((y + 0.5) * img.height) / h));
      const i = (sy * img.width + sx) * 3;
      row.push((img.rgb[i] * 0.299 + img.rgb[i + 1] * 0.587 + img.rgb[i + 2] * 0.114) | 0);
    }
    for (let x = 0; x < w - 1; x++) bits.push(row[x] > row[x + 1] ? 1 : 0);
  }
  return bits;
}

export function comparePng(aBuf, bBuf) {
  const a = decodePng(aBuf);
  const b = decodePng(bBuf);
  const ga = sampleGray(a, 32);
  const gb = sampleGray(b, 32);
  let acc = 0;
  for (let i = 0; i < ga.length; i++) acc += Math.abs(ga[i] - gb[i]);
  const mae = acc / ga.length;
  const ha = dHash(a);
  const hb = dHash(b);
  let hamming = 0;
  for (let i = 0; i < ha.length; i++) if (ha[i] !== hb[i]) hamming++;
  const match = mae <= 12 && hamming <= 10;
  return { mae, hamming, match };
}
