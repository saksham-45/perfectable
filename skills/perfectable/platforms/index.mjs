/**
 * Perfectable Platform Pack Loader
 * 
 * Loads platform-specific guidance for the current context.
 * Usage: import { loadPlatformPack } from 'perfectable/platforms';
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORMS_DIR = path.join(__dirname, '..', 'platforms');

export function loadPlatformPack(platform) {
  const packDir = path.join(PLATFORMS_DIR, platform);
  const readmePath = path.join(packDir, 'README.md');
  const guidePath = path.join(packDir, `${platform}.md`);
  
  const result = {
    platform,
    readme: fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '',
    guide: fs.existsSync(guidePath) ? fs.readFileSync(guidePath, 'utf8') : '',
  };
  
  return result;
}

export function loadAllPlatformPacks() {
  const platforms = ['macos', 'windows', 'linux', 'adaptive'];
  return Object.fromEntries(
    platforms.map(p => [p, loadPlatformPack(p)])
  );
}

export function getPlatformPack(platform) {
  return loadPlatformPack(platform);
}