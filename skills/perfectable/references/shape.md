# Shape

Discover what the workbench should be and how it should work. Return a confirmed brief. Do not write code. Do not pick a palette.

## Flags

- `--interactive` — Guided questioning mode. Prompts for each discovery question and waits for answer before proceeding. Use when the user wants to be walked through the process.

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

Never ask for CSS values or "VS Code / Zed / Xcode" as an aesthetic lane. Those names are IA references only when the user offers them.

## Phase 2: Workspace thesis

Pick one thesis and defend it. Do not hybridize.

| Thesis | When it fits | Composition |
|---|---|---|
| **Editor-first** | Buffer is the product; chrome recedes (Zed, Sublime). | `editor-first` |
| **Activity-bar workbench** | Several peer tools (edit, debug, git, search) share one window. | `activity-workbench` |
| **Palette-first** | Experts live in the command palette; chrome is sparse. | `palette-first` |
| **Document windows** | Multi-window OS documents, not one workspace (TextEdit, many native apps). | `document-window` |
| **Inspector + canvas** | Design/tool apps: canvas center, inspector edge. | `canvas-inspector` |

Then pick one composition from [canon/compositions.md](canon/compositions.md). The five theses map to the five compositions in the table. Use `three-pane` for a workspace whose job is a collection plus one open item, `object-browser` for files and other navigable objects, and `settings` only for a preferences window. One composition per window.

Load [canon/layout-geometry.md](canon/layout-geometry.md) and write the spatial contract. It is required. A brief without it is incomplete.

- Sovereign surface
- Posture: sovereign (hours in the window), transient (dialog or palette), or daemonic (almost no UI)
- Where air goes
- What collapses at compact width
- Which spacing roles the window will use (names only; lengths come from the platform file at build time)

Do not pick hex values.

## Phase 3: Brief

Smallest useful brief:

1. **Job and audience**
2. **Primary object and success**
3. **Workspace thesis, composition id, and spatial contract** (sovereign surface, posture, where air goes, compact behavior, spacing roles)
4. **Native contracts** (menus, dialogs, titlebar, appearance, quit)
5. **Keyboard** (primary chords, palette, focus rings)
6. **States and ranges**
7. **Scope, anti-goals, open decisions**

Three to five bullets when settled; full structure for multi-surface work. Present for confirmation or one correction round, then stop.
