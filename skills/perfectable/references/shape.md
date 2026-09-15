# Shape

Discover what the app should be and how it should work. Return a confirmed brief. Do not write code. Do not pick a palette.

## Phase 1: Discovery

Ask two or three related questions, then wait. A precise prompt may need only confirmation.

Round 1 (always, unless the prompt already answered):

- What job must this surface finish, and for whom, in what situation?
- What is the primary object (file, project, buffer, graph, session)?
- Keyboard-first, pointer-first, or mixed? Document windows, one workspace, or palette-only?

Round 2 only for material gaps:

- Realistic ranges: file count, buffer size, open editors, panel count.
- States: first-run, empty, dirty, crash restore, LSP down, offline, permission denied.
- What must stay OS-native? What chrome is ours? What must remain untouched?

Never ask for CSS values or “VS Code / Zed / Xcode” as an aesthetic lane. Those names are IA references only when the user offers them.

## Phase 2: Workspace thesis

Pick one and defend it. Do not hybridize.

| Thesis | When it fits |
|---|---|
| **Editor-first** | Buffer is the product; chrome recedes (Zed, Sublime). |
| **Activity-bar workbench** | Several peer tools (edit, debug, git, search) share one window. |
| **Palette-first** | Experts live in the command palette; chrome is sparse. |
| **Document windows** | Multi-window OS documents, not one workspace (TextEdit, many native apps). |
| **Inspector + canvas** | Design/tool apps: canvas center, inspector edge. |

Write the topology: what is always visible, what toggles, what is a window vs a panel, where focus starts, how splits work, how layout persists.

## Phase 3: Brief

Smallest useful brief:

1. **Job and audience**
2. **Primary object and success**
3. **Workspace thesis and topology**
4. **Native contracts** (menus, dialogs, titlebar, appearance, quit)
5. **Keyboard** (primary chords, palette, focus rings)
6. **States and ranges**
7. **Scope, anti-goals, open decisions**

Three to five bullets when settled; full structure for multi-surface work. Present for confirmation or one correction round, then stop.
