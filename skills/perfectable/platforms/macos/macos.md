# macOS

Load before scoring platform conformance on `macos` or `adaptive`. These are slop tests. Fail the audit when chrome violates them without a recorded APP.md exception.

**Last verified:** 2026-09-22 against Apple HIG Layout, Materials, Sidebars, Toolbars, and Adopting Liquid Glass. Review when those pages change. Numeric sidebar row heights from the macOS 11 table were not republished on the current Sidebars page; do not treat them as current law.

## Windowing

- Traffic lights stay in the system position (titlebar left). Custom titlebars use `hiddenInset` and keep the 12pt buttons in the system inset. Do not draw fake dots.
- Custom titlebar: `-webkit-app-region: drag` on the bar, `no-drag` on every control. Double-click zoom. Document proxy icon when there is a file URL.
- `isDocumentEdited` / dirty indicator in the close button and Window menu. Untitled documents named "Untitled".
- Menu bar is native (`Menu.setApplicationMenu` / SwiftUI commands). App / File / Edit / View / Window / Help at minimum. Preferences is **App menu → Settings…** (`Cmd+,`), never a hamburger.
- System file dialogs (`NSOpenPanel` / Electron `dialog`). No `<input type="file">`.
- Sheets attach to a window; app-modal dialogs are rare. Preferences is a window, not a sheet stacked on the editor.

## Keyboard

Required chords unless APP.md rebinds them: `Cmd+N`, `O`, `S`, `Shift+S`, `W`, `Q`, `Z` / `Shift+Z`, `,`, `F` / `G`. `Cmd+W` closes the window or tab according to the app's document model; `Cmd+Q` quits.
- Esc backs out. Return confirms. Space previews where a preview exists.
- Full Keyboard Access: every control is reachable. Visible focus ring.

## Appearance

Follow `NSAppearance` / `nativeTheme.themeSource = 'system'`. Honor Increase Contrast, Reduce Transparency, Reduce Motion. Vibrancy only on real materials (sidebar, titlebar), never as decoration over the editor.

## Metrics

These lengths belong to macOS. Other desktops do not inherit them.

- Sidebar size is small, medium, or large, and the user sets it in System Settings. Text and glyph scale with that size. A custom Electron sidebar picks one size and stays there; it does not invent a fourth.
- The current Sidebars page does not publish a point size. When system controls are unavailable, the archived macOS 11 baseline (small 24pt, medium 28pt, large 32pt) is a fallback, labeled as archive, not as Tahoe law. Prefer a system sidebar.
- Mini, small, and medium controls stay rounded rectangles so an inspector can stay dense. Large and extra-large are capsules for emphasis, not the default button. Inspectors and popovers may opt into compact control metrics (`prefersCompactControlSizeMetrics`). Tahoe control heights were described in WWDC25 session 310 and were not published as a table on the pages checked; use system controls rather than hard-coded heights.
- Toolbar items group by related action. Leading edge: sidebar toggle and title. Trailing edge: inspector, search, one primary action. Custom controls stay concentric with the bar. Keep the traffic-light inset clear of that grid.
- Spacing roles in [../../references/canon/layout-geometry.md](../../references/canon/layout-geometry.md) map here as: tight inside a control, control between toolbar siblings, group between form groups, inset looser in a free-standing panel than inside a sidebar row. The older toolbar specification used 8pt between rectangular toolbar controls; the current Toolbars page says to prefer system spacing and does not restate that number, so use system toolbar metrics rather than hard-coding 8. A splitter is a splitter.

## Materials

Liquid Glass is the functional layer: toolbars, sidebars, tab bars. It floats above content. Content (editor, table, document, canvas) stays solid. Text-heavy functional surfaces (sidebars, alerts, popovers) use the regular variant, not clear. Do not stack glass on glass. Do not crowd; use the system spacing. Reduce Transparency makes the layer solid. Increase Contrast keeps a defined edge. Reduced Motion removes the fluid travel and keeps the state change.

## Slop tests (automatic fail)

- Hamburger menu as the only menu.
- Web CTA in the titlebar.
- Hover-only tab close or toolbar action.
- Custom traffic lights that do not match system geometry.
- Dark-only UI.
- `Cmd+W` unbound or mapped to something else.
- Settings in a modal overlaying the editor.
