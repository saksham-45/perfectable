# Changelog

## 2.0.0

Perfectable can now lay out a desktop window, not only reject a website in a frame.

- `layout`, `typeset`, and `materials` commands.
- A spatial canon: region grammar, spacing roles, spread, an optical pass, and eight compositions (`editor-first`, `three-pane`, `canvas-inspector`, `document-window`, `palette-first`, `activity-workbench`, `object-browser`, `settings`).
- Platform packs re-checked on 2026-09-22. macOS records the Liquid Glass functional layer and refuses unpublished control heights. Windows records standard 40epx versus compact 32epx, the 8 / 12 / 16epx content spacing, and mica / acrylic / solid. Linux records GNOME's adaptive rules without inventing a row height. Adaptive windows take the host's pixels at runtime.
- Critique scores rhythm, optical alignment, and spread (17 heuristics, 68 when all apply).
- `APP.md` schema 2 adds posture and composition. `CHROME.md` schema 2 adds spacing roles, a region map, measure, and the material layer.
- Detector rules: `glass-on-content`, `marketing-radius-on-row`, `ios-body-in-chrome`, `centered-hero-in-shell`, `equal-pane-grid`.
- Sample windows in `skills/perfectable/fixtures/`.
- The detector CLI resolves its real path, so a symlinked checkout still runs.
- Public guides: [docs/layout.md](docs/layout.md), [docs/commands.md](docs/commands.md).

## 1.0.0

Initial public release. Detector, critique, audit, installers for the major coding harnesses, and platform slop tests for macOS, Windows, and Linux.
