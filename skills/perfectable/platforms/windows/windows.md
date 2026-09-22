# Windows

Load before scoring platform conformance on `windows` or `adaptive`.

**Last verified:** 2026-09-22 against Microsoft Learn content layout, spacing, targeting, materials, NavigationView, and Fluent 2 layout and typography. Review when those pages change.

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

## Metrics

These lengths belong to Windows. Other desktops do not inherit them.

- Standard density aligns controls to a 40×40 effective-pixel target and is for touch and pointer together. Compact density aligns to 32×32 and is the pointer mode for a sovereign tool. Apply compact with the WinUI compact resource dictionary at page or grid scope. Do not shrink a single control by hand.
- Content spacing from Microsoft Learn: 8epx between buttons and between a control and a flyout; 12epx between a control and its label and between content areas; 16epx from a surface edge to text. Those are the control, group, and inset roles.
- Fluent 2's ramp is a 4px grid plus 2, 6, and 10 so icons can sit optically. Body UI type is 14px / 20px (Segoe UI Variable). Caption is 12px / 16px.
- NavigationView, when the app uses that pattern: expanded pane at 1008px and above, icon-only from 641 to 1007, menu button at 640 and below. Content margin on that doc is 24px normally and 12px in minimal mode.
- Caption buttons stay the system size and position. Do not copy a pixel size from another skill file into a custom drawing.

## Materials

Mica is the window ground (opaque, wallpaper-tinted), especially title bar and navigation. Acrylic is for transient light-dismiss surfaces: menus, flyouts, popups. In-app acrylic blurs XAML inside the window and does not show the desktop. Scrolling content stays solid. A modal uses a dim scrim. High contrast uses system colors in every density.

## Slop tests (automatic fail)

- Traffic-light dots on Windows.
- Hamburger as the only menu in a document app.
- Web file picker.
- Hover-only caption or tab actions.
- Dark-only UI that ignores high contrast.
- `Alt+F4` / `Ctrl+W` unbound.
