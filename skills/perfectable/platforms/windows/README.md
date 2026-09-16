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
- Appearance: system light/dark, high contrast themes, Mica/Acrylic on chrome only
- Slop tests: macOS traffic lights on Windows, hamburger-only menus, web file pickers, hover-only affordances, dark-only ignoring high contrast