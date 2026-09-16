# macOS Platform Pack

This platform pack provides macOS-specific guidance for the Perfectable skill.

## Files

- `macos.md` — macOS Human Interface Guidelines compliance, slop tests, and platform conventions

## Usage

Load this pack when `ctx.platform === 'macos'` or `ctx.platform === 'adaptive'`.

```javascript
import { loadPlatformPack } from 'perfectable/platforms/macos';
const macosPack = loadPlatformPack('macos');
```

## Content Summary

The macOS pack covers:

- Windowing: traffic lights, hiddenInset titlebar, document proxy icon, sheets vs windows
- Keyboard: required chords (Cmd+N/O/S/W/Q, etc.), full keyboard access
- Appearance: system appearance, high contrast, reduce transparency/motion, vibrancy
- Slop tests: fake traffic lights, hamburger menus, web file pickers, hover-only affordances, dark-only UI