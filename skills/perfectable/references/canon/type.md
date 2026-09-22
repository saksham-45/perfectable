# Type

Owns the distinction between chrome type and document type, the measure, and the way emphasis is made. Face sizes and the platform UI font live in the platform pack. Load that file for numbers.

## Chrome

- Use the platform UI face. A different face needs one sentence in CHROME.md naming why the platform face cannot do the job.
- Use the platform file's chrome sizes. Desktop chrome is not the phone body size. The iOS body size in a titlebar, tree, tab, or status is a defect (`ios-body-in-chrome` when the scanner can see it).
- One family for chrome. Mono is for code, the terminal, and diffs.
- Emphasis is one step of weight, usually regular to semibold. A second family, a display face, or all-caps is the wrong tool for a label.
- Tracking stays near zero in chrome. Open it slightly only at the smallest platform caption. Negative tracking belongs to display sizes, which chrome almost never uses. If a splash or About window uses a display size, tracking does not go past -0.04em.
- The scale inside chrome stays tight, about 1.125 to 1.2 between steps. A marketing ramp (a jump from a caption to a hero) does not belong in a toolbar.
- Do not fluid-size chrome with `clamp()` or `vw`. The window changes by reflowing regions, not by inflating the toolbar type.

## Document

- Prose, messages, and articles: 45–75 characters per line, with 66 a good aim. Cap the column and let the margin grow. This is the spread rule in [layout-geometry.md](layout-geometry.md) applied to text.
- Code, tables, and canvases use the pane. They do not inherit the prose measure.
- Long text still has a max width on large windows. GNOME states this as a container limit; the same failure exists on every desktop.

## Figures and alignment

- Tabular figures in gutters, counts, durations, diffs, and the status line.
- Numeric columns align right. Decimal columns align on the decimal.
- Line length, truncation, and the largest text size the app claims all get checked in the same pass. A row that clips at the user's larger text size is unfinished.
