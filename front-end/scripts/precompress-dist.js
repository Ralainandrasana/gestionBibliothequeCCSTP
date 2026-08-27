import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const compressibleExtensions = new Set(['.css', '.html', '.js', '.json', '.svg']);
const minimumSize = 1024;
let compressedCount = 0;
let originalBytes = 0;
let compressedBytes = 0;

function precompressDirectory(directory) {
  for (const entry of readdirSync(directory)) {
    const filePath = join(directory, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      precompressDirectory(filePath);
      continue;
    }

    if (!compressibleExtensions.has(extname(filePath)) || stats.size < minimumSize) {
      continue;
    }

    const source = readFileSync(filePath);
    const compressed = gzipSync(source, { level: 9 });

    if (compressed.length >= source.length) {
      continue;
    }

    writeFileSync(`${filePath}.gz`, compressed);
    compressedCount += 1;
    originalBytes += source.length;
    compressedBytes += compressed.length;
  }
}

precompressDirectory(distDirectory);

const saving = originalBytes === 0
  ? 0
  : Math.round((1 - compressedBytes / originalBytes) * 100);

console.log(
  `Precompression Gzip : ${compressedCount} fichiers, ${saving}% economises au transfert.`,
);
