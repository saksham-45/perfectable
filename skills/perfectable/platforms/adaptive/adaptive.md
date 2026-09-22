# Adaptive Platform Pack

Cross-platform guidance for apps targeting macOS, Windows, and Linux.

## Platform Detection

The adaptive pack automatically detects the target platform from `ctx.platform` and loads the appropriate platform pack:

```javascript
function loadAdaptivePack(ctx) {
  switch (ctx.platform) {
    case 'macos': return import('perfectable/platforms/macos');
    case 'windows': return import('perfectable/platforms/windows');
    case 'linux': return import('perfectable/platforms/linux');
    default: return import('perfectable/platforms/adaptive');
  }
}
```

## One window, three hosts

Shared across desktops: spacing role names, the composition grammar, token names, and the keyboard verbs below. Different on each desktop: row height, window controls, menu style, and material. Read the host platform file at runtime. A single stylesheet of one desktop's pixels painted onto the other two fails adaptive.

| Token name | Resolves from |
|---|---|
| `--density-row`, `--density-toolbar` | The host platform file's metrics |
| `--font-chrome` | The host UI face |
| `--color-accent`, `--color-focus` | System accent on that desktop |
| Material | The host layer model |

## Keyboard Normalization

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| New | Cmd+N | Ctrl+N |
| Open | Cmd+O | Ctrl+O |
| Save | Cmd+S | Ctrl+S |
| Close Tab/Window | Cmd+W | Ctrl+W |
| Quit App | Cmd+Q | Ctrl+Q / Alt+F4 |
| Undo | Cmd+Z | Ctrl+Z |
| Find | Cmd+F | Ctrl+F |
| Preferences | Cmd+, | Ctrl+, |

Use `navigator.platform` or `ctx.platform` to show correct shortcuts in UI.

## Windowing Abstraction

| Concept | macOS | Windows | Linux |
|---------|-------|---------|-------|
| Titlebar | hiddenInset | Custom caption | Header bar / native |
| Window Controls | Left (traffic lights) | Right (caption) | Theme-dependent |
| Drag Region | -webkit-app-region: drag | Custom | Header bar |
| Sheets | Native sheets | Task dialogs | Native dialogs |
| File Dialogs | NSOpenPanel | IFileDialog | GtkFileDialog/portal |

## Appearance

All platforms support:
- `prefers-color-scheme` (light/dark/system)
- `prefers-contrast` (high contrast)
- `prefers-reduced-motion`

Use CSS custom properties with platform-specific fallbacks:

```css
:root {
  --color-surface: Canvas;
  --color-chrome: Canvas;
  --color-focus: var(--color-accent);
}

@media (prefers-contrast: more) {
  :root {
    --color-focus: Highlight;
  }
}
```

## Testing Matrix

For adaptive apps, test on:
- macOS: light, dark, high contrast, reduced motion
- Windows: light, dark, high contrast (multiple themes)
- Linux (GNOME): light, dark, high contrast, reduced motion
- Linux (KDE): light, dark, high contrast

Automate with CI using VMs or cloud runners for each platform.