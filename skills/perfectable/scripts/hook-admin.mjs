#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { SKILL_DIR, configPath, findRoot, loadConfig, saveConfig } from './lib.mjs';

const HOOK_SCRIPT = path.join(SKILL_DIR, 'scripts', 'hook.mjs');

function hookFile(root) {
  return path.join(root, '.grok', 'hooks', 'perfectable.json');
}

function writeHookManifest(root, dryRun = false) {
  const dir = path.dirname(hookFile(root));
  if (!dryRun) fs.mkdirSync(dir, { recursive: true });
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
  const output = JSON.stringify(payload, null, 2) + '\n';
  if (dryRun) {
    process.stdout.write(`[DRY RUN] Would write to ${hookFile(root)}:\n${output}`);
  } else {
    fs.writeFileSync(hookFile(root), output);
  }
}

const root = findRoot();
const [action, ...rest] = process.argv.slice(2);
const cmd = action || 'status';
const dryRun = rest.includes('--dry-run');
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
  writeHookManifest(root, dryRun);
  if (dryRun) {
    process.stdout.write('[DRY RUN] Hook manifest not written. Run without --dry-run to apply.\n');
  } else {
    process.stdout.write(`Enabled. Wrote ${hookFile(root)}\nProject hooks need /hooks-trust in this folder before they run.\n`);
  }
} else if (cmd === 'off') {
  config.hook.enabled = false;
  saveConfig(root, config);
  if (!dryRun) process.stdout.write('Disabled. New edits will not trigger the perfectable hook until $perfectable hooks on.\n');
} else if (cmd === 'ignore-rule') {
  const id = rest[0];
  if (!id) {
    process.stderr.write('Usage: hook-admin.mjs ignore-rule <id> [--dry-run]\n');
    process.exit(1);
  }
  const rules = new Set(config.detector.ignoreRules || []);
  rules.add(id);
  config.detector.ignoreRules = [...rules];
  saveConfig(root, config);
  process.stdout.write(`Ignored rule ${id}${dryRun ? ' (dry-run)' : ''}\n`);
} else if (cmd === 'ignore-file') {
  const glob = rest[0];
  if (!glob) {
    process.stderr.write('Usage: hook-admin.mjs ignore-file <glob> [--dry-run]\n');
    process.exit(1);
  }
  const files = new Set(config.detector.ignoreFiles || []);
  files.add(glob);
  config.detector.ignoreFiles = [...files];
  saveConfig(root, config);
  process.stdout.write(`Ignored file ${glob}${dryRun ? ' (dry-run)' : ''}\n`);
} else if (cmd === 'reset') {
  const cfg = configPath(root);
  const hook = hookFile(root);
  if (dryRun) {
    process.stdout.write(`[DRY RUN] Would delete: ${cfg}, ${hook}\n`);
  } else {
    if (fs.existsSync(cfg)) fs.unlinkSync(cfg);
    if (fs.existsSync(hook)) fs.unlinkSync(hook);
    process.stdout.write('Reset perfectable config and project hook.\n');
  }
} else {
  process.stderr.write('Usage: hook-admin.mjs <on|off|status|ignore-rule|ignore-file|reset> [--dry-run]\n');
  process.exit(1);
}
