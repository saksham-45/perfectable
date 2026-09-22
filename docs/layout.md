# Layout

How Perfectable places a desktop window. The agent copies are normative:

- [Region grammar, spacing roles, spread, optical pass](../skills/perfectable/references/canon/layout-geometry.md)
- [Eight compositions](../skills/perfectable/references/canon/compositions.md)
- [Chrome type versus document type](../skills/perfectable/references/canon/type.md)
- [Color, elevation, materials](../skills/perfectable/references/canon/materials.md)
- [Where the rules come from](../skills/perfectable/references/canon/historical.md)
- Platform lengths: [macOS](../skills/perfectable/platforms/macos/macos.md), [Windows](../skills/perfectable/platforms/windows/windows.md), [Linux](../skills/perfectable/platforms/linux/linux.md)

If this page and a platform file disagree on a pixel, the platform file wins. It is the one that gets re-checked against the Human Interface Guidelines.

## One surface owns the leftover space

A window is a stack of regions. One of them is sovereign: the editor, the canvas, the document, or the list the person actually came to use. Everything else is chrome.

| Region | Job |
|---|---|
| Frame | Title, dirty state, the operating system's window controls |
| Command band | One row of frequent actions, grouped |
| Navigation | A sidebar or a palette, not both fighting over the same choice |
| Sovereign surface | The task. This region grows when the window grows |
| Inspector | A narrow rail for the selection. Hidden when nothing is selected |
| Status | One line. Counts use tabular figures |
| Transient | Menu, popover, sheet. Anchored to what opened it, then gone |

The operating system's window buttons sit in the system inset. They are not part of the toolbar's alignment grid. On macOS, keep critical controls off the bottom edge of the window. People park that edge below the screen.

## Two intervals, or the layout has no hierarchy

Name every gap. A finished window shows at least two of these. One padding value on the toolbar, the sidebar, and the document is the failure Perfectable is built to catch.

| Role | What it separates |
|---|---|
| hairline | Two regions that share an edge. A one-device-pixel separator, or the toolkit's splitter |
| tight | An icon and its own label, or segments inside one control |
| control | Sibling buttons in one group |
| group | A label and its field, or one group and the next |
| inset | The edge of a surface and the first text inside it |
| region | The boundary between panes. A split view, not a wide CSS gutter |

More space sits above a heading than below it. Rows in one list share a height. A section break is a jump, not another copy of the row padding.

Lengths come from the host. Windows publishes them: 8epx between buttons, 12epx between a control and its label and between content areas, 16epx from a surface edge to text. Standard density targets 40×40epx (touch and pointer). Compact density targets 32×32epx and is the pointer mode for a tool someone lives in. macOS sidebar size is the user's small / medium / large setting. The current Sidebars page does not publish point sizes, so Perfectable does not invent them. GNOME asks for a max width on long text, a sidebar that stays in proportion, and the desktop font. It does not publish a row-height ramp, so none is invented.

## Where the air goes

Leftover space goes to the sovereign surface.

- Prose stays near 66 characters (the useful band is 45–75) and the margin grows.
- Code, tables, and canvases use the pane. They do not sit in a centered card.
- Chrome does not grow its padding to fill a large monitor.
- A centered column is for a dialog. A tool pins the work to the pane.

Equal columns for unequal jobs are a failed composition. A sidebar, a list, and a message are not three copies of the same card.

## Dashboards

A dashboard is a tool surface. Pick one composition before styling. The spatial contract names the sovereign region, where leftover space goes, and at least two spacing roles. What a number means is a product fact and stays in `APP.md`. How the chrome is drawn stays in `CHROME.md`.

| Id | Sovereign | Supporting numbers |
|---|---|---|
| `briefing` | One primary figure | A list or table beside it. Not a row of peer tiles |
| `exception-board` | The anomaly list | Totals in the status line |
| `ledger` | The table | Filters in the command band. Numeric columns use tabular figures |

A wall of equal metric cards fails. The detector rule is `metric-card-wall` when it can see three or more `metric-card`, `kpi-card`, or `stat-card` elements on an equal track. A dense but legitimate table does not use those classes and does not trip the rule. `critique` still scores rhythm, alignment, and spread when the scan is clean.

## Window grammars

`shape` picks one. `layout` builds that one. Do not blend two in a single window.

| Id | When | Where the air goes |
|---|---|---|
| `editor-first` | The buffer is the product | Inside the buffer |
| `three-pane` | A collection, a list, and one open item | The detail's reading measure. The list stays dense |
| `canvas-inspector` | A surface you look at, plus properties | On the canvas. The inspector stays about 240–320px and does not grow with the window |
| `document-window` | One window, one document | The document measure |
| `palette-first` | One field and a results list | Almost none. The list is the product |
| `activity-workbench` | Several real peer tools share a window | Inside the active tool. An icon rail is earned by those tools |
| `object-browser` | Files and other objects | Between groups. A grid is for pictures, not for settings |
| `settings` | Preferences | Between groups. Search first. Not a dashboard of metric cards |
| `briefing` | One figure plus the list that explains it | In the figure's column. Supporting numbers are rows |
| `exception-board` | The exception list | Between severity groups. Totals stay in the status line |
| `ledger` | The table | Inset, then the row rhythm. Not a card around each row |

Posture comes before padding. Sovereign: hours in the window, dense chrome. Transient: a dialog, larger targets, one job. Daemonic: almost no interface.

## Type

Chrome uses the platform face at the platform's chrome size. On Windows that body size is 14px / 20px (Segoe UI Variable). macOS chrome is not the 17pt iOS body. A custom face needs one sentence in `CHROME.md`.

Emphasis is one step of weight. Mono is for code, the terminal, and diffs. Tracking in chrome stays near zero. Do not fluid-size a toolbar with `clamp()` or `vw`.

## Materials

Three layers. A surface is only one of them.

| Layer | Holds | Material |
|---|---|---|
| Content | Editor, table, document, canvas | Solid. No blur |
| Functional | Toolbar, sidebar, tab bar | The platform's chrome material |
| Transient | Menus, popovers, flyouts | The platform's transient material |

On Apple platforms the functional layer is Liquid Glass, and it floats above content. Text-heavy sidebars use the regular variant. Do not stack glass on glass. On Windows, mica is the window ground, acrylic is for light-dismiss surfaces, and scrolling content stays solid. On Linux, use the toolkit theme. Do not paint another desktop's vibrancy onto GTK or Qt.

The accent marks selection, the primary action, and real state. Light, dark, and high contrast follow the operating system unless `APP.md` records a reason, such as a color-critical canvas.

Radius follows the control. A large radius on a dense row is a costume. One elevation statement per surface: a separator, or a material, or a shadow.

## What the scanner can see

`layout` judges rhythm and spread by looking at the window. The detector only catches mechanical tells:

- `glass-on-content`
- `marketing-radius-on-row`
- `ios-body-in-chrome`
- `centered-hero-in-shell`
- `equal-pane-grid`

A clean scan does not mean the spacing is right. The sample windows in `skills/perfectable/fixtures/` are the picture of both failures and accepted compositions.

## Sources

Apple's layout, materials, sidebars, and toolbars guides, plus Adopting Liquid Glass. Microsoft Learn's content spacing, density, materials, and NavigationView, plus Fluent 2 type. The GNOME Human Interface Guidelines (principles, typography, adaptive layouts) and the KDE HIG. Older rules that still govern a desktop — Xerox Star, the 1987 Macintosh guidelines, IBM CUA, the 1995 Windows guidelines, Nielsen, Fitts, Gestalt grouping, Tufte, Bringhurst, Cooper's postures — are distilled in the historical file, each as one rule with its citation.
