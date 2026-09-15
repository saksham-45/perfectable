import fs from 'node:fs';
import path from 'node:path';

const MARKER = 'perfectable/scripts/hook.mjs';

function hookEntry(hookScript, extraMatcher) {
  const post = {
    matcher: extraMatcher || 'search_replace|write|Write|Edit|MultiEdit',
    hooks: [{ type: 'command', command: `node "${hookScript}"`, timeout: 30 }],
  };
  const stop = {
    hooks: [{ type: 'command', command: `node "${hookScript}" --stop`, timeout: 60 }],
  };
  return { post, stop };
}

function isOurs(entry) {
  const hooks = entry?.hooks || [];
  return hooks.some((h) => String(h.command || '').includes(MARKER));
}

function stripOurs(list = []) {
  return list.filter((e) => !isOurs(e));
}

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

export function installHook(kind, hookFile, hookScript) {
  if (!kind || !hookFile) return null;
  const { post, stop } = hookEntry(hookScript);

  if (kind === 'grok' || kind === 'github') {
    writeJson(hookFile, {
      hooks: {
        PostToolUse: [post],
        Stop: [stop],
      },
    });
    return hookFile;
  }

  if (kind === 'claude' || kind === 'codex') {
    const json = readJson(hookFile);
    json.hooks = json.hooks || {};
    json.hooks.PostToolUse = [...stripOurs(json.hooks.PostToolUse), post];
    json.hooks.Stop = [...stripOurs(json.hooks.Stop), stop];
    writeJson(hookFile, json);
    return hookFile;
  }

  if (kind === 'cursor') {
    const json = readJson(hookFile);
    json.version = json.version || 1;
    json.hooks = json.hooks || {};
    const after = {
      command: `node "${hookScript}"`,
    };
    const existing = Array.isArray(json.hooks.afterFileEdit) ? json.hooks.afterFileEdit : [];
    json.hooks.afterFileEdit = [
      ...existing.filter((e) => !String(e.command || '').includes(MARKER)),
      after,
    ];
    writeJson(hookFile, json);
    return hookFile;
  }

  return null;
}

export function uninstallHook(kind, hookFile) {
  if (!kind || !hookFile || !fs.existsSync(hookFile)) return;
  if (kind === 'grok' || kind === 'github') {
    fs.unlinkSync(hookFile);
    return;
  }
  const json = readJson(hookFile);
  if (!json.hooks) return;
  if (json.hooks.PostToolUse) json.hooks.PostToolUse = stripOurs(json.hooks.PostToolUse);
  if (json.hooks.Stop) json.hooks.Stop = stripOurs(json.hooks.Stop);
  if (json.hooks.afterFileEdit) {
    json.hooks.afterFileEdit = json.hooks.afterFileEdit.filter(
      (e) => !String(e.command || '').includes(MARKER),
    );
  }
  writeJson(hookFile, json);
}
