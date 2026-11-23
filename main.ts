// news-image-20261123 entry: copies the reviewed news poster into /output/entry.png.
// Node 22, standard library only. MAKEFUN_OUTPUT_DIR stands in for /output locally.
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SOURCE = new URL('./entry.png', import.meta.url);
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const TARGET = join(OUT_DIR, 'entry.png');

function checkImage(path) {
  const bytes = readFileSync(path);
  if (bytes.length > 1048576) throw new Error('image exceeds the 1 MiB cap');
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('entry.png is not a PNG');
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== 1024 || height !== 1024) throw new Error('image is not 1024x1024');
  if (bytes.subarray(-8, -4).toString('ascii') !== 'IEND') {
    throw new Error('PNG is missing its end chunk');
  }
  return bytes.length;
}

const size = checkImage(SOURCE);
mkdirSync(dirname(TARGET), { recursive: true });
copyFileSync(SOURCE, TARGET);
if (statSync(TARGET).size !== size) throw new Error('copy is incomplete');
console.log(`wrote ${TARGET} (${size} bytes)`);
