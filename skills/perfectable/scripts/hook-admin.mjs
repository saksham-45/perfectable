#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DIR, configPath, findRoot, loadConfig, saveConfig } from './lib.mjs';

const HOOK_SCRIPT = path.join(SKILL_DIR, 'scripts', 'hook.mjs');

function hookFile(root) {
  return path.join(root, '.grok', 'hooks', 'perfectable.json');
}

function writeHookManifest(root) {
  const dir = path.dirname(hookFile(root));
  fs.mkdirSync(dir, { recursive: true });
  const payload = {
    hooks: {
      PostToolUse: [
        {
          matcher: 'search_replace|write|Write|Edit|MultiEdit',
          hooks: [
            { type: 'command', command: `node "${HOOK_SCRIPT}"`, timeout: 30 },
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            { type: 'command', command: `node "${HOOK_SCRIPT}" --stop`, timeout: 60 },
          ],
        },
      ],
    },
  };
  fs.writeFileSync(hookFile(root), JSON.stringify(payload, null, 2) + '\n');
}

const root = findRoot();
const [action, ...rest] = process.argv.slice(2);
const cmd = action || 'status';
const config = loadConfig(root);

if (cmd === 'status') {
  process.stdout.write([
    `root: ${root}`,
    `config: ${configPath(root)}`,
    `hook.enabled: ${config.hook.enabled}`,
    `hook file: ${hookFile(root)}${fs.existsSync(hookFile(root)) ? '' : ' (missing)'}`,
    `ignoreRules: ${(config.detector.ignoreRules || []).join(', ') || '(none)'}`,
    `ignoreFiles: ${(config.detector.ignoreFiles || []).join(', ') || '(none)'}`,
    `skill: ${SKILL_DIR}`,
  ].join('\n') + '\n');
} else if (cmd === 'on') {
  config.hook.enabled = true;
  saveConfig(root, config);
  writeHookManifest(root);
  process.stdout.write(`Enabled. Wrote ${hookFile(root)}\nProject hooks need /hooks-trust in this folder before they run.\n`);
} else if (cmd === 'off') {
  config.hook.enabled = false;
  saveConfig(root, config);
  process.stdout.write('Disabled. New edits will not trigger the Perfectable hook until $perfectable hooks on.\n');
} else if (cmd === 'ignore-rule') {
  const id = rest[0];
  if (!id) {
    process.stderr.write('Usage: hook-admin.mjs ignore-rule <id>\n');
    process.exit(1);
  }
  const rules = new Set(config.detector.ignoreRules || []);
  rules.add(id);
  config.detector.ignoreRules = [...rules];
  saveConfig(root, config);
  process.stdout.write(`Ignored rule ${id}\n`);
} else if (cmd === 'ignore-file') {
  const glob = rest[0];
  if (!glob) {
    process.stderr.write('Usage: hook-admin.mjs ignore-file <glob>\n');
    process.exit(1);
  }
  const files = new Set(config.detector.ignoreFiles || []);
  files.add(glob);
  config.detector.ignoreFiles = [...files];
  saveConfig(root, config);
  process.stdout.write(`Ignored file ${glob}\n`);
} else if (cmd === 'reset') {
  const cfg = configPath(root);
  const hook = hookFile(root);
  if (fs.existsSync(cfg)) fs.unlinkSync(cfg);
  if (fs.existsSync(hook)) fs.unlinkSync(hook);
  process.stdout.write('Reset Perfectable config and project hook.\n');
} else {
  process.stderr.write('Usage: hook-admin.mjs <on|off|status|ignore-rule|ignore-file|reset>\n');
  process.exit(1);
}
