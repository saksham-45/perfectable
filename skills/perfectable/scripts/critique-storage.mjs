#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { findRoot } from './lib.mjs';

function critiqueDir(root) {
  return path.join(root, '.perfectable', 'critique');
}

export function slugFromTarget(target) {
  const raw = String(target || '').trim();
  if (!raw || raw === '.' || raw === '/' || raw === './') return null;
  let s = raw.replace(/^[a-z]+:\/\//i, '');
  s = path.basename(s.replace(/\/+$/, '')) || s;
  s = s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!s || s === 'app.md' && raw.endsWith('/')) return null;
  return s.slice(0, 80) || null;
}

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').replace(/-\d{3}Z$/, 'Z');
}

function parseFront(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = /^\d+$/.test(val) ? Number(val) : val;
  }
  return out;
}

function serializeFront(obj) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const str = String(value);
    lines.push(str.includes(':') || str.includes('#') ? `${key}: "${str.replace(/"/g, '\\"')}"` : `${key}: ${str}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function listSnapshots(root, slug) {
  const dir = critiqueDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(`__${slug}.md`))
    .map((f) => path.join(dir, f))
    .sort();
}

function cmdSlug(target) {
  const slug = slugFromTarget(target);
  if (!slug) {
    process.stderr.write('perfectable: cannot slug that target\n');
    process.exit(2);
  }
  process.stdout.write(slug + '\n');
}

function cmdWrite(target, bodyFile) {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) {
    process.stderr.write('perfectable: cannot slug that target\n');
    process.exit(2);
  }
  let meta = {};
  if (process.env.PERFECTABLE_CRITIQUE_META) {
    try { meta = JSON.parse(process.env.PERFECTABLE_CRITIQUE_META); } catch { meta = {}; }
  }
  const body = fs.readFileSync(bodyFile, 'utf8');
  const dir = critiqueDir(root);
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const filePath = path.join(dir, `${stamp(now)}__${slug}.md`);
  const front = serializeFront({ ...meta, timestamp: now.toISOString(), slug });
  fs.writeFileSync(filePath, `${front}\n${body.trim()}\n`);
  process.stdout.write(filePath + '\n');
}

function cmdLatest(target) {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) process.exit(2);
  const files = listSnapshots(root, slug);
  if (!files.length) process.exit(2);
  process.stdout.write(fs.readFileSync(files[files.length - 1], 'utf8'));
}

function cmdTrend(target, limit = 5) {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) process.exit(2);
  const files = listSnapshots(root, slug).slice(-Number(limit) || 5);
  const entries = files.map((f) => {
    const front = parseFront(fs.readFileSync(f, 'utf8'));
    return {
      file: f,
      total_score: front.total_score ?? null,
      max_score: front.max_score ?? 56,
      p0_count: front.p0_count ?? 0,
      p1_count: front.p1_count ?? 0,
      timestamp: front.timestamp ?? null,
    };
  });
  process.stdout.write(JSON.stringify(entries, null, 2) + '\n');
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'slug') cmdSlug(rest[0]);
else if (cmd === 'write') cmdWrite(rest[0], rest[1]);
else if (cmd === 'latest') cmdLatest(rest[0]);
else if (cmd === 'trend') cmdTrend(rest[0], rest[1]);
else {
  process.stderr.write('Usage: critique-storage.mjs slug|write|latest|trend <target> [body-file|limit]\n');
  process.exit(1);
}
