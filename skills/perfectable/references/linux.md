# Linux

Load before scoring platform conformance on `linux` or `adaptive`. Target the desktop the app actually ships on (GNOME, KDE, or a declared toolkit). Do not fake macOS chrome on GNOME.

## Windowing

- Client-side decorations follow the toolkit: libadwaita header bar on GNOME; native decorations on KDE unless the app has a reason. Window controls on the side the user configured (not hardcoded left dots).
- Drag the header bar. Double-click maximize. Right-click window menu.
- Menu: GNOME apps use primary menu + header-bar actions; KDE apps may use a menu bar. A web hamburger with no accelerators is a fail.
- System file dialogs (`GtkFileDialog` / portal / Electron `dialog`). No `<input type="file">`.
- Dirty state in the title. Close-with-unsaved uses a message dialog, not a web modal.

## Keyboard

`Ctrl+N`, `O`, `S`, `W`, `Q`, `Z`. `F10` / `Alt` for menus where the desktop uses them. Esc backs out. Follow the desktop’s close-vs-quit convention (`Ctrl+Q` quit, `Ctrl+W` close).

## Appearance

Follow color-scheme portal / `prefers-color-scheme`. Honor high contrast and reduced motion. Do not ship a single baked dark theme.

## Slop tests (automatic fail)

- macOS traffic lights on GNOME/KDE.
- Web file picker.
- Hover-only header-bar actions.
- Ignoring the portal file picker when running sandboxed (Flatpak).
- Dark-only UI.
