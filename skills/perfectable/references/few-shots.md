# Few-shots

Read this before writing the first window. The failing tree is the input. The clean tree is the shape to copy. Do not restyle the failure in place.

| Failure | What the detector names | Clean shape |
|---|---|---|
| `tests/fixtures/sloppy-electron` | Node in the renderer, fake traffic lights, violet activity bar, web file input, settings modal | `tests/fixtures/clean-electron` — preload, native menu, system dialog, drag region |
| `tests/fixtures/sloppy-swiftui` | ScrollView+ForEach, settings sheet, fixed 13pt, Open writes a path, no `.commands` | `tests/fixtures/native-swiftui` — DocumentGroup, NSOpenPanel, Settings scene, menu commands |
| `tests/fixtures/sloppy-egui` | ScrollArea `for` loop, `Color32(124,58,237)`, no menu | `show_rows`, theme color, `menu::bar` |
| `tests/fixtures/sloppy-qt` | Frameless window, Repeater, no MenuBar | `startSystemMove` or system frame, ListView, MenuBar |
| `tests/fixtures/sloppy-winui` | `#7C3AED` chrome, ContentDialog settings, Open button, dirty title missing | `tests/fixtures/native-winui` — ThemeResource, FileOpenPicker, title `●` |
| `tests/fixtures/sloppy-flutter` | `ListView(children:)` | `ListView.builder` |
| `tests/fixtures/sloppy-gtk` | Hex in a GtkCssProvider | Theme named colors, `Gtk.FileDialog` |

An empty `Package.swift` with no Swift sources is exit 3 (`uncovered`), not clean. Do not tell the user the native app passed.

Live check, when a window is running: `perfectable prove --pid <pid>`. Without a tree, prove exits 3.
