# macOS

Load before scoring platform conformance on `macos` or `adaptive`. These are slop tests. Fail the audit when chrome violates them without a recorded APP.md exception.

## Windowing

- Traffic lights stay in the system position (titlebar left). Custom titlebars use `hiddenInset` and keep the 12pt buttons in the system inset. Do not draw fake dots.
- Custom titlebar: `-webkit-app-region: drag` on the bar, `no-drag` on every control. Double-click zoom. Document proxy icon when there is a file URL.
- `isDocumentEdited` / dirty indicator in the close button and Window menu. Untitled documents named “Untitled”.
- Menu bar is native (`Menu.setApplicationMenu` / SwiftUI commands). App / File / Edit / View / Window / Help at minimum. Preferences is **App menu → Settings…** (`Cmd+,`), never a hamburger.
- System file dialogs (`NSOpenPanel` / Electron `dialog`). No `<input type="file">`.
- Sheets attach to a window; app-modal dialogs are rare. Preferences is a window, not a sheet stacked on the editor.

## Keyboard

Required chords unless APP.md rebinds them: `Cmd+N`, `O`, `S`, `Shift+S`, `W`, `Q`, `Z` / `Shift+Z`, `,`, `F` / `G`. `Cmd+W` closes the window or tab according to the app's document model; `Cmd+Q` quits.
- Esc backs out. Return confirms. Space previews where a preview exists.
- Full Keyboard Access: every control is reachable. Visible focus ring.

## Appearance

Follow `NSAppearance` / `nativeTheme.themeSource = 'system'`. Honor Increase Contrast, Reduce Transparency, Reduce Motion. Vibrancy only on real materials (sidebar, titlebar), never as decoration over the editor.

## Slop tests (automatic fail)

- Hamburger menu as the only menu.
- Web CTA in the titlebar.
- Hover-only tab close or toolbar action.
- Custom traffic lights that do not match system geometry.
- Dark-only UI.
- `Cmd+W` unbound or mapped to something else.
- Settings in a modal overlaying the editor.
