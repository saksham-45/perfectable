# Layout geometry

Owns region grammar, spacing roles, rhythm, spread, alignment, and the optical pass. Pixel sizes live in the platform pack (`platforms/macos/macos.md`, `windows/windows.md`, `linux/linux.md`). Prose measure lives in [type.md](type.md). Layer materials live in [materials.md](materials.md). Compositions live in [compositions.md](compositions.md).

Load this from `$perfectable layout` before moving anything. A pinned APP.md / CHROME.md overrides it.

## Regions

A desktop window is a stack of regions with different jobs. One region is sovereign: it receives leftover space.

| Region | Job | What belongs in it |
|---|---|---|
| Frame | Identify the document and carry the OS window controls | Title, dirty state, proxy icon. OS controls stay in the system inset and are not part of the toolbar's alignment grid. |
| Command band | Frequent commands, one row | Grouped actions. Leading: navigation and title. Trailing: inspector toggle, search, one persistent primary action. |
| Navigation | Move between objects or modes | Sidebar or a palette. Not both competing for the same choice. |
| Sovereign surface | The task | Editor, canvas, document, or list. This region grows. |
| Inspector | Edit the selection | A narrow trailing rail. Hidden when nothing is selected, unless the product is the inspector. |
| Status | One line of state | Counts, mode, path. Tabular figures. |
| Transient | A short interruption anchored to its source | Menu, popover, palette, sheet. Leaves. Does not become the layout. |

Critical controls stay out of the bottom edge of a macOS window; people park that edge below the screen. The citation and the rest of the macOS frame rules are in the macOS platform file.

## Spacing roles

Name every interval with a role. A finished window uses at least two roles. One role everywhere is a failed layout.

| Role | Relationship |
|---|---|
| hairline | Two regions share an edge. A separator of one device pixel, or the toolkit's splitter. Not a padded gutter. |
| tight | An icon and its own label, or segments inside one control. |
| control | Sibling controls in one group. |
| group | A label and its field, or one group and the next group. |
| inset | The edge of a surface and the first text inside it. |
| region | The boundary between panes. Use the platform split view. Do not invent a wide CSS gap and call it a gutter. |

The platform file maps each role to a length. When the platform file is silent, keep the roles distinct anyway: tight is visibly tighter than control, control tighter than group, group tighter than the air inside the sovereign surface.

More space sits above a heading than below it. Rows inside one list share one height. A section break is a jump to the group role, not another copy of the row padding.

Space is measured from the border box. Icons still need the optical pass below, because a bounding-box grid does not put an arrowhead on the cap line.

## Spread

Leftover space goes to the sovereign surface.

- Reading text uses the measure in [type.md](type.md). The column stays that wide and the margin grows.
- Tables, code, and canvases use the pane. They do not sit in a centered card.
- Chrome does not grow its padding to fill a large monitor. A wider window adds canvas, columns of content, or an inspector, in that order for the active composition.
- Do not center a narrow column in a sovereign window. Centering is for a transient dialog.
- Empty space in the middle of three equal columns is not spread. Give the width to the region that holds the work.

## Alignment

- Forms: one rail for labels, one rail for controls. Values that share a column share an edge.
- Panes: shared edges across the split. The sidebar's top content lines up with the sovereign surface's top content, under the same command band.
- Numbers: tabular figures, right-aligned, decimal-aligned when the column is numeric. Owned with type in [type.md](type.md).
- Selection does not change row height.
- Scrollbars and focus rings do not reflow layout. Reserve the scrollbar gutter. Draw focus outside the box or on top of it.
- OS window controls sit in the system inset. Start the command band after that inset.

## Optical pass

Run this on a screenshot after the roles are in place.

- Place an icon's optical center on the cap height of the adjacent label, not the center of its bounding box.
- Center a button label optically. A geometric center often sits low because of the baseline.
- Toolbar icons share one cap line and one stroke weight.
- Two borders touching means one of them goes.
- One elevation statement per surface: a separator, or a material, or a shadow. The material rules are in [materials.md](materials.md).

## Hierarchy

Establish order with position, then weight, then space, then tone. Draw a container only when the group is a real object: a message, a file, a diff hunk, a selected card of visual content. Related commands group by the tight and control roles. A box around them is a second grouping and usually a mistake.

Reading order follows the platform: top to bottom, leading edge to trailing edge, and mirrored for right-to-left. The most important object is near the leading top of the sovereign surface.

## Squint test

Blur the detail. Name, in order, the primary region, the secondary region, and the groups. "Three equal cards" means the composition is wrong. Go back to [compositions.md](compositions.md) before decorating.

## Extremes

Inspect together: a very long name, empty, a single item, overflowing tabs, strings about 40 percent longer than English, the largest text size the app claims to support, a short laptop height, and the compact and wide widths in the active composition. Structure holds if nothing overlaps, nothing clips a control, and focus order still matches visual order.
