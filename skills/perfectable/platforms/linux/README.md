# Linux Platform Pack

This platform pack provides Linux desktop-specific guidance for the Perfectable skill.

## Files

- `linux.md` — GNOME/libadwaita and KDE/Qt compliance, slop tests, and platform conventions

## Usage

Load this pack when `ctx.platform === 'linux'` or `ctx.platform === 'adaptive'`.

```javascript
import { loadPlatformPack } from 'perfectable/platforms/linux';
const linuxPack = loadPlatformPack('linux');
```

## Content Summary

The Linux pack covers:

- Windowing: client-side decorations (libadwaita header bar on GNOME, native on KDE), window controls on configured side
- Keyboard: Ctrl+N/O/S/W/Q, F10/Alt for menus, Esc to back out
- Metrics: desktop font, 1024×600 minimum, a max width on prose, a sidebar that stays in proportion. No invented row height. Rules live in `linux.md`
- Appearance: color-scheme portal, high contrast, reduced motion, the toolkit theme rather than another desktop's materials
- Slop tests: macOS traffic lights on GNOME/KDE, web file pickers (ignoring portal), hover-only header-bar actions, ignoring portal file picker when sandboxed, dark-only UI