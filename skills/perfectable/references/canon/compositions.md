# Compositions

Eight window grammars. `$perfectable shape` picks one. `$perfectable layout` builds that one. Do not blend two grammars in one window.

Each grammar records: when it fits, what is always visible, what toggles, where focus starts, sizes, where the air goes, and what to refuse. Lengths below are composition sizes, not control metrics. Control metrics stay in the platform pack.

Shared refusals, every grammar: a card grid as the workspace, a centered marketing hero, one spacing role everywhere, glass on the sovereign surface, and an icon-only activity rail unless the grammar is activity-workbench and the product has peer tools.

## editor-first

The buffer is the product. Lineage: Zed, Sublime, a focused text tool.

- Always visible: the buffer, a hairline frame, dirty state.
- Toggles: sidebar, inspector, terminal. All closed is a valid window.
- Focus starts in the buffer.
- Sizes: chrome uses the platform row metric. The buffer takes the rest.
- Air: inside the buffer. Prose and commit messages use the measure in [type.md](type.md). Code uses the pane width.
- Refuse: an activity bar, a dashboard of cards beside the buffer, padding that grows with the window.

## three-pane

A collection, a list, and one open item. Lineage: Mail, Linear.

- Always visible: list and detail. Sidebar may collapse.
- Toggles: sidebar, inspector inside the detail.
- Focus starts on the first list row or the search field if the job is finding.
- Sizes: sidebar and list stay at a readable minimum and a modest maximum. Detail takes the rest. Do not use three equal columns.
- Air: in the detail, on the reading measure. The list stays dense, one platform row per item.
- Refuse: cards in the list, a hero empty state floating between panes, the same padding in the list and the detail.

## canvas-inspector

A surface you look at, plus a rail of properties. Lineage: Figma, Keynote.

- Always visible: canvas and one command band.
- Toggles: inspector, layers or pages sidebar. Inspector width is remembered, about 240–320px, and does not grow with the window.
- Focus starts on the canvas.
- Sizes: canvas is edge to edge under the command band. Inspector is one column of label rail plus control rail.
- Air: on the canvas, as margin around the artboard or as the artboard itself. The inspector stays dense.
- Refuse: a second toolbar, cards around the canvas, the inspector stretched to half the window.

## document-window

One window, one document. Lineage: TextEdit, Preview.

- Always visible: the document and the native frame, including the proxy icon when there is a file.
- Toggles: inspector, format bar. No workspace switcher.
- Focus starts in the document.
- Sizes: the window remembers its own size. There is no split-view product.
- Air: the document measure. Margins grow; the text column does not.
- Refuse: a project sidebar, tabs of unrelated tools, a landing hero inside the document.

## palette-first

The list is the product. Lineage: Raycast, Spotlight.

- Always visible: one field and a results list.
- Toggles: a detail preview beside or below the list, only after a result is highlighted.
- Focus starts in the field.
- Sizes: the window is small and dense. Rows use the platform row metric. The window does not become a workspace when results are empty.
- Air: almost none. Separation is a section heading in the group role, then dense rows again.
- Refuse: a sidebar, marketing empty state, large type, pill buttons.

## activity-workbench

Several peer tools share one window: edit, debug, source control, and each is a real tool. Lineage: Xcode's debug layout, VS Code when the product is that product.

- Always visible: the sovereign tool and a mode switcher.
- Toggles: the panels that belong to the active mode.
- Focus starts in the sovereign tool, not on the mode switcher.
- Sizes: the mode switcher is a narrow rail or a native tab, using platform metrics. It is earned by peer tools, not by a single editor.
- Air: inside the active tool, following that tool's own grammar (often editor-first or three-pane).
- Refuse: a decorative icon rail copied from an IDE the product is not. The detector rule is `vscode-activity-bar`.

## object-browser

Navigate objects and look at them. Lineage: Finder, Files.

- Always visible: sidebar and the content view.
- Toggles: list, columns, or grid. A grid is for visual objects (images, devices, previews), not for settings or mail.
- Focus starts in the content view.
- Sizes: sidebar collapses as the window narrows, per the platform file. Content keeps a usable minimum.
- Air: between groups of objects. Rows or grid cells stay on the platform rhythm.
- Refuse: a unique card design per object type, a hero above the files, equal-width columns that ignore the selection.

## settings

A searchable form for preferences. Lineage: System Settings, GNOME Settings.

- Always visible: search and the active group.
- Toggles: a category sidebar when there are many groups. One group does not need a sidebar.
- Focus starts in search.
- Sizes: groups are inset from the window. Controls use the platform's standard or compact density for a transient window, not the editor's tightest row, and not a phone row.
- Air: the group role between groups. Inside a group, the control role.
- Refuse: a dashboard of metric cards, a modal over the editor, nested cards. Preferences are a window or a panel. The detector rule is `modal-preferences`.
