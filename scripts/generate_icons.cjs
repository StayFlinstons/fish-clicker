const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Função CRC32 para chunks PNG
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(crcData), 8 + len);
  return buf;
}

function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines com filter byte 0
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // Filter 0 (None)
    const srcStart = y * width * 4;
    const dstStart = y * (width * 4 + 1) + 1;
    rgbaBuffer.copy(scanlines, dstStart, srcStart, srcStart + width * 4);
  }

  const idatData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Matriz de Pixel Art do Ícone 16x16 (Peixe Dourado Estilizado com Bóia/Oceano)
// 0=bg 1=border 2=cyan_light 3=cyan_deep 4=gold_light 5=gold_deep 6=white 7=red
const GRID = [
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,7,7,7,1,0,0,0,0,0],
  [0,0,0,0,0,1,7,6,6,7,7,1,0,0,0,0],
  [0,0,0,0,0,1,6,6,6,6,7,1,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,1,0,0,0,0,1,1,0],
  [0,1,4,4,4,1,0,0,1,0,0,0,1,4,5,1],
  [1,4,6,4,4,4,1,0,1,0,0,1,4,4,5,1],
  [1,4,1,4,4,4,4,1,1,0,1,4,4,5,1,0],
  [1,4,4,4,5,4,4,4,4,1,4,4,5,1,0,0],
  [1,4,4,5,5,5,4,4,4,4,4,5,1,0,0,0],
  [0,1,4,4,5,4,4,4,4,4,5,1,1,0,0,0],
  [0,0,1,1,4,4,4,4,4,5,1,4,4,1,0,0],
  [0,0,0,0,1,1,4,4,5,1,0,1,4,5,1,0],
  [0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const PALETTE = {
  0: [2, 6, 23, 255],     // Slate 950
  1: [15, 23, 42, 255],    // Dark border
  2: [6, 182, 212, 255],   // Cyan light
  3: [8, 145, 178, 255],   // Cyan deep
  4: [250, 204, 21, 255],  // Gold light
  5: [217, 119, 6, 255],   // Gold deep
  6: [255, 255, 255, 255], // White
  7: [239, 68, 68, 255]    // Red buoy
};

function generateIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = size / 16;
  const padding = Math.floor(size * 0.08); // Margem para ícone maskable seguro
  const innerSize = size - padding * 2;
  const pixelScale = innerSize / 16;

  // Fundo redondo suave com borda neon ciano
  const center = size / 2;
  const radius = size * 0.46;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Fundo circular com borda brilhante
      let r = 2, g = 6, b = 23, a = 255;
      if (dist <= radius) {
        if (dist > radius - (size * 0.04)) {
          // Borda ciano neon
          r = 6; g = 182; b = 212;
        } else {
          // Gradiente sutil de fundo
          r = 8; g = 20; b = 45;
        }
      }

      // Projeção do pixel art 16x16
      const px = Math.floor((x - padding) / pixelScale);
      const py = Math.floor((y - padding) / pixelScale);

      if (px >= 0 && px < 16 && py >= 0 && py < 16) {
        const colorId = GRID[py][px];
        if (colorId !== 0) {
          const col = PALETTE[colorId];
          r = col[0];
          g = col[1];
          b = col[2];
          a = col[3];
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return createPNG(size, size, buf);
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIcon(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIcon(512));
console.log('Ícones 192x192 e 512x512 gerados com sucesso em /icons!');
