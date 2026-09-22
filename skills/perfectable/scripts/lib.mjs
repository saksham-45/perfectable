import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLATFORMS_DIR = path.join(SKILL_DIR, 'platforms');

export const UI_EXTS = new Set([
  '.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.vue', '.svelte',
  '.css', '.scss', '.sass', '.less', '.html', '.json', '.toml',
]);

export const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', 'release', 'target', '.git',
  '.next', '.output', '.cache', 'coverage', '.perfectable', 'vendor',
]);

const ROOT_MARKERS = [
  'APP.md', 'CHROME.md', '.perfectable', 'package.json', 'src-tauri',
  'Cargo.toml', '.git',
  // Native project markers (exact files)
  'Package.swift', '.xcodeproj', '.xcworkspace', 'Package.resolved',
  // Native project markers (extensions - checked via glob)
];

const ROOT_MARKER_EXTS = [
  '.csproj', '.sln', '.appxmanifest',
];

export function findRoot(cwd = process.cwd()) {
  let dir = path.resolve(cwd);
  const { root, homedir } = { root: path.parse(dir).root, homedir: process.env.HOME };
  let fallback = dir;
  while (true) {
    // Check exact file markers
    if (ROOT_MARKERS.some((m) => fs.existsSync(path.join(dir, m)))) return dir;
    // Check extension markers
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && ROOT_MARKER_EXTS.some(ext => entry.name.endsWith(ext))) return dir;
      }
    } catch {}
    if (dir === root || dir === homedir) return fallback;
    dir = path.dirname(dir);
  }
}

export function configPath(root) {
  return path.join(root, '.perfectable', 'config.json');
}

export function loadConfig(root) {
  const file = configPath(root);
  if (!fs.existsSync(file)) {
    return { hook: { enabled: false }, detector: { ignoreRules: [], ignoreFiles: [], customRules: [] } };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      hook: { enabled: Boolean(raw?.hook?.enabled) },
      detector: {
        ignoreRules: Array.isArray(raw?.detector?.ignoreRules) ? raw.detector.ignoreRules : [],
        ignoreFiles: Array.isArray(raw?.detector?.ignoreFiles) ? raw.detector.ignoreFiles : [],
        customRules: Array.isArray(raw?.detector?.customRules) ? raw.detector.customRules : [],
      },
    };
  } catch {
    return { hook: { enabled: false }, detector: { ignoreRules: [], ignoreFiles: [], customRules: [] } };
  }
}

export function saveConfig(root, config) {
  const dir = path.join(root, '.perfectable');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath(root), JSON.stringify(config, null, 2) + '\n');
}

export function globToRegExp(glob) {
  const escaped = String(glob)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${escaped}$`);
}

export function matchGlob(rel, glob) {
  const re = globToRegExp(glob);
  const posix = rel.split(path.sep).join('/');
  return re.test(posix) || re.test(path.basename(posix));
}

export function shouldIgnoreFile(rel, config) {
  return (config.detector.ignoreFiles || []).some((g) => matchGlob(rel, g));
}

export function shouldIgnoreRule(id, config) {
  return (config.detector.ignoreRules || []).includes(id);
}

export function isUiFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  if (base === 'tauri.conf.json' || base === 'tauri.conf.json5') return true;
  return UI_EXTS.has(ext);
}

export function walkFiles(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.') && ent.name !== '.perfectable') {
        if (ent.isDirectory()) continue;
      }
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name) || ent.name.startsWith('.')) continue;
        walk(full);
      } else if (ent.isFile() && isUiFile(full)) {
        out.push(full);
      }
    }
  }
  walk(root);
  return out;
}

export function inferProject(root) {
  const pkgPath = path.join(root, 'package.json');
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    pkg = {};
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const hasTauri = fs.existsSync(path.join(root, 'src-tauri')) || Boolean(deps['@tauri-apps/api']);
  const hasElectron = Boolean(deps.electron);
  
  // Detect native projects
  const hasSwiftUI = fs.existsSync(path.join(root, 'Package.swift')) || 
    fs.readdirSync(root).some(f => f.endsWith('.xcodeproj') || f.endsWith('.xcworkspace')) ||
    fs.existsSync(path.join(root, 'Package.resolved'));
  const hasWinUI = fs.readdirSync(root).some(f => f.endsWith('.csproj') || f.endsWith('.sln')) ||
    fs.existsSync(path.join(root, 'Package.appxmanifest'));
  const hasGTK = fs.existsSync(path.join(root, 'meson.build')) || 
    fs.existsSync(path.join(root, 'CMakeLists.txt')) && 
    fs.readFileSync(path.join(root, 'CMakeLists.txt'), 'utf8').includes('gtk');
  
  const appPath = path.join(root, 'APP.md');
  let app = '';
  if (fs.existsSync(appPath)) app = fs.readFileSync(appPath, 'utf8');

  function heading(name) {
    const re = new RegExp(`^## ${name}\\s*$\\n+([a-z0-9-]+)`, 'mi');
    const m = app.match(re);
    return m ? m[1].toLowerCase() : '';
  }

  function getSchemaVersion(content, schemaName) {
    const re = new RegExp(`<!--\\s*perfectable:${schemaName}-schema\\s+(\\d+)\\s*-->`);
    const m = content.match(re);
    return m ? parseInt(m[1], 10) : 0;
  }

  function parsePersonasFromApp(app) {
    const personas = [];
    const sectionMatch = app.match(/^## Personas\s*$/im);
    if (!sectionMatch) return personas;
    
    const afterSection = app.slice(sectionMatch.index + sectionMatch[0].length);
    const nextSection = afterSection.match(/^## \w+/m);
    const sectionContent = nextSection ? afterSection.slice(0, nextSection.index) : afterSection;
    
    // Simple YAML-like parsing for personas
    const personaBlocks = sectionContent.split(/^-\s+name:/m).slice(1);
    for (const block of personaBlocks) {
      const nameMatch = block.match(/name:\s*"([^"]+)"/);
      const testsMatch = block.match(/tests:\s*\[([^\]]+)\]/);
      const redFlagsMatch = block.match(/red_flags:\s*\[([^\]]+)\]/);
      if (nameMatch) {
        personas.push({
          name: nameMatch[1],
          tests: testsMatch ? testsMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')) : [],
          red_flags: redFlagsMatch ? redFlagsMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')) : [],
        });
      }
    }
    return personas;
  }

  const appSchemaVersion = getSchemaVersion(app, 'app');
  const CURRENT_APP_SCHEMA = 2;
  if (appSchemaVersion && appSchemaVersion < CURRENT_APP_SCHEMA) {
    console.warn(`[perfectable] APP.md schema version ${appSchemaVersion} < current ${CURRENT_APP_SCHEMA}. Consider running 'init' to migrate.`);
  }

  const platform = heading('Platform') || (
    process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux'
  );
  
  let shell = heading('Shell');
  if (!shell) {
    if (hasTauri) shell = 'tauri';
    else if (hasElectron) shell = 'electron';
    else if (hasSwiftUI) shell = 'swiftui';
    else if (hasWinUI) shell = 'winui';
    else if (hasGTK) shell = 'gtk';
    else shell = 'unknown';
  }
  
  const windowing = heading('Windowing') || 'workspace';
  const input = heading('Input') || 'keyboard-first';
  const personas = parsePersonasFromApp(app);

  const desktop = hasElectron || hasTauri || hasSwiftUI || hasWinUI || hasGTK || shell === 'native';

  return {
    platform,
    shell,
    windowing,
    input,
    hasElectron,
    hasTauri,
    hasSwiftUI,
    hasWinUI,
    hasGTK,
    desktop,
    appPath: fs.existsSync(appPath) ? appPath : null,
    chromePath: fs.existsSync(path.join(root, 'CHROME.md')) ? path.join(root, 'CHROME.md') : null,
    appSchemaVersion,
    chromeSchemaVersion: 0,
    personas,
  };
}

export function parseInlineIgnores(content) {
  const lines = content.split(/\r?\n/);
  const file = new Set();
  const perLine = new Map();
  let pending = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fileDisable = line.match(/perfectable-disable(?:-file)?\s+([a-z0-9-]+(?:,\s*[a-z0-9-]+)*|\*)/i);
    if (fileDisable && !/perfectable-disable-(?:next-)?line/i.test(line)) {
      for (const id of fileDisable[1].split(',').map((s) => s.trim())) file.add(id);
    }
    const next = line.match(/perfectable-disable-next-line\s+([a-z0-9-]+(?:,\s*[a-z0-9-]+)*|\*)/i);
    if (next) {
      pending = new Set(next[1].split(',').map((s) => s.trim()));
      continue;
    }
    const here = line.match(/perfectable-disable-line\s+([a-z0-9-]+(?:,\s*[a-z0-9-]+)*|\*)/i);
    const set = new Set(pending);
    if (here) for (const id of here[1].split(',').map((s) => s.trim())) set.add(id);
    if (set.size) perLine.set(i + 1, set);
    pending = new Set();
  }
  return { file, perLine };
}

export function lineOf(content, index) {
  if (index < 0) return 1;
  return content.slice(0, index).split(/\r?\n/).length;
}

export function snippetAt(content, index, len = 80) {
  const lineStart = content.lastIndexOf('\n', index) + 1;
  let lineEnd = content.indexOf('\n', index);
  if (lineEnd < 0) lineEnd = content.length;
  return content.slice(lineStart, lineEnd).trim().slice(0, len);
}

export function loadPlatformPack(platform) {
  const packDir = path.join(PLATFORMS_DIR, platform);
  const readmePath = path.join(packDir, 'README.md');
  const guidePath = path.join(packDir, `${platform}.md`);
  
  return {
    platform,
    readme: fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : '',
    guide: fs.existsSync(guidePath) ? fs.readFileSync(guidePath, 'utf8') : '',
  };
}

export function loadAllPlatformPacks() {
  const platforms = ['macos', 'windows', 'linux', 'adaptive'];
  return Object.fromEntries(
    platforms.map(p => [p, loadPlatformPack(p)])
  );
}
