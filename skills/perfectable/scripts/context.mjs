#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DIR, findRoot, inferProject, loadConfig } from './lib.mjs';

const root = findRoot();
const info = inferProject(root);
const config = loadConfig(root);
const hookOn = Boolean(config.hook?.enabled);
const platformFile = info.platform === 'adaptive'
  ? 'platforms/macos/macos.md, platforms/windows/windows.md, platforms/linux/linux.md'
  : `platforms/${info.platform}/${info.platform}.md`;

// Load CHROME.md schema version
let chromeSchemaVersion = 0;
if (info.chromePath) {
  const chrome = fs.readFileSync(info.chromePath, 'utf8');
  const m = chrome.match(/<!--\s*perfectable:chrome-schema\s+(\d+)\s*-->/);
  if (m) chromeSchemaVersion = parseInt(m[1], 10);
}

const lines = [
  `PERFECTABLE_BASE=${SKILL_DIR}`,
  `ROOT=${root}`,
  `APP=${info.appPath || 'MISSING'}`,
  `CHROME=${info.chromePath || 'MISSING'}`,
  `PLATFORM=${info.platform}`,
  `SHELL=${info.shell}`,
  `WINDOWING=${info.windowing}`,
  `INPUT=${info.input}`,
  `APP_SCHEMA=${info.appSchemaVersion || 0}`,
  `CHROME_SCHEMA=${chromeSchemaVersion}`,
  `DETECTOR_HOOK=${hookOn ? 'on' : 'off'}`,
  `LOAD=${platformFile}`,
  `DETECTOR=node ${path.join(SKILL_DIR, 'scripts', 'detect.mjs')}`,
  'DIRECTIVE=Load craft-floor.md immediately before editing UI. Skip for planning-only.',
  'DIRECTIVE=Run detect.mjs on touched UI files after edits unless DETECTOR_HOOK=on.',
];

if (!info.appPath) {
  lines.push('DIRECTIVE=APP.md missing. For a new app, run init before inventing chrome. Narrow refinement of existing chrome may proceed; offer init afterward.');
}
if (info.appPath && !info.chromePath) {
  lines.push('DIRECTIVE=CHROME.md missing. Offer document after the current task; incumbent chrome is still visual authority.');
}
if (info.appSchemaVersion && info.appSchemaVersion < 1) {
  lines.push('DIRECTIVE=APP.md schema outdated. Run init to migrate.');
}
if (chromeSchemaVersion && chromeSchemaVersion < 1) {
  lines.push('DIRECTIVE=CHROME.md schema outdated. Run document to migrate.');
}

process.stdout.write(lines.join('\n') + '\n');
if (!fs.existsSync(root)) process.exit(1);
