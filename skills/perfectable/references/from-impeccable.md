# Migrating from Impeccable to Workbench

Impeccable handles **web** UI quality. Workbench handles **desktop/IDE** UI quality. If your Electron/Tauri/native app was built with web patterns, this guide maps the migration.

## Core Philosophy Shift

| Impeccable (Web) | Workbench (Desktop) |
|------------------|---------------------|
| Fluid type scales (`clamp()`) | Fixed type scales (12px, 13px, 14px) |
| 44px touch targets | 22–28px dense rows + hit padding |
| Marketing CTAs (pill buttons) | Native toolbar buttons / menu items |
| Hamburger menus | Native menu bar (App/File/Edit/View/Window/Help) |
| Custom modals for everything | Native dialogs (file, confirm, preferences) |
| Single-page app routing | Document/window model |
| CSS-in-JS / Tailwind | Semantic CSS custom properties |
| `prefers-color-scheme` only | System appearance + High Contrast + Reduce Motion |
| Viewport-relative units | Native windowing / split views |

## Pattern Migration Map

### Navigation
| Web (Impeccable) | Desktop (Workbench) |
|------------------|---------------------|
| `<nav>` + hamburger | Native menu bar + keyboard accelerators |
| Tab bar (React Router) | Native tabs (document model) or workspace panels |
| Breadcrumbs | Window proxy icon + path in titlebar |
| Sidebar `nav` | Native sidebar / inspector with collapse |

### Forms & Inputs
| Web | Desktop |
|-----|---------|
| `<input type="file">` | **Native file dialog** (Electron `dialog`, Tauri `dialog`, NSOpenPanel, IFileDialog) |
| Custom select/dropdown | Native combobox / NSPopUpButton / WinUI ComboBox |
| Modal date picker | Native calendar panel |
| Toast notifications | Status bar / system notifications |

### Feedback & Status
| Web | Desktop |
|-----|---------|
| Spinner overlay | Inline progress (status bar, toolbar) |
| Toast/snackbar | Status bar transient message |
| Loading skeleton | Native indeterminate progress |
| Pulsing AI dot | Static labeled state (ready/working/error) |

### Layout & Density
| Web | Desktop |
|-----|---------|
| 44px+ touch rows | **22–28px rows** + 4px hit padding |
| Card-based layouts | Split views / panes / inspectors |
| Grid/flex everything | Native split views (`NSSplitView`, `NavigationSplitView`, `CommandBar`) |
| Full-width containers | Editor keeps measure (max 80-100ch) |

### Theming
| Web | Desktop |
|-----|---------|
| Tailwind `dark:` | **CSS custom properties** + `prefers-color-scheme` + `prefers-contrast` + `prefers-reduced-motion` |
| Custom color palette | **Semantic tokens**: surface, chrome, editor, selection, find, error, warning, success |
| `bg-violet-600` | Platform accent (macOS: system blue, Windows: system accent, Linux: theme accent) |
| `rounded-lg` | Platform radii (macOS: 4-6px, Windows: 4px, Linux: theme-defined) |

### Windowing
| Web | Desktop |
|-----|---------|
| `window.open()` | Native document windows / `BrowserWindow` |
| `localStorage` for layout | Native window state restoration |
| Custom titlebar | **System titlebar** (`hiddenInset` macOS, caption buttons Windows) |
| `z-index` modals | Native sheets / dialogs attached to window |

## Step-by-Step Migration

### 1. Run Workbench Init
```bash
$perfectable init
```
Captures: platform, shell, windowing model, input contract. This replaces Impeccable's "design system" setup.

### 2. Document Existing Chrome
```bash
$perfectable document
```
Extracts CHROME.md from your current UI. Replaces Impeccable's token audit.

### 3. Run Detector (Find Web Slop)
```bash
$perfectable detect --json src/
```
Catches: `web-file-picker`, `modal-preferences`, `touch-density-in-ide`, `web-cta-in-chrome`, `fake-traffic-lights`, `hamburger-menu`, `vscode-activity-bar`, `ai-ide-palette`, `pulsing-ai-dot`, `hover-only-affordance`, `no-focus-ring`.

### 4. Fix P0 Findings First
| Detector Rule | Impeccable Pattern | Workbench Fix |
|---------------|-------------------|---------------|
| `web-file-picker` | `<input type="file">` | Native `dialog.showOpenDialog()` |
| `modal-preferences` | Settings modal | Preferences window / panel |
| `touch-density-in-ide` | `min-h-[44px]` | `height: 24px` + hit padding |
| `web-cta-in-chrome` | `rounded-full px-6 py-3` | Native toolbar button |
| `fake-traffic-lights` | Custom red/yellow/green dots | `titleBarStyle: 'hiddenInset'` |
| `no-focus-ring` | `outline: none` | Add `:focus-visible` ring |
| `hover-only-affordance` | `opacity-0 hover:opacity-100` | Persistent affordance |

### 5. Run Critique + Audit
```bash
$perfectable critique src/
$perfectable audit src/
```
Replaces Impeccable's design review with scored heuristic review + technical audit.

### 6. Harden & Adapt
```bash
$perfectable harden src/
$perfectable adapt src/
```
Handles: crash restore, dirty docs, i18n, permissions, HiDPI, compact chrome — not in Impeccable.

### 7. Polish
```bash
$perfectable polish src/
```
Final batched pass inheriting P0/P1 from critique.

## Common Impeccable → Workbench Refactors

### Before (Impeccable-style Electron)
```tsx
// ❌ Web patterns in desktop
<header className="h-16 bg-slate-900 flex items-center px-4">
  <button className="p-2 rounded-lg hover:bg-slate-800">
    <MenuIcon className="w-6 h-6" />
  </button>
  <h1 className="text-xl font-bold text-white ml-4">My Editor</h1>
  <div className="ml-auto flex gap-2">
    <button className="px-4 py-2 bg-violet-600 rounded-full text-white">
      Get Started
    </button>
    <input type="file" className="hidden" id="file" />
    <label htmlFor="file" className="px-3 py-1 bg-slate-700 rounded">
      Open
    </label>
  </div>
</header>
```

### After (Workbench-native)
```tsx
// ✅ Native desktop patterns
<header className="titlebar" style={{ WebkitAppRegion: 'drag' }}>
  <div className="titlebar-drag" style={{ WebkitAppRegion: 'drag' }}>
    <span className="titlebar-title">Untitled ●</span>
  </div>
  <div className="titlebar-controls" style={{ WebkitAppRegion: 'no-drag' }}>
    <button className="toolbar-btn" aria-label="New File (Cmd+N)" title="New File (Cmd+N)">
      <NewFileIcon />
    </button>
    <button className="toolbar-btn" aria-label="Open File (Cmd+O)" title="Open File (Cmd+O)">
      <OpenFileIcon />
    </button>
    <button className="toolbar-btn" aria-label="Save (Cmd+S)" title="Save (Cmd+S)" disabled={!isDirty}>
      <SaveIcon />
    </button>
    <button className="titlebar-btn" data-action="minimize" aria-label="Minimize">−</button>
    <button className="titlebar-btn" data-action="maximize" aria-label="Maximize">□</button>
    <button className="titlebar-btn" data-action="close" aria-label="Close">×</button>
  </div>
</header>
```

```css
/* Workbench semantic tokens */
:root {
  --color-surface: #fff;
  --color-chrome: #f5f5f5;
  --color-chrome-border: #e0e0e0;
  --color-focus: #007acc;
  --density-toolbar: 32px;
  --density-row: 24px;
}

.titlebar {
  height: 32px;
  display: flex;
  justify-content: space-between;
  background: var(--color-chrome);
  border-bottom: 1px solid var(--color-chrome-border);
}

.toolbar-btn {
  height: var(--density-toolbar);
  min-width: var(--density-toolbar);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 4px;
}
.toolbar-btn:hover { background: var(--color-chrome-border); }
.toolbar-btn:focus-visible { outline: 2px solid var(--color-focus); }
```

## Checklist for Migration Complete

- [ ] `$perfectable init` → APP.md with platform/shell/windowing/input
- [ ] `$perfectable document` → CHROME.md with tokens + components
- [ ] `$perfectable detect` → 0 findings (or documented ignores)
- [ ] `$perfectable audit` → Platform conformance ≥ 3/4
- [ ] `$perfectable critique` → Design health ≥ 70%
- [ ] `$perfectable harden` → Crash restore, dirty docs, i18n, a11y
- [ ] `$perfectable adapt` → Compact, HiDPI, multi-window work
- [ ] `$perfectable polish` → Final pass clean
- [ ] CI: `$perfectable detect --format=sarif` in PR checks
- [ ] Hooks: `$perfectable hooks on` for per-edit feedback

## What NOT to Bring from Impeccable

- ❌ Fluid type (`clamp()`, `vw` units)
- ❌ 44px+ touch targets
- ❌ Marketing CTAs in tool chrome
- ❌ Hamburger menus
- ❌ Custom modals for preferences/pickers
- ❌ Card/grid layouts for main workspace
- ❌ Tailwind utility-first (use semantic tokens)
- ❌ Single dark theme (must support light + high contrast)
- ❌ Pulsing/animated decorative elements
- ❌ Gradient text in chrome
- ❌ Icon-only controls without labels/tooltips/shortcuts
- ❌ Viewport-relative sizing (use native split views)

---

**Remember**: Impeccable makes websites beautiful. Workbench makes tools *work*. The editor is the product; chrome disappears into the task.