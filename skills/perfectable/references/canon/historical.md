# Historical rules

One rule per source, the one that still governs a desktop window. Citations are the place to look the rule up. Applied numbers live in the platform pack, [layout-geometry.md](layout-geometry.md), [type.md](type.md), and the craft floor.

| Source | Rule this skill keeps |
|---|---|
| Xerox Star. Johnson, Roberts, Verplank, Smith, Irby, Beard, "The Xerox Star: A Retrospective," IEEE Computer, September 1989. | Act on a visible object, then choose a command. The screen shows the state. Progressive disclosure. Few modes. |
| Apple Human Interface Guidelines, 1987; later Clarity, Deference, Depth. | The window belongs to the platform (aesthetic integrity). Objects do not jump (perceived stability). Undo beats a confirmation (forgiveness). Chrome gives way to content (deference). |
| IBM Common User Access, 1987–1991. | Object, then action. Standard commands live in standard menus with standard shortcuts. |
| Microsoft, The Windows Interface Guidelines for Software Design, 1995. | The frame is title, menu, command band, content, status. An ellipsis means the command needs more input. The title identifies the document and is not a toolbar. |
| Nielsen, 10 usability heuristics, 1994, with the NN/g revisions. | Already scored in `references/critique.md`. Spatial rhythm, optical alignment, and spread are additional heuristics there, not replacements. |
| Fitts 1954; Shannon form, MacKenzie 1992. | Larger and closer targets are faster. A menu bar at the screen edge cannot be overshot; a hamburger inside the window can. Pointer targets and touch targets are different sizes; the platform pack picks the desktop size. |
| Gestalt grouping, via Johnson, Designing with the Mind in Mind, and Lidwell, Holden, Butler, Universal Principles of Design. | Proximity and alignment group first. A drawn box is for when proximity is not enough. That is why a card is the last grouping tool in [layout-geometry.md](layout-geometry.md). |
| Tufte, Envisioning Information, and The Visual Display of Quantitative Information. | Separate with tone and space. Erase a box that does not encode a difference. Show overview and detail together (the inspector). Repeat a small structure instead of inventing new chrome. |
| Bringhurst, The Elements of Typographic Style. | Prose has a measure. Chrome labels, tables, and code do not use that measure. Applied in [type.md](type.md). |
| Müller-Brockmann, Grid Systems in Graphic Design; Tschichold on asymmetry. | A grid relates edges. An asymmetric window is the calm one when the task is asymmetric: narrow navigation, wide work, optional inspector. |
| Cooper, Reimann, Cronin, About Face. | Sovereign posture: hours in the window, dense chrome, leftover space to the work. Transient: a dialog, larger targets, one job. Daemonic: almost no UI. Pick the posture in `shape` before picking padding. |
| Raskin, The Humane Interface. | A mode is visible or it is a defect. The same shortcut does the same thing. A command palette is not a second menu with different verbs. |
| WCAG 2.2. | Non-text contrast and target-size criteria. The thresholds this skill enforces are the craft floor's contrast lines and the platform pack's hit targets. |
| Apple HIG Layout, Materials, Sidebars, Toolbars; Adopting Liquid Glass; WWDC25 design sessions. Checked 2026-09-22. | Current macOS application of deference: a functional layer above solid content, system spacing, sidebar size follows the user's setting. Details and any number that is still published live only in `platforms/macos/macos.md`. |
| Microsoft Learn content layout, spacing, targeting, materials; Fluent 2 layout and typography; NavigationView. Checked 2026-09-22. | Current Windows application: a spacing ramp, standard density for touch, compact density for pointer-heavy tools, mica on the window, acrylic on transient surfaces, solid content. Details live only in `platforms/windows/windows.md`. |
| GNOME HIG principles, typography, adaptive; KDE HIG; elementary HIG (defers to GNOME where unwritten). GNOME pages checked 2025-12-03, KDE 2026-05-05. | One job, progressive disclosure, undo rather than confirm, the desktop font, a max width on long text, the toolkit's own chrome. Details live only in `platforms/linux/linux.md`. |
| apple-design skill, attributing eight principles to WWDC 2026: Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight. | Not re-verified against a primary Apple page here. Use as critique language. Delight is the result of the other seven, not a decoration pass. Motion physics stays in that skill. |

2024–2026 apps are lineage in [compositions.md](compositions.md), not palettes to copy: Mail, Finder, Notes, Windows 11 Explorer and Settings, GNOME Files, Linear, Raycast, Figma, Zed, Things.
