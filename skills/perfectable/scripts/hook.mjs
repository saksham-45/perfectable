#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findRoot, inferProject, isUiFile, loadConfig } from './lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DETECT = path.join(SCRIPT_DIR, 'detect.mjs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function parseEvent(raw) {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function eventName(ev) {
  return ev.hook_event_name || ev.hookEventName || '';
}

function fileFromToolInput(input) {
  if (!input || typeof input !== 'object') return null;
  return input.file_path || input.target_file || input.path || input.filePath || null;
}

function gitChanged(cwd) {
  const r = spawnSync('git', ['diff', '--name-only', 'HEAD'], { cwd, encoding: 'utf8' });
  if (r.status !== 0) return [];
  return (r.stdout || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

function runDetect(args, cwd) {
  const r = spawnSync(process.execPath, [DETECT, '--json', ...args], { cwd, encoding: 'utf8' });
  try {
    return JSON.parse(r.stdout || '{}');
  } catch {
    return { ok: true, findings: [] };
  }
}

function formatFindings(findings, cap = 12) {
  const shown = findings.slice(0, cap);
  const lines = shown.map((f) => `- ${f.file}:${f.line} [${f.severity}] ${f.id} — ${f.name}`);
  if (findings.length > cap) lines.push(`- … ${findings.length - cap} more`);
  return lines.join('\n');
}

function emitContext(text) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: text,
    },
  }) + '\n');
}

function emitStopContext(text) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'Stop',
      additionalContext: text,
    },
  }) + '\n');
}

const stopMode = process.argv.includes('--stop');
const ev = parseEvent(readStdin());
const cwd = ev.cwd || ev.workspaceRoot || process.cwd();
const root = findRoot(cwd);
const config = loadConfig(root);
if (!config.hook.enabled) process.exit(0);

const info = inferProject(root);
if (!info.desktop && info.shell === 'unknown' && !info.appPath) process.exit(0);

if (stopMode || /stop/i.test(eventName(ev))) {
  const changed = gitChanged(root).filter((rel) => isUiFile(path.join(root, rel)));
  if (!changed.length) process.exit(0);
  const result = runDetect(changed, root);
  const findings = result.findings || [];
  if (!findings.length) process.exit(0);
  emitStopContext(
    `Perfectable detector (session pass) found ${findings.length} issue(s) in files touched this session:\n${formatFindings(findings)}\nFix real problems. Do not ignore a finding to push a write through. Inline: perfectable-disable-next-line <id>.`,
  );
  process.exit(0);
}

const filePath = fileFromToolInput(ev.toolInput);
if (!filePath || !isUiFile(filePath)) process.exit(0);

const result = runDetect(['--immediate', filePath], root);
const findings = result.findings || [];
if (!findings.length) process.exit(0);

emitContext(
  `Perfectable detector flagged ${findings.length} issue(s) in ${path.relative(root, filePath) || filePath}:\n${formatFindings(findings)}\nFix before moving on. $perfectable hooks ignore-rule <id> only for a confirmed exception.`,
);
process.exit(0);
