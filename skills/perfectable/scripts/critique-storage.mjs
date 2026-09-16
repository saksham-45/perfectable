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
  s = s.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!s || s === 'app-md' && raw.endsWith('/')) return null;
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
  if (process.env.WORKBENCH_CRITIQUE_META) {
    try { meta = JSON.parse(process.env.WORKBENCH_CRITIQUE_META); } catch { meta = {}; }
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

function cmdList(target) {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) process.exit(2);
  const dir = critiqueDir(root);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith(`__${slug}.md`))
    .map(f => path.join(dir, f))
    .sort();
  for (const f of files) {
    const front = parseFront(fs.readFileSync(f, 'utf8'));
    process.stdout.write(`${front.slug || 'unknown'}\t${front.timestamp || 'unknown'}\t${front.total_score ?? 'N/A'}/${front.max_score ?? 56}\t${f}\n`);
  }
}

function cmdCompare(target, baseFile, headFile) {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) process.exit(2);
  
  const base = parseFront(fs.readFileSync(baseFile, 'utf8'));
  const head = parseFront(fs.readFileSync(headFile, 'utf8'));
  
  const baseScore = base.total_score ?? 0;
  const headScore = head.total_score ?? 0;
  const baseMax = base.max_score ?? 56;
  const headMax = head.max_score ?? 56;
  
  process.stdout.write(`Comparison for ${slug}:\n`);
  process.stdout.write(`  Base: ${baseScore}/${baseMax} (${base.timestamp || 'unknown'})\n`);
  process.stdout.write(`  Head: ${headScore}/${headMax} (${head.timestamp || 'unknown'})\n`);
  process.stdout.write(`  Delta: ${headScore - baseScore > 0 ? '+' : ''}${headScore - baseScore}\n`);
  
  if (base.p0_count !== undefined || head.p0_count !== undefined) {
    process.stdout.write(`  P0: ${base.p0_count || 0} → ${head.p0_count || 0}\n`);
  }
  if (base.p1_count !== undefined || head.p1_count !== undefined) {
    process.stdout.write(`  P1: ${base.p1_count || 0} → ${head.p1_count || 0}\n`);
  }
}

function cmdExport(target, format = 'json') {
  const root = findRoot();
  const slug = slugFromTarget(target);
  if (!slug) process.exit(2);
  
  const files = listSnapshots(root, slug);
  const entries = files.map(f => {
    const front = parseFront(fs.readFileSync(f, 'utf8'));
    const body = fs.readFileSync(f, 'utf8').split('\n').slice(1).join('\n').replace(/^---/, '').trim();
    return { ...front, body };
  });
  
  if (format === 'json') {
    process.stdout.write(JSON.stringify(entries, null, 2) + '\n');
  } else if (format === 'csv') {
    const headers = ['timestamp', 'slug', 'total_score', 'max_score', 'p0_count', 'p1_count', 'body'];
    process.stdout.write(headers.join(',') + '\n');
    for (const e of entries) {
      const row = headers.map(h => {
        const v = e[h] ?? '';
        return `"${String(v).replace(/"/g, '""')}"`;
      });
      process.stdout.write(row.join(',') + '\n');
    }
  } else if (format === 'markdown') {
    process.stdout.write(`# Critique History for ${slug}\n\n`);
    process.stdout.write(`| Date | Score | P0 | P1 | Max |\n|------|-------|----|----|-----|\n`);
    for (const e of entries) {
      const date = e.timestamp ? new Date(e.timestamp).toLocaleDateString() : 'unknown';
      process.stdout.write(`| ${date} | ${e.total_score ?? 'N/A'}/${e.max_score ?? 56} | ${e.p0_count ?? 0} | ${e.p1_count ?? 0} | ${e.max_score ?? 56} |\n`);
    }
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  if (cmd === 'slug') cmdSlug(rest[0]);
  else if (cmd === 'write') cmdWrite(rest[0], rest[1]);
  else if (cmd === 'latest') cmdLatest(rest[0]);
  else if (cmd === 'trend') cmdTrend(rest[0], rest[1]);
  else if (cmd === 'list') cmdList(rest[0]);
  else if (cmd === 'compare') cmdCompare(rest[0], rest[1], rest[2]);
  else if (cmd === 'export') cmdExport(rest[0], rest[1] || 'json');
  else {
    process.stderr.write('Usage: critique-storage.mjs slug|write|latest|trend|list|compare|export <target> [args...]\n');
    process.exit(1);
  }
}
