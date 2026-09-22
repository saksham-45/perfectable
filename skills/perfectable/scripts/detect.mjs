#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findRoot,
  inferProject,
  isUiFile,
  lineOf,
  loadConfig,
  parseInlineIgnores,
  shouldIgnoreFile,
  shouldIgnoreRule,
  snippetAt,
  walkFiles,
} from './lib.mjs';

function finish(code) {
  process.stdout.write('', () => process.exit(code));
}

function sameFile(a, b) {
  try {
    return fs.realpathSync(a) === fs.realpathSync(b);
  } catch {
    return path.resolve(a) === path.resolve(b);
  }
}

const OVERUSED_FONTS = /\b(Inter|Geist(?:\s+Sans)?|Plus Jakarta Sans|Space Grotesk)\b/;
const AI_PURPLE = /#(?:7c3aed|8b5cf6|a78bfa|6d28d9|8b5cf6|7c3aed)\b/i;
const AI_NEAR_BLACK = /#(?:0a0a0a|09090b|0c0c0e|111111|0f0f10)\b/i;
const TREE_FILE = /tree|sidebar|explorer|file-tree|filetree|navigator/i;
const CHROME_FILE = /titlebar|title-bar|toolbar|activity|status|menubar|window-controls/i;
const SETTINGS_FILE = /settings|preferences|options/i;
const EDITOR_FILE = /editor|buffer|monaco|codemirror/i;

function hit(rule, file, content, index, extra = {}) {
  return {
    id: rule.id,
    name: rule.name,
    category: rule.category,
    severity: rule.severity,
    file,
    line: lineOf(content, index),
    snippet: snippetAt(content, Math.max(0, index)),
    message: rule.description,
    ...extra,
  };
}

function matchesAll(content, regexes) {
  return regexes.every((re) => re.test(content));
}

export const RULES = [
  {
    id: 'electron-node-integration',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'Node integration in renderer',
    description: 'nodeIntegration: true exposes Node in the renderer. Keep it false and use a preload with contextIsolation.',
    test(file, content) {
      const out = [];
      for (const m of content.matchAll(/\bnodeIntegration\s*:\s*true\b/g)) {
        out.push(hit(this, file, content, m.index));
      }
      return out;
    },
  },
  {
    id: 'electron-no-context-isolation',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'contextIsolation disabled',
    description: 'contextIsolation: false lets the renderer touch the preload world. Leave it true.',
    test(file, content) {
      const out = [];
      for (const m of content.matchAll(/\bcontextIsolation\s*:\s*false\b/g)) {
        out.push(hit(this, file, content, m.index));
      }
      return out;
    },
  },
  {
    id: 'electron-websecurity-off',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'webSecurity disabled',
    description: 'webSecurity: false turns off same-origin checks. Do not ship this.',
    test(file, content) {
      const out = [];
      for (const m of content.matchAll(/\bwebSecurity\s*:\s*false\b/g)) {
        out.push(hit(this, file, content, m.index));
      }
      return out;
    },
  },
  {
    id: 'missing-titlebar-drag',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'Custom titlebar has no drag region',
    description: 'Hidden or frameless window without -webkit-app-region: drag. The window cannot be moved.',
    test(file, content, ctx) {
      const custom = /titleBarStyle\s*:\s*['"]hidden(?:Inset)?['"]/.test(content) || /\bframe\s*:\s*false\b/.test(content);
      const drag = /-webkit-app-region\s*:\s*drag/.test(content) || /app-region:\s*drag/.test(content) || /WebkitAppRegion['"]?\s*:\s*['"]drag['"]/.test(content);
      if (ctx?.immediate && custom && !drag) {
        return [hit(this, file, content, content.search(/titleBarStyle|\bframe\s*:/))];
      }
      if (!CHROME_FILE.test(file)) return [];
      const looksBar = /titlebar|title-bar|window-controls/i.test(file) || /className=["'][^"']*titlebar/i.test(content);
      if (looksBar && !drag) return [hit(this, file, content, content.search(/titlebar|title-bar|WebkitAppRegion/))];
      return [];
    },
  },
  {
    id: 'no-drag-on-controls',
    category: 'platform',
    severity: 'warning',
    immediate: true,
    name: 'Drag region swallows controls',
    description: 'Titlebar is marked drag but buttons never set no-drag, so clicks miss.',
    test(file, content) {
      const drag = /-webkit-app-region\s*:\s*drag|WebkitAppRegion['"]?\s*:\s*['"]drag['"]/.test(content);
      const noDrag = /-webkit-app-region\s*:\s*no-drag|WebkitAppRegion['"]?\s*:\s*['"]no-drag['"]/.test(content);
      if (drag && !noDrag && CHROME_FILE.test(file)) {
        return [hit(this, file, content, content.search(/app-region|WebkitAppRegion/))];
      }
      return [];
    },
  },
  {
    id: 'web-file-picker',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'Web file picker',
    description: 'Use the OS file dialog (Electron dialog / Tauri dialog plugin), not <input type="file">.',
    test(file, content, ctx) {
      if (!ctx.desktop) return [];
      const out = [];
      for (const m of content.matchAll(/<input\b[^>]*type\s*=\s*['"]file['"]/gi)) {
        out.push(hit(this, file, content, m.index));
      }
      return out;
    },
  },
  {
    id: 'no-focus-ring',
    category: 'a11y',
    severity: 'error',
    immediate: true,
    name: 'Focus ring removed',
    description: 'outline: none / outline-none with no :focus-visible replacement. Keyboard users cannot see focus.',
    test(file, content) {
      const stripped = /outline\s*:\s*(?:none|0)\b|outline-none\b/.test(content);
      const replacement = /:focus-visible|focus-visible:/.test(content);
      if (stripped && !replacement) {
        const idx = content.search(/outline(?:-none|\s*:\s*(?:none|0))/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'hover-only-affordance',
    category: 'platform',
    severity: 'warning',
    immediate: true,
    name: 'Hover-only affordance',
    description: 'A control is invisible until hover. Desktop chrome needs a persistent or keyboard-visible affordance.',
    test(file, content) {
      const tailwind = /opacity-0[^\n]{0,80}hover:opacity-(?:100|80|90)/.test(content);
      const css = /opacity\s*:\s*0(?![.\d])[\s\S]{0,160}:hover[\s\S]{0,80}opacity\s*:\s*(?:1|0?\.[8-9])/.test(content);
      if (tailwind || css) {
        const idx = content.search(/opacity-0|opacity\s*:\s*0(?![.\d])/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'unvirtualized-tree',
    category: 'ide',
    severity: 'error',
    immediate: true,
    name: 'Unvirtualized tree',
    description: 'File/tree nodes rendered with .map into the DOM. Window the list (react-window, virtuoso, LazyColumn).',
    test(file, content) {
      if (!TREE_FILE.test(file)) return [];
      const mapped = /\b(?:files|nodes|entries|children|items|treeItems)\.map\s*\(/.test(content);
      const virtual = /react-window|react-virtuoso|useVirtualizer|FixedSizeList|VariableSizeList|@tanstack\/react-virtual|LazyColumn|List\s+from\s+['"]react-window/.test(content);
      if (mapped && !virtual) {
        const idx = content.search(/\b(?:files|nodes|entries|children|items|treeItems)\.map\s*\(/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'pulsing-ai-dot',
    category: 'slop',
    severity: 'warning',
    immediate: true,
    name: 'Pulsing status dot',
    description: 'Decorative pulse on a status/AI indicator. Reserve pulse for genuinely live data; otherwise use a static labeled state.',
    test(file, content) {
      const pulse = /animate-pulse/.test(content) || /@keyframes\s+pulse/.test(content);
      const dot = /rounded-full[\s\S]{0,40}(?:w-1\.5|w-2|h-2|h-1\.5)|(?:w-1\.5|w-2)[^\n]{0,40}rounded-full/.test(content);
      const aiFile = /status|copilot|assistant|ai-|llm|thinking/i.test(file);
      if (pulse && (dot || aiFile)) {
        const idx = content.search(/animate-pulse|@keyframes\s+pulse/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'status-gradient-text',
    category: 'slop',
    severity: 'warning',
    name: 'Gradient text in chrome',
    description: 'Gradient text on status/title chrome is decorative AI-slop. Use a solid color.',
    test(file, content) {
      if (!CHROME_FILE.test(file) && !/status/i.test(file)) return [];
      const idx = content.search(/bg-clip-text|background-clip\s*:\s*text/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'overused-dev-font',
    category: 'slop',
    severity: 'advisory',
    name: 'Overused UI font',
    description: 'Inter, Geist, Plus Jakarta Sans, and Space Grotesk are the default AI-IDE faces. Mono is fine in the editor; chrome needs a deliberate UI face.',
    test(file, content) {
      if (EDITOR_FILE.test(file) && /font-family/.test(content) === false) return [];
      const out = [];
      for (const m of content.matchAll(new RegExp(OVERUSED_FONTS.source, 'g'))) {
        const around = content.slice(Math.max(0, m.index - 40), m.index + 40);
        if (/monaco|codemirror|editor|monospace/i.test(around) && /Mono/.test(m[0])) continue;
        out.push(hit(this, file, content, m.index, { value: m[1] }));
      }
      return out;
    },
  },
  {
    id: 'ai-ide-palette',
    category: 'slop',
    severity: 'advisory',
    name: 'AI-IDE default palette',
    description: 'Violet on near-black is the current LLM-IDE default. Pin a palette in CHROME.md and use it.',
    test(file, content) {
      if (AI_PURPLE.test(content) && AI_NEAR_BLACK.test(content)) {
        const idx = content.search(AI_PURPLE);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'touch-density-in-ide',
    category: 'ide',
    severity: 'warning',
    name: 'Touch-sized rows in IDE chrome',
    description: '44px rows belong on phones. Tree, tab, and menu rows use the platform row metric plus hit padding.',
    test(file, content) {
      if (!TREE_FILE.test(file) && !/tab|menu|activity/i.test(file)) return [];
      const idx = content.search(/min-h-\[44px\]|minHeight\s*:\s*['"]?44|h-11\b|height:\s*44px/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'modal-preferences',
    category: 'ide',
    severity: 'warning',
    name: 'Settings in a modal',
    description: 'Preferences belong in a window or a searchable panel, not a modal over the editor.',
    test(file, content) {
      if (!SETTINGS_FILE.test(file)) return [];
      if (/\b(Dialog|Modal|AlertDialog)\b/i.test(content) || /@radix-ui\/react-dialog/i.test(content) || /role\s*=\s*["']dialog["']/i.test(content)) {
        const idx = content.search(/Dialog|Modal|AlertDialog|role\s*=\s*["']dialog["']/i);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'icon-only-toolbar',
    category: 'ide',
    severity: 'warning',
    immediate: true,
    name: 'Icon-only toolbar control',
    description: 'Toolbar button has no aria-label, title, or text. Add an accessible name and a tooltip that shows the shortcut.',
    test(file, content) {
      if (!CHROME_FILE.test(file) && !TREE_FILE.test(file)) return [];
      const out = [];
      for (const m of content.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
        const attrs = m[1] || '';
        const body = m[2] || '';
        const named = /aria-label\s*=|title\s*=/.test(attrs);
        const text = body.replace(/<[^>]+>/g, '').trim();
        const iconish = /<svg\b|Icon\b|icon-/.test(body);
        if (!named && !text && iconish) out.push(hit(this, file, content, m.index));
      }
      return out;
    },
  },
  {
    id: 'full-buffer-rerender',
    category: 'ide',
    severity: 'warning',
    name: 'Whole-buffer textarea editor',
    description: '<textarea value={...}> re-renders the whole document on each keystroke. Use a windowed editor view.',
    test(file, content) {
      if (!EDITOR_FILE.test(file) && !/<textarea\b/.test(content)) return [];
      if (/monaco|codemirror|lezer|prosemirror/.test(content)) return [];
      // React controlled components are fine - they use onChange with setState
      if (/useState|useReducer|createSignal|useSignal/.test(content) && /onChange\s*=/.test(content)) return [];
      const m = content.match(/<textarea\b[^>]*\bvalue\s*=\s*\{/);
      if (m) return [hit(this, file, content, m.index)];
      return [];
    },
  },
  {
    id: 'vscode-activity-bar',
    category: 'slop',
    severity: 'advisory',
    name: 'VS Code activity-bar clone',
    description: 'A 48px icon activity bar is the default LLM workbench. Only keep it if the product actually has several peer tools.',
    test(file, content) {
      if (!/activity/i.test(file)) return [];
      if (matchesAll(content, [/w-12\b|width:\s*48px/, /h-12\b|height:\s*48px/]) || /activity[-]?bar/i.test(content) && /w-12\b/.test(content)) {
        const idx = content.search(/activity[-]?bar|w-12/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'web-cta-in-chrome',
    category: 'slop',
    severity: 'warning',
    name: 'Web CTA in tool chrome',
    description: 'Large filled pill buttons belong on marketing pages, not titlebars or toolbars.',
    test(file, content) {
      if (!CHROME_FILE.test(file)) return [];
      const idx = content.search(/rounded-full[^\n]{0,60}(?:px-6|px-8|py-3)|(?:px-6|px-8)[^\n]{0,40}(?:py-3|py-4)[^\n]{0,40}rounded-full/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'fake-traffic-lights',
    category: 'platform',
    severity: 'warning',
    name: 'Drawn traffic lights',
    description: 'Custom red/yellow/green window dots. Use the OS caption buttons / hiddenInset traffic lights.',
    test(file, content) {
      const idx = content.search(/traffic[-_]?light|bg-red-500[^\n]{0,80}bg-yellow-500[^\n]{0,80}bg-green-500/);
      if (idx >= 0 && CHROME_FILE.test(file)) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'tauri-dangerous-csp',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'Dangerous Tauri CSP',
    description: "CSP allows 'unsafe-eval' or a wildcard connection. Tighten tauri.conf CSP.",
    test(file, content) {
      if (!/tauri\.conf/i.test(file)) return [];
      const idx = content.search(/unsafe-eval|connect-src[^"']*\*/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'glass-on-content',
    category: 'slop',
    severity: 'warning',
    immediate: true,
    name: 'Glass on the content layer',
    description: 'backdrop-filter on an editor, code surface, or data table. Blur belongs on the functional or transient layer, not on the work.',
    test(file, content) {
      const block = /([^{}@]+)\{([^{}]*)\}/g;
      for (const m of content.matchAll(block)) {
        if (/(?:^|[^a-z-])(?:editor|code-surface|data-table)(?:[^a-z-]|$)/i.test(m[1]) && /backdrop-filter\s*:/i.test(m[2])) {
          return [hit(this, file, content, m.index)];
        }
      }
      const inline = content.search(/class=["'][^"']*\b(?:editor|code-surface|data-table)\b[^"']*["'][^>]*style=["'][^"']*backdrop-filter\s*:/i);
      if (inline >= 0) return [hit(this, file, content, inline)];
      return [];
    },
  },
  {
    id: 'marketing-radius-on-row',
    category: 'slop',
    severity: 'warning',
    immediate: true,
    name: 'Marketing radius on a dense row',
    description: 'A dense row (20–32px) with a radius of 12px or more. Dense controls stay slightly rounded. Capsules are for emphasis controls.',
    test(file, content) {
      const block = /([^{}@]+)\{([^{}]*)\}/g;
      for (const m of content.matchAll(block)) {
        const rowish = /(?:^|[^a-z-])(?:row|tab|sidebar-item|tree-item)(?:[^a-z-]|$)/i.test(m[1]);
        const small = /height:\s*(?:2[0-9]|3[0-2])px/.test(m[2]);
        const big = /border-radius:\s*(?:1[2-9]|[2-9]\d)px/.test(m[2]);
        if (rowish && small && big) return [hit(this, file, content, m.index)];
      }
      return [];
    },
  },
  {
    id: 'ios-body-in-chrome',
    category: 'slop',
    severity: 'warning',
    immediate: true,
    name: 'Phone body size in desktop chrome',
    description: '17px on titlebar, toolbar, tab, or status chrome. Desktop chrome uses the platform file\'s chrome size.',
    test(file, content) {
      const block = /([^{}@]+)\{([^{}]*)\}/g;
      for (const m of content.matchAll(block)) {
        if (/(?:titlebar|toolbar|statusbar|status-bar|tab-strip)/i.test(m[1]) && /font-size:\s*17px/.test(m[2])) {
          return [hit(this, file, content, m.index)];
        }
      }
      return [];
    },
  },
  {
    id: 'centered-hero-in-shell',
    category: 'slop',
    severity: 'warning',
    immediate: true,
    name: 'Centered marketing hero in the window',
    description: 'A full-window center plus a heading and a pill button. Empty states sit in the sovereign pane and name the next action.',
    test(file, content) {
      if (/role\s*=\s*["']dialog["']/i.test(content)) return [];
      const centered = /(?:align-items|place-items)\s*:\s*center[\s\S]{0,220}justify-content\s*:\s*center|justify-content\s*:\s*center[\s\S]{0,220}(?:align-items|place-items)\s*:\s*center/;
      if (centered.test(content) && /<h1\b/i.test(content) && /rounded-full/.test(content)) {
        const idx = content.search(/justify-content\s*:\s*center|place-items\s*:\s*center/);
        return [hit(this, file, content, idx < 0 ? 0 : idx)];
      }
      return [];
    },
  },
  {
    id: 'equal-pane-grid',
    category: 'layout',
    severity: 'warning',
    immediate: true,
    name: 'Equal columns for unequal regions',
    description: 'Three or more equal 1fr tracks in the shell. Give leftover space to the sovereign surface. Inline-ignore only when the composition truly wants equal tracks.',
    test(file, content) {
      const idx = content.search(/grid-template-columns\s*:\s*(?:repeat\(\s*(?:[3-9]|\d{2,})\s*,\s*1fr\s*\)|(?:1fr\s+){2,}1fr)/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
];

const PROJECT_RULES = [
  {
    id: 'missing-titlebar-drag',
    category: 'platform',
    severity: 'error',
    name: 'Custom titlebar has no drag region',
    description: 'Hidden or frameless window without -webkit-app-region: drag. The window cannot be moved.',
    run(files) {
      const custom = files.find((f) => /titleBarStyle\s*:\s*['"]hidden(?:Inset)?['"]/.test(f.content) || /\bframe\s*:\s*false\b/.test(f.content));
      const drag = files.some((f) => /-webkit-app-region\s*:\s*drag/.test(f.content) || /WebkitAppRegion['"]?\s*:\s*['"]drag['"]/.test(f.content));
      if (custom && !drag) {
        const idx = custom.content.search(/titleBarStyle|\bframe\s*:/);
        return [{
          id: this.id, name: this.name, category: this.category, severity: this.severity,
          file: custom.file, line: lineOf(custom.content, idx), snippet: snippetAt(custom.content, Math.max(0, idx)),
          message: this.description,
        }];
      }
      return [];
    },
  },
  {
    id: 'missing-native-menu',
    category: 'platform',
    severity: 'error',
    name: 'No native application menu',
    description: 'BrowserWindow exists but Menu.setApplicationMenu / buildFromTemplate was never called.',
    run(files, ctx) {
      if (ctx.shell !== 'electron' && !ctx.hasElectron) return [];
      const hasWindow = files.some((f) => /new\s+BrowserWindow\b/.test(f.content));
      const hasMenu = files.some((f) => /setApplicationMenu|Menu\.buildFromTemplate/.test(f.content));
      if (hasWindow && !hasMenu) {
        const host = files.find((f) => /new\s+BrowserWindow\b/.test(f.content));
        return [{
          id: this.id, name: this.name, category: this.category, severity: this.severity,
          file: host.file, line: lineOf(host.content, host.content.search(/new\s+BrowserWindow/)),
          snippet: snippetAt(host.content, host.content.search(/new\s+BrowserWindow/)),
          message: this.description,
        }];
      }
      return [];
    },
  },
  {
    id: 'ignores-system-appearance',
    category: 'platform',
    severity: 'warning',
    name: 'Ignores system appearance',
    description: 'Theme is hardcoded dark/light with no nativeTheme / prefers-color-scheme follow.',
    run(files) {
      const joined = files.map((f) => f.content).join('\n');
      const hard = /themeSource\s*:\s*['"]dark['"]|color-scheme:\s*dark\s+only|ThemeProvider[^\n]defaultTheme\s*=\s*['"]dark['"]/.test(joined);
      const follow = /themeSource\s*:\s*['"]system['"]|prefers-color-scheme|nativeTheme/.test(joined);
      if (hard && !follow) {
        const host = files.find((f) => /themeSource\s*:\s*['"]dark['"]|defaultTheme\s*=\s*['"]dark['"]/.test(f.content)) || files[0];
        if (!host) return [];
        const idx = host.content.search(/themeSource|defaultTheme|color-scheme/);
        return [{
          id: this.id, name: this.name, category: this.category, severity: this.severity,
          file: host.file, line: lineOf(host.content, idx), snippet: snippetAt(host.content, Math.max(0, idx)),
          message: this.description,
        }];
      }
      return [];
    },
  },
];

function allowed(finding, ignores, config) {
  if (shouldIgnoreRule(finding.id, config)) return false;
  if (ignores.file.has('*') || ignores.file.has(finding.id)) return false;
  const lineSet = ignores.perLine.get(finding.line);
  if (lineSet && (lineSet.has('*') || lineSet.has(finding.id))) return false;
  return true;
}

export async function detectFiles(files, { config, ctx, immediate = false } = {}) {
  const findings = [];
  const rules = immediate ? RULES.filter((r) => r.immediate) : RULES;
  
  // Determine project root from first file
  const projectRoot = files.length > 0 ? path.dirname(files[0].file) : process.cwd();
  // Walk up to find actual root (where .perfectable or package.json exists)
  let root = projectRoot;
  const { root: sysRoot, homedir } = { root: path.parse(root).root, homedir: process.env.HOME };
  while (root !== sysRoot && root !== homedir) {
    if (fs.existsSync(path.join(root, '.perfectable')) || fs.existsSync(path.join(root, 'package.json'))) break;
    root = path.dirname(root);
  }
  
  // Load custom rules
  let customRules = [];
  if (config?.detector?.customRules?.length) {
    for (const rulePath of config.detector.customRules) {
      try {
        const resolved = path.resolve(root, rulePath);
        const mod = await import('file://' + resolved);
        if (mod.RULES) customRules.push(...mod.RULES);
      } catch (e) {
        console.warn(`Failed to load custom rule: ${rulePath}`, e);
      }
    }
  }
  
  const allRules = [...rules, ...customRules];
  
  for (const { file, content, rel } of files) {
    if (shouldIgnoreFile(rel, config)) continue;
    const ignores = parseInlineIgnores(content);
    for (const rule of allRules) {
      if (shouldIgnoreRule(rule.id, config)) continue;
      let hits = [];
      try {
        hits = rule.test(file, content, { ...ctx, immediate }) || [];
      } catch {
        hits = [];
      }
      for (const f of hits) {
        if (allowed(f, ignores, config)) findings.push({ ...f, file: rel });
      }
    }
  }
  if (!immediate) {
    for (const rule of PROJECT_RULES) {
      if (shouldIgnoreRule(rule.id, config)) continue;
      const hits = rule.run(files, ctx) || [];
      for (const f of hits) {
        const host = files.find((x) => x.file === f.file);
        const ignores = host ? parseInlineIgnores(host.content) : { file: new Set(), perLine: new Map() };
        if (allowed(f, ignores, config)) {
          findings.push({ ...f, file: host ? host.rel : f.file });
        }
      }
    }
  }
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.id.localeCompare(b.id));
  return findings;
}

function loadTargets(root, targets) {
  const paths = [];
  if (!targets.length) {
    paths.push(...walkFiles(root));
  } else {
    for (const t of targets) {
      const full = path.resolve(t);
      let st;
      try { st = fs.statSync(full); } catch { continue; }
      if (st.isDirectory()) paths.push(...walkFiles(full));
      else if (st.isFile()) paths.push(full);
    }
  }
  return paths.map((file) => {
    let content = '';
    try { content = fs.readFileSync(file, 'utf8'); } catch { content = ''; }
    return { file, rel: path.relative(root, file) || path.basename(file), content };
  }).filter((f) => f.content && isUiFile(f.file));
}

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const isTTY = process.stdout.isTTY;
function colorize(text, color) {
  return isTTY ? `${color}${text}${RESET}` : text;
}

function severityColor(severity) {
  switch (severity) {
    case 'error': return RED;
    case 'warning': return YELLOW;
    case 'advisory': return CYAN;
    default: return RESET;
  }
}

function printHuman(findings) {
  if (!findings.length) {
    process.stdout.write(colorize('perfectable: clean\n', GREEN));
    return;
  }
  for (const f of findings) {
    const sevColor = severityColor(f.severity);
    const sevLabel = colorize(`[${f.severity.toUpperCase()}]`, sevColor);
    const idLabel = colorize(f.id, CYAN);
    process.stdout.write(`${f.file}:${f.line}  ${sevLabel} ${idLabel}  ${f.name}\n  ${f.message}\n  ${colorize(f.snippet, RESET)}\n`);
  }
  const counts = findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, { error: 0, warning: 0, advisory: 0 });
  const summary = [
    colorize(`Errors: ${counts.error}`, RED),
    colorize(`Warnings: ${counts.warning}`, YELLOW),
    colorize(`Advisories: ${counts.advisory}`, CYAN),
  ].join('  ');
  process.stdout.write(`\n${findings.length} finding(s)  ${summary}\n`);
}

function counts(findings) {
  const c = { error: 0, warning: 0, advisory: 0 };
  for (const f of findings) c[f.severity] = (c[f.severity] || 0) + 1;
  return c;
}

export async function detectCli(argv = process.argv.slice(2)) {
  const args = argv.filter((a) => a !== '--');
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`Usage: detect.mjs [--json] [--immediate] [--no-config] [--format=json|junit|sarif|markdown] [path ...]\nExit 0 clean, 2 findings, 1 error.\n`);
    finish(0);
    return;
  }
  const json = args.includes('--json');
  const immediate = args.includes('--immediate');
  const noConfig = args.includes('--no-config');
  const formatArg = args.find(a => a.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : (json ? 'json' : 'human');
  const targets = args.filter((a) => !a.startsWith('--'));
  // Determine scan root (where to find files) and project root (where to find package.json/APP.md)
  let scanRoot = null;
  let projectRoot = null;
  if (targets.length > 0 && !immediate) {
    const firstTarget = path.resolve(targets[0]);
    try {
      const stat = fs.statSync(firstTarget);
      if (stat.isDirectory()) {
        scanRoot = firstTarget;
        projectRoot = findRoot(firstTarget);
      } else {
        scanRoot = path.dirname(firstTarget);
        projectRoot = findRoot(scanRoot);
      }
    } catch {
      scanRoot = null;
      projectRoot = null;
    }
  }
  if (!scanRoot) scanRoot = process.cwd();
  if (!projectRoot) projectRoot = findRoot();
  const root = scanRoot;
  const ctx = inferProject(projectRoot);
  
  const config = noConfig
    ? { hook: { enabled: false }, detector: { ignoreRules: [], ignoreFiles: [] } }
    : loadConfig(projectRoot);
  const files = loadTargets(root, targets);
  
  if (!files.length) {
    // Native projects (SwiftUI, WinUI, GTK) may have no web UI files - that's OK
    if (ctx.desktop && (ctx.shell === 'swiftui' || ctx.shell === 'winui' || ctx.shell === 'gtk' || ctx.shell === 'native')) {
      if (format === 'json') {
        process.stdout.write(JSON.stringify({ ok: true, findings: [], counts: { error: 0, warning: 0, advisory: 0 } }, null, 2) + '\n');
      } else {
        process.stdout.write(colorize('perfectable: clean (native project, no web UI files)\n', GREEN));
      }
      finish(0);
      return;
    }
    process.stderr.write(colorize('Error: ', RED) + 'No UI files found to scan. Check path or ensure files have supported extensions (.tsx, .jsx, .ts, .js, .css, .html, .vue, .svelte, .json, .toml)\n');
    if (!ctx.appPath) {
      process.stderr.write(colorize('Hint: ', YELLOW) + 'No APP.md found. Run `$perfectable init` to capture product truth first.\n');
    }
    finish(1);
    return;
  }
  
  const findings = await detectFiles(files, { config, ctx, immediate });
  
  let output = '';
  if (format === 'json') {
    output = JSON.stringify({ ok: findings.length === 0, findings, counts: counts(findings) }, null, 2);
  } else if (format === 'junit') {
    output = generateJUnit(findings);
  } else if (format === 'sarif') {
    output = generateSARIF(findings, projectRoot);
  } else if (format === 'markdown') {
    output = generateMarkdown(findings);
  } else {
    printHuman(findings);
    output = '';
  }
  process.stdout.write(output, () => finish(findings.length ? 2 : 0));
}

function generateJUnit(findings) {
  const testsuites = findings.reduce((acc, f) => {
    const suiteName = f.file.replace(/\//g, '.').replace(/\.[^.]+$/, '');
    if (!acc[suiteName]) acc[suiteName] = [];
    acc[suiteName].push(f);
    return acc;
  }, {});
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>';
  for (const [suiteName, suiteFindings] of Object.entries(testsuites)) {
    xml += `<testsuite name="${escapeXml(suiteName)}" tests="${suiteFindings.length}" failures="${suiteFindings.filter(f => f.severity === 'error').length}" errors="0" skipped="0">`;
    for (const f of suiteFindings) {
      xml += `<testcase name="${escapeXml(f.id)}" classname="${escapeXml(f.file)}" line="${f.line}">`;
      if (f.severity === 'error' || f.severity === 'warning') {
        xml += `<failure message="${escapeXml(f.message)}"><![CDATA[${escapeXml(f.snippet)}]]></failure>`;
      }
      xml += '</testcase>';
    }
    xml += '</testsuite>';
  }
  xml += '</testsuites>';
  return xml;
}

function generateSARIF(findings, root) {
  const results = findings.map(f => ({
    ruleId: f.id,
    level: f.severity === 'error' ? 'error' : f.severity === 'warning' ? 'warning' : 'note',
    message: { text: f.message },
    locations: [{
      physicalLocation: {
        artifactLocation: { uri: f.file },
        region: { startLine: f.line, snippet: { text: f.snippet } }
      }
    }]
  }));
  return JSON.stringify({
    version: '2.1.0',
    $schema: 'https://schemastore.org/schemas/json/sarif-2.1.0.json',
    runs: [{ tool: { driver: { name: 'perfectable-detector', rules: [] } }, results }]
  }, null, 2);
}

function generateMarkdown(findings) {
  if (!findings.length) return '✅ No issues found';
  let md = '# Perfectable detector findings\n\n';
  md += `| File | Line | Severity | Rule | Message |\n`;
  md += `|------|------|----------|------|---------|\n`;
  for (const f of findings) {
    md += `| ${f.file} | ${f.line} | ${f.severity} | ${f.id} | ${f.message.replace(/\|/g, '\\|')} |\n`;
  }
  return md;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

const isMain = Boolean(process.argv[1]) && sameFile(process.argv[1], fileURLToPath(import.meta.url));
if (isMain) {
  await detectCli();
}
