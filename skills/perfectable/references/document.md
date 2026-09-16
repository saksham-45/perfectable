# Document

Generate `CHROME.md` at the project root from incumbent chrome so later agents stay on-system. Tokens are normative; prose says how to apply them.

Do not silently overwrite an existing CHROME.md. Show it and ask: refresh, overwrite, or merge.

## When to run

- Coherent chrome exists and CHROME.md does not.
- First implementation of a world is complete and decisions need to be carbonized.
- CHROME.md is stale.

## Scan

Search in order. Record name, value, and file. Do not invent tokens the project does not use.

1. CSS custom properties for chrome / surface / editor / selection / find / error.
2. **Tailwind config** (`tailwind.config.js`, `tailwind.config.ts`) — extract `theme.extend.colors`, `theme.extend.spacing`, `theme.extend.fontFamily`, `theme.extend.fontSize`, `theme.extend.borderRadius`.
3. **CSS variables** in `:root` / `:host` / `[data-theme]` — extract all `--color-*`, `--font-*`, `--density-*`, `--radius-*`, `--spacing-*`, `--shadow-*`, `--transition-*`.
4. Theme files (`theme.ts`, `tokens.ts`, `design-tokens.json`).
5. Titlebar, sidebar, activity bar, tab strip, status bar, command palette, tree, menu, settings window.
6. Electron `BrowserWindow` / Tauri window config (titlebar style, frame, traffic-light position).
7. Menu template, keybinding map, document dirty API.

### Auto-Detection Heuristics

- **Tailwind**: If `tailwind.config.*` exists, parse `theme.extend` and map to semantic tokens (e.g., `colors.surface` → `--color-surface`).
- **CSS Variables**: Scan all `.css`, `.scss`, `.sass`, `.less` files for `:root { --color-*: }` patterns.
- **Design Tokens**: If `tokens.json` or `design-tokens.json` exists, use as source of truth.
- **Component Libraries**: Detect Radix UI, shadcn/ui, Headless UI, Material UI — map their tokens to Workbench semantics.

## Write CHROME.md

```markdown
# Chrome

<!-- perfectable:chrome-schema 1 -->

## Overview

[Density, native-vs-custom split, one-sentence character of the chrome.]

## Platform and Shell

[macos/windows/linux/adaptive] · [electron/tauri/…]

## Native vs Custom

- Titlebar: system | custom (drag region required)
- Menus: native | in-window
- File dialogs: system
- Appearance: follow system | app-controlled
- Window controls: system | custom (geometry must match OS)

## Density

- Row / tab / menu item: [px]
- Hit padding beyond the visible row: [px]
- Compact vs full chrome breakpoints: [widths]

## Color

- surface, chrome, editor, selection, find, error, warning, success
- [hex or token name]: [where]

## Typography

- Chrome family, sizes, weights (fixed scale)
- Editor / terminal mono
- Tabular nums: gutters, status, diffs

## Icons

[One set and stroke. No mixed emoji.]

## Components

For each of titlebar, sidebar, tabs, tree, editor, status, palette, settings:
- Shape, color assignment, states (default/hover/focus/active/disabled)
- Keyboard path and shortcut if any

## Do's and Don'ts

- Do [specific, with values].
- Don't [specific prohibition from the incumbent system].
```

Omit empty sections. Exact values in parens next to the description. Do not duplicate APP.md product truth.

## Confirm

Show CHROME.md. Call out non-obvious choices (density number, native-vs-custom split). Offer to revise a section. Subsequent commands in this session do not need a reload.
