# Migrating from Impeccable to Perfectable

Impeccable handles **web** UI quality. Perfectable handles **desktop/IDE** UI quality. If your Electron/Tauri/native app was built with web patterns, this guide maps the migration.

## Core Philosophy Shift

| Impeccable (Web) | Perfectable (Desktop) |
|------------------|---------------------|
| Fluid type scales (`clamp()`) | The platform file's fixed chrome sizes |
| 44px touch targets | The platform file's row metric, plus hit padding |
| Marketing CTAs (pill buttons) | Native toolbar buttons / menu items |
| Hamburger menus | Native menu bar (App/File/Edit/View/Window/Help) |
| Custom modals for everything | Native dialogs (file, confirm, preferences) |
| Single-page app routing | Document/window model |
| CSS-in-JS / Tailwind | Semantic CSS custom properties |
| `prefers-color-scheme` only | System appearance + High Contrast + Reduce Motion |
| Viewport-relative units | Native windowing / split views |

## Pattern Migration Map

### Navigation
| Web (Impeccable) | Desktop (Perfectable) |
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
| 44px+ touch rows | **Platform row metric** + hit padding |
| Card-based layouts | Split views / panes / inspectors |
| Grid/flex everything | Native split views (`NSSplitView`, `NavigationSplitView`, `CommandBar`) |
| Full-width containers | Prose uses the measure in [canon/type.md](canon/type.md); code uses the pane |

### Theming
| Web | Desktop |
|-----|---------|
| Tailwind `dark:` | **CSS custom properties** + `prefers-color-scheme` + `prefers-contrast` + `prefers-reduced-motion` |
| Custom color palette | **Semantic tokens**: surface, chrome, editor, selection, find, error, warning, success |
| `bg-violet-600` | Platform accent (macOS: system blue, Windows: system accent, Linux: theme accent) |
| `rounded-lg` | The platform file's control radius |

### Windowing
| Web | Desktop |
|-----|---------|
| `window.open()` | Native document windows / `BrowserWindow` |
| `localStorage` for layout | Native window state restoration |
| Custom titlebar | **System titlebar** (`hiddenInset` macOS, caption buttons Windows) |
| `z-index` modals | Native sheets / dialogs attached to window |

## Step-by-Step Migration

### 1. Run Perfectable Init
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
| Detector Rule | Impeccable Pattern | Perfectable Fix |
|---------------|-------------------|---------------|
| `web-file-picker` | `<input type="file">` | Native `dialog.showOpenDialog()` |
| `modal-preferences` | Settings modal | Preferences window / panel |
| `touch-density-in-ide` | `min-h-[44px]` | Platform row metric + hit padding |
| `web-cta-in-chrome` | `rounded-full px-6 py-3` | Native toolbar button |
| `fake-traffic-lights` | Custom red/yellow/green dots | `titleBarStyle: 'hiddenInset'` |
| `no-focus-ring` | `outline: none` | Add `:focus-visible` ring |
| `hover-only-affordance` | `opacity-0 hover:opacity-100` | Persistent affordance |

### 5. Give the window a spatial contract
```bash
$perfectable layout src/
```
Bans are not a layout. Name the composition, the sovereign surface, and where the air goes. Two spacing roles, minimum.

### 6. Run Critique + Audit
```bash
$perfectable critique src/
$perfectable audit src/
```
Replaces Impeccable's design review with scored heuristic review + technical audit.

### 7. Harden & Adapt
```bash
$perfectable harden src/
$perfectable adapt src/
```
Handles: crash restore, dirty docs, i18n, permissions, HiDPI, compact chrome — not in Impeccable.

### 8. Polish
```bash
$perfectable polish src/
```
Final batched pass inheriting P0/P1 from critique.

## Common Impeccable → Perfectable Refactors

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

### After

Use the host titlebar (`hiddenInset` on macOS, system caption buttons on Windows, the toolkit header bar on Linux). Do not draw minimize, maximize, and close. Put named toolbar actions in the command band, after the system inset, with `no-drag` on each control. Open goes through the system file dialog. Tokens use the names in [canon/materials.md](canon/materials.md). Lengths come from the platform file. Then run `$perfectable layout` so the sidebar, the buffer, and the command band do not share one padding.

## Checklist for Migration Complete

- [ ] `$perfectable init` → APP.md with platform, shell, posture, composition
- [ ] `$perfectable document` → CHROME.md with tokens + components
- [ ] `$perfectable detect` → 0 findings, or an ignore with a reason
- [ ] `$perfectable layout` → spatial contract, two spacing roles, air in the sovereign surface
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
- ❌ One padding value for every relationship
- ❌ Glass or blur on the editor, the table, or the document

---

**Remember**: Impeccable makes websites beautiful. Perfectable makes tools *work*. The editor is the product; chrome disappears into the task.