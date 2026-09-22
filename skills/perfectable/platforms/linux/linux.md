# Linux

Load before scoring platform conformance on `linux` or `adaptive`. Target the desktop the app actually ships on (GNOME, KDE, or a declared toolkit). Do not fake macOS chrome on GNOME.

**Last verified:** 2026-09-22 against GNOME HIG principles, typography, and adaptive (pages dated 2025-12-03) and the KDE HIG (2026-05-05). Toolkit versions move; re-check the HIG before copying a widget size. No row height was published on those pages, so none is invented here.

## Windowing

- Client-side decorations follow the toolkit: libadwaita header bar on GNOME; native decorations on KDE unless the app has a reason. Window controls on the side the user configured (not hardcoded left dots).
- Drag the header bar. Double-click maximize. Right-click window menu.
- Menu: GNOME apps use primary menu + header-bar actions; KDE apps may use a menu bar. A web hamburger with no accelerators is a fail.
- System file dialogs (`GtkFileDialog` / portal / Electron `dialog`). No `<input type="file">`.
- Dirty state in the title. Close-with-unsaved uses a message dialog, not a web modal.

## Keyboard

`Ctrl+N`, `O`, `S`, `W`, `Q`, `Z`. `F10` / `Alt` for menus where the desktop uses them. Esc backs out. Follow the desktop's close-vs-quit convention (`Ctrl+Q` quit, `Ctrl+W` close).

## Appearance

Follow color-scheme portal / `prefers-color-scheme`. Honor high contrast and reduced motion. Do not ship a single baked dark theme.

## Metrics

These rules belong to the Linux desktop the app ships on. Do not copy macOS point sizes or Windows epx targets onto GTK or Qt.

- GNOME: the desktop font (Adwaita Sans). Few sizes and weights. Heavier for importance, smaller or lighter for secondary. Avoid italics in UI. Do not put text on a texture.
- GNOME layout: design from the smallest case up. Support 1024×600 on desktop. Cap prose with a max-width container. A sidebar stays in proportion to the content pane; it neither eats the window nor collapses to a sliver by accident. Header bar actions move to an overflow menu as the window narrows. Settings groups use boxed lists, not a dashboard of cards.
- KDE: native KWin decorations unless the app has a reason, standard shortcuts, density from the Qt style. A custom title bar still follows the user's button placement.
- Spacing roles stay distinct (tight, control, group, inset) even though the HIG pages checked did not publish a ramp. Use the toolkit's row and margin constants.

## Materials

Use the toolkit theme. Do not paint another desktop's vibrancy, mica, or traffic lights onto GTK or Qt. Honor the color-scheme portal, high contrast, and reduced motion.

## Slop tests (automatic fail)

- macOS traffic lights on GNOME/KDE.
- Web file picker.
- Hover-only header-bar actions.
- Ignoring the portal file picker when running sandboxed (Flatpak).
- Dark-only UI.
