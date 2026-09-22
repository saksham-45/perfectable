# Adaptive Platform Pack

This platform pack loads all platform-specific packs for cross-platform applications.

## Files

- `adaptive.md` — Cross-platform guidance for apps targeting multiple desktop OSes

## Usage

Load this pack when `ctx.platform === 'adaptive'`.

```javascript
import { loadPlatformPack } from 'perfectable/platforms/adaptive';
const adaptivePack = loadPlatformPack('adaptive');
```

## Content Summary

The adaptive pack covers:

- Host pixels at runtime. Row height, window controls, and materials come from the desktop the window is on
- Shared names only: spacing roles, composition ids, token names, keyboard verbs
- Keyboard shortcut normalization (Cmd ↔ Ctrl, etc.)
- Testing matrix for multi-platform CI