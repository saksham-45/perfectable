import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PKG_ROOT, install, uninstall } from '../src/install.mjs';

const bin = path.join(PKG_ROOT, 'bin', 'perfectable.mjs');

function run(args, cwd) {
  return spawnSync(process.execPath, [bin, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'perfectable-pkg-'));
}

// detect --help
{
  const r = run(['detect', '--help']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Usage: detect/);
}

// version
{
  const r = run(['version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /1\.0\.0/);
}

// detector on fixture
{
  const fixture = tmp();
  fs.mkdirSync(path.join(fixture, 'src'));
  fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ dependencies: { electron: '33' } }));
  fs.writeFileSync(
    path.join(fixture, 'src', 'main.js'),
    `new BrowserWindow({ webPreferences: { nodeIntegration: true, contextIsolation: false } })\n`,
  );
  const r = run(['detect', '--json', 'src'], fixture);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  const json = JSON.parse(r.stdout);
  const ids = json.findings.map((f) => f.id);
  assert.ok(ids.includes('electron-node-integration'));
  assert.ok(ids.includes('electron-no-context-isolation'));
  assert.ok(ids.includes('missing-native-menu'));
}

// install copies into harness folders
{
  const dir = tmp();
  const result = install({
    cwd: dir,
    scope: 'project',
    providers: ['claude', 'cursor', 'grok', 'codex', 'github'],
    hooks: true,
    link: false,
  });
  assert.equal(result.results.length, 5);
  for (const id of ['claude', 'cursor', 'grok', 'codex', 'github']) {
    const skill = path.join(dir, `.${id === 'github' ? 'github' : id}`, 'skills', 'perfectable', 'SKILL.md');
    // github uses .github/skills
    const p = id === 'github'
      ? path.join(dir, '.github', 'skills', 'perfectable', 'SKILL.md')
      : path.join(dir, `.${id}`, 'skills', 'perfectable', 'SKILL.md');
    assert.ok(fs.existsSync(p), `missing ${p}`);
  }
  assert.ok(fs.existsSync(path.join(dir, '.grok', 'hooks', 'perfectable.json')));
  assert.ok(fs.existsSync(path.join(dir, '.github', 'hooks', 'perfectable.json')));
  const claude = JSON.parse(fs.readFileSync(path.join(dir, '.claude', 'settings.json'), 'utf8'));
  assert.ok(claude.hooks.PostToolUse.length >= 1);
  const cursor = JSON.parse(fs.readFileSync(path.join(dir, '.cursor', 'hooks.json'), 'utf8'));
  assert.ok(cursor.hooks.afterFileEdit.length >= 1);

  uninstall({ cwd: dir, scope: 'project', providers: ['claude', 'cursor', 'grok'] });
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'skills', 'perfectable')), false);
  assert.equal(fs.existsSync(path.join(dir, '.grok', 'hooks', 'perfectable.json')), false);
}

// link mode
{
  const dir = tmp();
  install({ cwd: dir, scope: 'project', providers: ['agents'], hooks: false, link: true });
  const dest = path.join(dir, '.agents', 'skills', 'perfectable');
  assert.ok(fs.lstatSync(dest).isSymbolicLink());
  assert.ok(fs.existsSync(path.join(dest, 'SKILL.md')));
}

process.stdout.write('ok\n');
