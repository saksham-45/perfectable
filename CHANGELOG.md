# Changelog

## 2.3.0

The running app is the lab, on every desktop.

- `prove --pid` dumps macOS AX, Windows UI Automation, or Linux AT-SPI. It does not stop at macOS.
- `prove --launch` starts the built app, waits, then dumps that process.
- Screenshots: `screencapture` on macOS, `System.Drawing` on Windows, `grim` / `gnome-screenshot` / `scrot` / `import` on Linux.
- `--golden` is a perceptual compare (32×32 MAE plus dHash). A re-encoded PNG of the same picture passes. A different picture does not.
- The accessibility score requires a menu bar, a window title, named buttons, and a Close / Minimize / Maximize control. That is the compiled-window HIG check, not a source regex.

## 2.2.0

Native toolkits are scanned. A project with no readable sources is uncovered (exit 3), not clean.

- Swift, Rust, QML, Dart, XAML, C, and C# are detector inputs.
- Rules for SwiftUI, egui, Qt, Flutter, GTK, and WinUI: unvirtualized lists, settings-in-a-sheet, frameless windows, hardcoded chrome, missing menus.
- Project rules for system Open, dirty title, and Escape dismiss.
- `perfectable prove` scores an accessibility tree (`--ax` or a live macOS `--pid`). It does not report clean when it could not look.
- Fixtures: `sloppy-swiftui`, `sloppy-egui`, `sloppy-qt`, `sloppy-flutter`, `sloppy-gtk`, `sloppy-winui`, `uncovered-swift`.

## 2.1.0

Dashboards are a surface of their own, and the refine passes a tool window was missing now exist.

- Compositions `briefing`, `exception-board`, and `ledger`. A wall of equal metric cards is not a dashboard composition. `shape` requires a spatial contract before styling. Product facts stay in `APP.md`; chrome stays in `CHROME.md`.
- Refine commands: `amplify`, `quiet`, `distill`, `first-run`, `clarify`, `motion`. Each says what it is for and what it refuses.
- Detector rule `metric-card-wall`. Accepted sample: `skills/perfectable/fixtures/briefing.html`. Failing sample: `slop-dashboard.html`.
- Critique heuristics for rhythm, alignment, and spread explicitly cover dashboards.
- Public command list in `docs/commands.md` names every pass and its refusals.

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
