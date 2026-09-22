#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PKG_ROOT, SKILL_SRC, install, uninstall, parseList } from '../src/install.mjs';
import { PROVIDER_IDS, detectProviders, defaultScope } from '../src/providers.mjs';

const VERSION = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8')).version;

const HELP = `
perfectable ${VERSION}

Layout and audit skill for IDE and desktop-app UI. Installs into AI coding
harnesses and exposes the same detector the skill uses.

Usage:
  perfectable install [options]
  perfectable uninstall [options]
  perfectable update [options]
  perfectable link [options]
  perfectable detect [--json] [--immediate] [path ...]
  perfectable context
  perfectable hooks <on|off|status|ignore-rule|ignore-file|reset>
  perfectable providers
  perfectable version

Install options:
  -y, --yes                 Non-interactive
  --scope=project|global    Where to install (default: project if git/npm, else global)
  --providers=a,b,auto,all  Harnesses (default: auto)
  --no-hooks                Skip hook manifests
  --cwd=<dir>               Project directory
  --link                    Symlink the skill instead of copying (local dev)

Providers: ${PROVIDER_IDS.join(', ')}

Examples:
  npx perfectable install -y --providers=claude,cursor,codex --scope=project
  npx perfectable detect --json src/
  grok plugin install /path/to/perfectable --trust
`.trim();

function flag(args, name) {
  const pref = `--${name}=`;
  const hit = args.find((a) => a.startsWith(pref));
  if (hit) return hit.slice(pref.length);
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('-')) return args[i + 1];
  return null;
}

function has(args, ...names) {
  return names.some((n) => args.includes(n));
}

function runNode(script, extra, cwd) {
  const child = spawn(process.execPath, [script, ...extra], {
    cwd,
    stdio: 'inherit',
  });
  child.on('exit', (code) => process.exit(code ?? 1));
}

const argv = process.argv.slice(2);
const cmd = argv[0] || 'help';
const rest = argv.slice(1);
const cwd = path.resolve(flag(rest, 'cwd') || process.cwd());

if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
  process.stdout.write(HELP + '\n');
  process.exit(0);
}

if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
  process.stdout.write(VERSION + '\n');
  process.exit(0);
}

if (cmd === 'providers') {
  const detected = detectProviders(cwd);
  process.stdout.write(`detected: ${detected.join(', ') || '(none)'}\navailable: ${PROVIDER_IDS.join(', ')}\n`);
  process.exit(0);
}

if (cmd === 'detect') {
  runNode(path.join(SKILL_SRC, 'scripts', 'detect.mjs'), rest, cwd);
} else if (cmd === 'context') {
  runNode(path.join(SKILL_SRC, 'scripts', 'context.mjs'), rest, cwd);
} else if (cmd === 'hooks') {
  runNode(path.join(SKILL_SRC, 'scripts', 'hook-admin.mjs'), rest, cwd);
} else if (cmd === 'telemetry') {
  runNode(path.join(SKILL_SRC, 'scripts', 'telemetry.mjs'), rest, cwd);
} else if (cmd === 'install' || cmd === 'update' || cmd === 'link') {
  const scope = flag(rest, 'scope') || defaultScope(cwd);
  const providers = parseList(flag(rest, 'providers')) || [];
  const ids = providers.length ? providers : ['auto'];
  const hooks = !has(rest, '--no-hooks');
  const link = cmd === 'link' || has(rest, '--link');
  if (!has(rest, '-y', '--yes') && !process.stdout.isTTY && !flag(rest, 'providers') && cmd === 'install') {
    // still allow; auto providers
  }
  const result = install({ cwd, scope, providers: ids, hooks, link });
  for (const r of result.results) {
    if (r.skipped) {
      process.stdout.write(`skip  ${r.id} (${r.skipped})\n`);
      continue;
    }
    process.stdout.write(`${link ? 'link' : 'install'}  ${r.id.padEnd(10)} ${r.dest}\n`);
    if (r.hookFile) process.stdout.write(`         hook ${r.hookFile}\n`);
  }
  process.stdout.write(`\nscope=${result.scope}  Next: open the harness and run /perfectable\n`);
} else if (cmd === 'uninstall') {
  const scope = flag(rest, 'scope') || defaultScope(cwd);
  const providers = parseList(flag(rest, 'providers'));
  const ids = providers.length ? providers : ['auto'];
  const result = uninstall({ cwd, scope, providers: ids });
  for (const r of result.results) {
    process.stdout.write(`removed  ${r.id.padEnd(10)} ${r.dest}\n`);
  }
} else {
  process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}\n`);
  process.exit(1);
}
