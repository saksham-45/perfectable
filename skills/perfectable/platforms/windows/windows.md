# Windows

Load before scoring platform conformance on `windows` or `adaptive`.

**Last verified:** Windows 11 24H2 / WinUI 3 1.5. Review annually.

## Windowing

- Caption buttons (min / max / close) on the **right**, system size and hover. Snap-layout flyout on maximize hover (Win11). Do not draw macOS traffic lights on Windows.
- Custom titlebar: drag region, `no-drag` on controls, double-click maximize, right-click system menu.
- App icon + title (filename — app name). Dirty document marked in the title.
- Menu bar is native or a window menu that behaves like one (Alt to focus, underlined mnemonics). Hamburger-only is a fail for a document app.
- System file dialogs (`IFileDialog` / Electron `dialog`). No `<input type="file">`.
- Preferences in a window (`Ctrl+,` common in tools). Confirmations are task dialogs, not web modals.

## Keyboard

`Ctrl+N`, `O`, `S`, `Shift+S`, `W`, `Z` / `Y`, `F` / `G`. `Alt+F4` closes the window. `Alt` focuses the menu. `F11` fullscreen if the app has it. Esc backs out.

## Appearance

Follow system light/dark (`uiSettings` / `nativeTheme`). Honor high-contrast themes — do not ship a palette that ignores `PrefersHighContrast`. Mica/Acrylic only on real chrome, not over the editor.

## Slop tests (automatic fail)

- Traffic-light dots on Windows.
- Hamburger as the only menu in a document app.
- Web file picker.
- Hover-only caption or tab actions.
- Dark-only UI that ignores high contrast.
- `Alt+F4` / `Ctrl+W` unbound.
