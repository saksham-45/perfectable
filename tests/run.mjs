import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PKG_ROOT, install, uninstall } from '../src/install.mjs';
import { findRoot, inferProject, loadConfig, saveConfig, walkFiles } from '../skills/perfectable/scripts/lib.mjs';
import { detectFiles } from '../skills/perfectable/scripts/detect.mjs';
import { slugFromTarget } from '../skills/perfectable/scripts/critique-storage.mjs';

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
    if (typeof value === 'number' || typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else {
      const str = String(value);
      lines.push(`${key}: "${str.replace(/"/g, '\\"')}"`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

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

function fixture(name) {
  return path.join(PKG_ROOT, 'tests', 'fixtures', name);
}

// ===== detect tests =====
{
  const r = run(['detect', '--help']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Usage: detect/);
}

{
  const r = run(['version']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /2\.1\.0/);
}

{
  const f = fixture('clean-electron');
  const r = run(['detect', '--json', 'src'], f);
  assert.equal(r.status, 0, `Clean electron should pass: ${r.stdout}`);
  const json = JSON.parse(r.stdout);
  assert.equal(json.ok, true);
  assert.equal(json.findings.length, 0);
}

{
  const f = fixture('sloppy-electron');
  const r = run(['detect', '--json', 'src'], f);
  assert.equal(r.status, 2, `Sloppy electron should fail: ${r.stdout}`);
  const json = JSON.parse(r.stdout);
  const ids = json.findings.map((f) => f.id);
  assert.ok(ids.includes('electron-node-integration'), 'missing nodeIntegration');
  assert.ok(ids.includes('electron-no-context-isolation'), 'missing contextIsolation');
  assert.ok(ids.includes('electron-websecurity-off'), 'missing webSecurity');
  assert.ok(ids.includes('missing-titlebar-drag'), 'missing drag region');
  assert.ok(ids.includes('fake-traffic-lights'), 'fake traffic lights');
  assert.ok(ids.includes('vscode-activity-bar'), 'VS Code activity bar');
  assert.ok(ids.includes('touch-density-in-ide'), 'touch density');
  assert.ok(ids.includes('web-file-picker'), 'web file picker');
  assert.ok(ids.includes('modal-preferences'), 'modal preferences');
  assert.ok(ids.includes('pulsing-ai-dot'), 'pulsing AI dot');
  assert.ok(ids.includes('ai-ide-palette'), 'AI IDE palette');
  assert.ok(ids.includes('web-cta-in-chrome'), 'web CTA in chrome');
  assert.ok(ids.includes('status-gradient-text'), 'gradient text');
  assert.ok(ids.includes('no-focus-ring'), 'no focus ring');
  assert.ok(ids.includes('hover-only-affordance'), 'hover only affordance');
}

{
  const root = path.join(PKG_ROOT, 'skills', 'perfectable', 'fixtures');
  const cases = {
    'slop-editor.html': ['glass-on-content', 'marketing-radius-on-row', 'ios-body-in-chrome', 'centered-hero-in-shell'],
    'slop-three-pane.html': ['equal-pane-grid'],
    'slop-settings.html': ['equal-pane-grid', 'modal-preferences'],
    'slop-dashboard.html': ['metric-card-wall'],
    'briefing.html': [],
    'editor-first.html': [],
    'three-pane.html': [],
    'settings.html': [],
  };
  for (const [name, expected] of Object.entries(cases)) {
    const r = run(['detect', '--json', '--no-config', name], root);
    const json = JSON.parse(r.stdout || '{}');
    const ids = (json.findings || []).map((f) => f.id);
    if (expected.length === 0) {
      assert.equal(r.status, 0, `${name} should be clean: ${r.stdout}`);
    } else {
      assert.equal(r.status, 2, `${name} should fail: ${r.stdout}`);
      for (const id of expected) assert.ok(ids.includes(id), `${name} missing ${id}: ${ids.join(',')}`);
    }
  }
}

{
  const f = fixture('tauri-react');
  const r = run(['detect', '--json', 'src'], f);
  assert.equal(r.status, 0, `Tauri React should pass: ${r.stdout}`);
}

{
  const f = fixture('native-swiftui');
  const r = run(['detect', '--json', '.'], f);
  assert.equal(r.status, 0, `Native SwiftUI should pass: ${r.stdout}`);
}

{
  const f = fixture('native-winui');
  const r = run(['detect', '--json', '.'], f);
  assert.equal(r.status, 0, `Native WinUI should pass: ${r.stdout}`);
}

{
  const f = fixture('clean-electron');
  const r = run(['detect', '--json', '--immediate', 'src/renderer/index.html'], f);
  assert.equal(r.status, 0, `Immediate mode on clean should pass: ${r.stdout}`);
}

{
  const f = fixture('sloppy-electron');
  const r = run(['detect', '--json', '--immediate', 'src/renderer/settings-toolbar.html'], f);
  assert.equal(r.status, 2, `Immediate mode on sloppy HTML should fail: ${r.stdout}`);
  const json = JSON.parse(r.stdout);
  const ids = json.findings.map((f) => f.id);
  assert.ok(ids.includes('web-file-picker'), 'immediate: web file picker');
}

{
  const f = fixture('sloppy-electron');
  const r = run(['detect', '--json', '--immediate', 'src/renderer/activity-status-bar.css'], f);
  assert.equal(r.status, 2, `Immediate mode on sloppy CSS should fail: ${r.stdout}`);
  const json = JSON.parse(r.stdout);
  const ids = json.findings.map((f) => f.id);
  assert.ok(ids.includes('hover-only-affordance'), 'immediate: hover only');
  assert.ok(ids.includes('no-focus-ring'), 'immediate: no focus ring');
}

{
  const f = fixture('sloppy-electron');
  const r = run(['detect', '--json', '--format=junit', 'src'], f);
  assert.equal(r.status, 2);
  const xml = r.stdout;
  assert.match(xml, /<testsuite/);
  assert.match(xml, /<testcase/);
  assert.match(xml, /<failure/);
}

{
  const f = fixture('sloppy-electron');
  const r = run(['detect', '--json', '--format=sarif', 'src'], f);
  assert.equal(r.status, 2);
  const sarif = JSON.parse(r.stdout);
  assert.equal(sarif.version, '2.1.0');
  assert.ok(sarif.runs[0].results.length > 0);
}

// ===== context tests =====
{
  const f = fixture('clean-electron');
  const r = run(['context'], f);
  assert.equal(r.status, 0);
  const lines = r.stdout.trim().split('\n');
  const ctx = Object.fromEntries(lines.map(l => l.split('=')));
  const inferred = inferProject(f);
  // No APP.md: platform follows the host OS (darwin→macos, win32→windows, else linux).
  assert.equal(ctx.PLATFORM, inferred.platform);
  assert.equal(ctx.SHELL, 'electron');
  assert.equal(ctx.WINDOWING, 'workspace');
  assert.equal(ctx.INPUT, 'keyboard-first');
  assert.ok(ctx.APP.endsWith('APP.md') || ctx.APP === 'MISSING');
  assert.ok(ctx.CHROME.endsWith('CHROME.md') || ctx.CHROME === 'MISSING');
  assert.match(ctx.LOAD, new RegExp(`platforms/${inferred.platform}/${inferred.platform}\\.md`));
  assert.match(ctx.DETECTOR, /detect\.mjs/);
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { electron: '33' } }));
  fs.writeFileSync(path.join(dir, 'APP.md'), `# App\n\n## Platform\n\nmacos\n\n## Shell\n\nelectron\n`);
  const r = run(['context'], dir);
  assert.equal(r.status, 0, r.stderr);
  const ctx = Object.fromEntries(r.stdout.trim().split('\n').map((l) => l.split('=')));
  assert.equal(ctx.PLATFORM, 'macos');
  assert.equal(ctx.SHELL, 'electron');
  assert.match(ctx.LOAD, /platforms\/macos\/macos\.md/);
}

{
  const f = fixture('tauri-react');
  const r = run(['context'], f);
  assert.equal(r.status, 0);
  const lines = r.stdout.trim().split('\n');
  const ctx = Object.fromEntries(lines.map(l => l.split('=')));
  assert.equal(ctx.SHELL, 'tauri');
}

// ===== hooks tests =====
{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  const r = run(['hooks', 'status'], dir);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /enabled: false/);
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  const r = run(['hooks', 'on'], dir);
  assert.equal(r.status, 0);
  assert.ok(fs.existsSync(path.join(dir, '.perfectable', 'config.json')));
  const config = JSON.parse(fs.readFileSync(path.join(dir, '.perfectable', 'config.json'), 'utf8'));
  assert.equal(config.hook.enabled, true);
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  run(['hooks', 'on'], dir);
  const r = run(['hooks', 'ignore-rule', 'electron-node-integration'], dir);
  assert.equal(r.status, 0);
  const config = JSON.parse(fs.readFileSync(path.join(dir, '.perfectable', 'config.json'), 'utf8'));
  assert.ok(config.detector.ignoreRules.includes('electron-node-integration'));
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  run(['hooks', 'on'], dir);
  const r = run(['hooks', 'ignore-file', 'src/legacy/**'], dir);
  assert.equal(r.status, 0);
  const config = JSON.parse(fs.readFileSync(path.join(dir, '.perfectable', 'config.json'), 'utf8'));
  assert.ok(config.detector.ignoreFiles.includes('src/legacy/**'));
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  run(['hooks', 'on'], dir);
  const r = run(['hooks', 'off'], dir);
  assert.equal(r.status, 0);
  const config = JSON.parse(fs.readFileSync(path.join(dir, '.perfectable', 'config.json'), 'utf8'));
  assert.equal(config.hook.enabled, false);
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  run(['hooks', 'on'], dir);
  run(['hooks', 'ignore-rule', 'test-rule'], dir);
  const r = run(['hooks', 'reset'], dir);
  assert.equal(r.status, 0);
  assert.equal(fs.existsSync(path.join(dir, '.perfectable', 'config.json')), false);
}

// ===== providers tests =====
{
  const r = run(['providers']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /available: claude, cursor, grok, agents, codex, gemini, github, opencode/);
}

// ===== install/uninstall tests =====
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

{
  const dir = tmp();
  install({ cwd: dir, scope: 'project', providers: ['agents'], hooks: false, link: true });
  const dest = path.join(dir, '.agents', 'skills', 'perfectable');
  assert.ok(fs.lstatSync(dest).isSymbolicLink());
  assert.ok(fs.existsSync(path.join(dest, 'SKILL.md')));
}

// ===== lib.mjs tests =====
{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { electron: '33' } }));
  fs.writeFileSync(path.join(dir, 'APP.md'), `# App\n\n## Platform\n\nmacos\n\n## Shell\n\nelectron\n`);
  const root = findRoot(dir);
  assert.equal(root, dir);
}

{
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { '@tauri-apps/api': '2' } }));
  fs.writeFileSync(path.join(dir, 'APP.md'), `# App\n\n## Platform\n\nwindows\n\n## Shell\n\ntauri\n`);
  const info = inferProject(dir);
  assert.equal(info.platform, 'windows');
  assert.equal(info.shell, 'tauri');
  assert.equal(info.desktop, true);
}

{
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'src'));
  fs.writeFileSync(path.join(dir, 'src', 'main.ts'), 'console.log("hello")');
  fs.writeFileSync(path.join(dir, 'src', 'style.css'), 'body {}');
  fs.writeFileSync(path.join(dir, 'README.md'), '# Readme');
  const files = walkFiles(dir);
  assert.ok(files.some(f => f.endsWith('main.ts')));
  assert.ok(files.some(f => f.endsWith('style.css')));
  assert.ok(!files.some(f => f.endsWith('README.md')));
}

{
  const dir = tmp();
  fs.mkdirSync(path.join(dir, '.perfectable'));
  const config = { hook: { enabled: true }, detector: { ignoreRules: ['rule1'], ignoreFiles: ['src/legacy/**'] } };
  saveConfig(dir, config);
  const loaded = loadConfig(dir);
  assert.equal(loaded.hook.enabled, true);
  assert.deepEqual(loaded.detector.ignoreRules, ['rule1']);
  assert.deepEqual(loaded.detector.ignoreFiles, ['src/legacy/**']);
}

{
  const dir = tmp();
  const slug = slugFromTarget('/Users/saksham/project/src/Titlebar.tsx');
  assert.equal(slug, 'titlebar-tsx');
}

{
  const dir = tmp();
  const slug = slugFromTarget('.');
  assert.equal(slug, null);
}

{
  const dir = tmp();
  const slug = slugFromTarget('https://example.com/project/');
  assert.equal(slug, 'project');
}

{
  const now = new Date('2026-01-15T10:30:00.000Z');
  const s = stamp(now);
  assert.equal(s, '2026-01-15T10-30-00Z');
}

{
  const front = parseFront(`---\ntitle: "Test"\ncount: 42\nflag: true\n---\nbody`);
  assert.equal(front.title, 'Test');
  assert.equal(front.count, 42);
  assert.equal(front.flag, 'true');
}

{
  const serialized = serializeFront({ title: 'Test', count: 42, flag: true });
  assert.match(serialized, /title: "Test"/);
  assert.match(serialized, /count: 42/);
  assert.match(serialized, /flag: true/);
}

// ===== critique-storage tests =====
{
  const dir = tmp();
  fs.mkdirSync(path.join(dir, '.perfectable', 'critique'), { recursive: true });
  const slug = 'test-target';
  const now = new Date();
  const filePath = path.join(dir, '.perfectable', 'critique', `${now.toISOString().replace(/[:.]/g, '-').replace(/-\d{3}Z$/, 'Z')}__${slug}.md`);
  const front = `---\ntimestamp: "${now.toISOString()}"\nslug: "${slug}"\ntotal_score: 42\nmax_score: 56\n---\n`;
  fs.writeFileSync(filePath, `${front}\nTest critique body\n`);

  const files = fs.readdirSync(path.join(dir, '.perfectable', 'critique'))
    .filter(f => f.endsWith(`__${slug}.md`))
    .map(f => path.join(dir, '.perfectable', 'critique', f))
    .sort();
  assert.equal(files.length, 1);
  assert.equal(files[0], filePath);
}

// ===== detector core tests =====
{
  const f = fixture('clean-electron');
  const files = walkFiles(path.join(f, 'src'));
  const fileObjs = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(f, file), content };
  });
  const info = inferProject(f);
  const config = loadConfig(f);
  const findings = await detectFiles(fileObjs, { config, ctx: info, immediate: false });
  assert.equal(findings.length, 0, `Clean electron should have no findings: ${JSON.stringify(findings, null, 2)}`);
}

{
  const f = fixture('sloppy-electron');
  const files = walkFiles(path.join(f, 'src'));
  const fileObjs = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(f, file), content };
  });
  const info = inferProject(f);
  const config = loadConfig(f);
  const findings = await detectFiles(fileObjs, { config, ctx: info, immediate: false });
  const ids = findings.map(f => f.id);
  assert.ok(ids.includes('electron-node-integration'));
  assert.ok(ids.includes('electron-no-context-isolation'));
  assert.ok(ids.includes('electron-websecurity-off'));
  assert.ok(ids.includes('missing-titlebar-drag'));
  assert.ok(ids.includes('fake-traffic-lights'));
  assert.ok(ids.includes('vscode-activity-bar'));
  assert.ok(ids.includes('touch-density-in-ide'));
  assert.ok(ids.includes('web-file-picker'));
  assert.ok(ids.includes('modal-preferences'));
  assert.ok(ids.includes('pulsing-ai-dot'));
  assert.ok(ids.includes('ai-ide-palette'));
  assert.ok(ids.includes('web-cta-in-chrome'));
  assert.ok(ids.includes('status-gradient-text'));
  assert.ok(ids.includes('no-focus-ring'));
  assert.ok(ids.includes('hover-only-affordance'));
  assert.ok(findings.length >= 15, `Expected >=15 findings, got ${findings.length}`);
}

{
  const f = fixture('tauri-react');
  const files = walkFiles(path.join(f, 'src'));
  const fileObjs = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(f, file), content };
  });
  const info = inferProject(f);
  const config = loadConfig(f);
  const findings = await detectFiles(fileObjs, { config, ctx: info, immediate: false });
  assert.equal(findings.length, 0, `Tauri React should have no findings: ${JSON.stringify(findings, null, 2)}`);
}

{
  const f = fixture('clean-electron');
  const files = walkFiles(path.join(f, 'src'));
  const fileObjs = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(f, file), content };
  });
  const info = inferProject(f);
  const config = loadConfig(f);
  config.detector.ignoreRules = ['overused-dev-font'];
  const findings = await detectFiles(fileObjs, { config, ctx: info, immediate: false });
  const ids = findings.map(f => f.id);
  assert.ok(!ids.includes('overused-dev-font'), 'ignoreRules should work');
}

// ===== custom rules test =====
{
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'src'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { electron: '33' } }));
  fs.writeFileSync(path.join(dir, 'src', 'main.js'), `const x = 'FORBIDDEN_PATTERN';\n`);

  const customRulesDir = path.join(dir, '.perfectable', 'rules');
  fs.mkdirSync(customRulesDir, { recursive: true });
  fs.writeFileSync(path.join(customRulesDir, 'forbidden-pattern.mjs'), `
export const RULES = [{
  id: 'forbidden-pattern',
  category: 'custom',
  severity: 'error',
  name: 'Forbidden pattern',
  description: 'FORBIDDEN_PATTERN is not allowed',
  test(file, content) {
    const out = [];
    for (const m of content.matchAll(/FORBIDDEN_PATTERN/g)) {
      out.push({
        id: this.id, name: this.name, category: this.category, severity: this.severity,
        file, line: content.slice(0, m.index).split('\\n').length,
        snippet: content.slice(Math.max(0, m.index - 40), m.index + 40).trim(),
        message: this.description
      });
    }
    return out;
  }
}];
`);

  fs.writeFileSync(path.join(dir, '.perfectable', 'config.json'), JSON.stringify({
    hook: { enabled: false },
    detector: { ignoreRules: [], ignoreFiles: [], customRules: ['./.perfectable/rules/forbidden-pattern.mjs'] }
  }, null, 2));

  const files = walkFiles(dir);
  const fileObjs = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    return { file, rel: path.relative(dir, file), content };
  });
  const info = inferProject(dir);
  const config = loadConfig(dir);
  const findings = await detectFiles(fileObjs, { config, ctx: info, immediate: false });
  const ids = findings.map(f => f.id);
  assert.ok(ids.includes('forbidden-pattern'), 'Custom rules should work');
}

process.stdout.write('\n✅ All tests passed\n');