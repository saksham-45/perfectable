import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const PROVIDERS = {
  claude: {
    id: 'claude',
    name: 'Claude Code',
    projectSkill: '.claude/skills',
    globalSkill: path.join(os.homedir(), '.claude', 'skills'),
    detect: ['.claude', path.join(os.homedir(), '.claude')],
    hookKind: 'claude',
    projectHook: '.claude/settings.json',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    projectSkill: '.cursor/skills',
    globalSkill: path.join(os.homedir(), '.cursor', 'skills'),
    detect: ['.cursor', path.join(os.homedir(), '.cursor')],
    hookKind: 'cursor',
    projectHook: '.cursor/hooks.json',
  },
  grok: {
    id: 'grok',
    name: 'Grok Build',
    projectSkill: '.grok/skills',
    globalSkill: path.join(os.homedir(), '.grok', 'skills'),
    detect: ['.grok', path.join(os.homedir(), '.grok')],
    hookKind: 'grok',
    projectHook: '.grok/hooks/perfectable.json',
  },
  agents: {
    id: 'agents',
    name: 'Agents (.agents)',
    projectSkill: '.agents/skills',
    globalSkill: path.join(os.homedir(), '.agents', 'skills'),
    detect: ['.agents', path.join(os.homedir(), '.agents')],
    hookKind: null,
    projectHook: null,
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    projectSkill: '.codex/skills',
    globalSkill: path.join(os.homedir(), '.codex', 'skills'),
    detect: ['.codex', path.join(os.homedir(), '.codex')],
    hookKind: 'codex',
    projectHook: '.codex/hooks.json',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini CLI',
    projectSkill: '.gemini/skills',
    globalSkill: path.join(os.homedir(), '.gemini', 'skills'),
    detect: ['.gemini', path.join(os.homedir(), '.gemini')],
    hookKind: null,
    projectHook: null,
  },
  github: {
    id: 'github',
    name: 'GitHub Copilot',
    projectSkill: '.github/skills',
    globalSkill: null,
    detect: ['.github'],
    hookKind: 'github',
    projectHook: '.github/hooks/perfectable.json',
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode',
    projectSkill: '.opencode/skills',
    globalSkill: path.join(os.homedir(), '.config', 'opencode', 'skills'),
    detect: ['.opencode', path.join(os.homedir(), '.config', 'opencode')],
    hookKind: null,
    projectHook: null,
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export function expand(p, cwd) {
  if (!p) return p;
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  if (path.isAbsolute(p)) return p;
  return path.resolve(cwd || process.cwd(), p);
}

export function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function detectProviders(cwd) {
  const found = [];
  for (const id of PROVIDER_IDS) {
    const p = PROVIDERS[id];
    const hit = p.detect.some((d) => exists(expand(d, cwd)));
    if (hit) found.push(id);
  }
  return found;
}

export function defaultScope(cwd) {
  return exists(path.join(cwd, '.git')) || exists(path.join(cwd, 'package.json'))
    ? 'project'
    : 'global';
}
