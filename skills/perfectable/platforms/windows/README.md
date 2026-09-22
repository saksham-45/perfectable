# Windows Platform Pack

This platform pack provides Windows-specific guidance for the Perfectable skill.

## Files

- `windows.md` — Windows 11 / WinUI 3 compliance, slop tests, and platform conventions

## Usage

Load this pack when `ctx.platform === 'windows'` or `ctx.platform === 'adaptive'`.

```javascript
import { loadPlatformPack } from 'perfectable/platforms/windows';
const windowsPack = loadPlatformPack('windows');
```

## Content Summary

The Windows pack covers:

- Windowing: caption buttons (right-aligned), Snap Layout flyout, custom titlebar drag region, system menu
- Keyboard: required chords (Ctrl+N/O/S/W, Alt+F4, Alt for menu), F11 fullscreen
- Metrics and materials: standard 40epx versus compact 32epx, 8/12/16epx content spacing, mica on the window, acrylic on transient surfaces, solid content. Lengths live in `windows.md`, checked 2026-09-22
- Appearance: system light/dark, high contrast themes
- Slop tests: macOS traffic lights on Windows, hamburger-only menus, web file pickers, hover-only affordances, dark-only ignoring high contrast