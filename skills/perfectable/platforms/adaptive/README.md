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

- Conditional platform detection and feature toggles
- Shared density tokens across platforms
- Platform-appropriate windowing abstractions
- Keyboard shortcut normalization (Cmd ↔ Ctrl, etc.)
- Appearance handling across all three platforms
- Testing matrix for multi-platform CI