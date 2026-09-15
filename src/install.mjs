import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROVIDERS, detectProviders, defaultScope, expand, exists } from './providers.mjs';
import { installHook, uninstallHook } from './hooks-write.mjs';

export const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SKILL_SRC = path.join(PKG_ROOT, 'skills', 'perfectable');

function rmrf(p) {
  try {
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink() || st.isFile()) fs.unlinkSync(p);
    else fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* missing */
  }
}

export function copySkill(dest, { link = false } = {}) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (exists(dest) || fs.existsSync(dest)) {
    fs.lstatSync(dest);
    rmrf(dest);
  }
  if (link) {
    fs.symlinkSync(SKILL_SRC, dest);
  } else {
    fs.cpSync(SKILL_SRC, dest, { recursive: true });
  }
  return dest;
}

export function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveProviders(ids, cwd) {
  if (!ids.length || ids.includes('all')) return Object.keys(PROVIDERS);
  if (ids.includes('auto')) {
    const detected = detectProviders(cwd);
    return detected.length ? detected : ['claude', 'cursor', 'grok', 'agents'];
  }
  const unknown = ids.filter((id) => !PROVIDERS[id]);
  if (unknown.length) {
    throw new Error(`Unknown provider(s): ${unknown.join(', ')}. Use: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return ids;
}

export function install({
  cwd = process.cwd(),
  scope = 'project',
  providers = ['auto'],
  hooks = true,
  link = false,
} = {}) {
  const ids = resolveProviders(providers, cwd);
  const results = [];
  for (const id of ids) {
    const p = PROVIDERS[id];
    const skillDir = scope === 'global' ? p.globalSkill : expand(p.projectSkill, cwd);
    if (!skillDir) {
      results.push({ id, skipped: 'no global path' });
      continue;
    }
    const dest = path.join(skillDir, 'perfectable');
    copySkill(dest, { link });
    let hookFile = null;
    if (hooks && scope === 'project' && p.hookKind) {
      const hookScript = path.join(dest, 'scripts', 'hook.mjs');
      hookFile = installHook(p.hookKind, expand(p.projectHook, cwd), hookScript);
    }
    results.push({ id, name: p.name, dest, hookFile, link });
  }
  return { scope, results };
}

export function uninstall({ cwd = process.cwd(), scope = 'project', providers = ['auto'] } = {}) {
  const ids = resolveProviders(providers, cwd);
  const results = [];
  for (const id of ids) {
    const p = PROVIDERS[id];
    const skillDir = scope === 'global' ? p.globalSkill : expand(p.projectSkill, cwd);
    if (!skillDir) continue;
    const dest = path.join(skillDir, 'perfectable');
    if (exists(dest) || fs.existsSync(dest)) rmrf(dest);
    if (scope === 'project' && p.hookKind && p.projectHook) {
      uninstallHook(p.hookKind, expand(p.projectHook, cwd));
    }
    results.push({ id, dest });
  }
  return { scope, results };
}
