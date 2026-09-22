# Adapt

Make chrome work across window sizes, appearances, and density — not a restyle.

Load the platform file first. Native windowing beats CSS breakpoints.

## Check

- **Widths:** compact (~800px), regular (~1200px), wide (~1600px+). Collapse what the active composition names, not a generic sidebar. At wide, prose stays on the measure in [canon/type.md](canon/type.md) and the margin grows; a card must not float in an empty window. No horizontal clip of tabs or the title. Platform examples live in the platform pack (macOS sidebar auto-collapse, NavigationView breakpoints). Do not copy those pixels here.
- **Heights:** short laptop screens; status + tabs + titlebar must leave an editor.
- **HiDPI:** hairlines stay 1px device, icons snap to the grid, no blurry custom window controls.
- **Appearances:** light, dark, system follow. High contrast if the OS has it.
- **Compact chrome:** a density toggle or a width at which labels drop and tooltips + shortcuts remain.
- **Multi-window / multi-monitor:** extra document or panel windows remember screen and size.
- **Keyboard overlay:** OS keyboard viewer / on-screen keyboard must not cover the focused field without scrolling.

## Platform-Specific Compact Chrome

### macOS
- **Toolbar/Titlebar:** Use `NSToolbar` with `displayMode: .iconOnly` at compact widths; full labels at regular+. System automatically hides labels on small windows.
- **Sidebar:** Collapse to icon-only at ~900px; use `NSSplitViewController` with `minimumThickness`.
- **Traffic Lights:** Always stay in system position (top-left inset). Never reposition.
- **Window Controls:** Use standard `hiddenInset` titlebar; compact mode reduces padding, not control size.
- **Density Toggle:** `View` menu → `Compact` / `Standard` density; persists per-window.

### Windows
- **Titlebar:** Caption buttons (min/max/close) stay right-aligned at system size (46×32px). Snap Layout flyout on maximize hover (Win11).
- **Toolbar/Command Bar:** Use `CommandBar` with `DefaultLabelPosition="Right"`; switches to `Collapsed` (icons only) at compact widths via `CompactModeThresholdWidth`.
- **Sidebar:** `NavigationView` with `CompactModeThresholdWidth` (default 641px); pane becomes icon-only overlay.
- **Density:** No system density toggle; app provides `Compact` / `Standard` in View menu.
- **High Contrast:** Must work in all density modes; use system colors (`SystemColor`).

### Linux (GNOME / libadwaita)
- **Header Bar:** `AdwHeaderBar` with `show-title` / `show-end-title-buttons`; at compact widths, title truncates, actions move to overflow menu.
- **Sidebar:** `AdwNavigationPage` / `AdwNavigationSplitView`; collapses to icon-only at `compact` breakpoint (configured via `AdwApplication`).
- **Window Controls:** Follow GTK theme (left/right per user setting). Never hardcode position.
- **Density:** libadwaita provides `AdwStyleManager` with `high-contrast` and `color-scheme`; density is per-widget via CSS.
- **Portal File Picker:** Required for sandboxed (Flatpak) apps; use `GtkFileDialog` which auto-uses portal.

### Linux (KDE / Qt)
- **Titlebar:** Native KWin decorations; use `KTitleBar` for custom. Compact mode reduces margins.
- **Sidebar:** `KStandardDirModel` + `QTreeView` with `KFileWidget`; collapses via `QSplitter`.
- **Density:** Qt supports `QApplication::setAttribute(Qt::AA_UseHighDpiPixmaps)`; compact via stylesheet.

## Method

1. Identify which of the above the target actually claims to support.
2. Inspect at those sizes and appearances together in one pass.
3. Fix structural issues (flex/grid, split mins, titlebar drag region, safe-area/insets) before visual tweaks.
4. Re-inspect once. Stop.

Do not introduce a mobile layout. This skill does not ship phone UIs.
