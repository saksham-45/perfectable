# Init

Capture durable product truth in `APP.md`. Do not invent a visual world and do not write `CHROME.md` (`document` / `shape` own that).

## Step 1: Load current state

Use the APP.md path `context.mjs` printed. Update it; do not create a second authority.

- **No APP.md:** explore, interview, write it.
- **APP.md exists:** ask what is stale; do not reopen confirmed fields without a reason.

## Step 2: Explore

Scan enough that the user does not repeat known facts: README, package.json / Cargo.toml / `*.xcodeproj`, `src-tauri/`, Electron main process, window options, existing menus, about/license, accessibility notes.

**Pre-fill from package.json** (auto-detected, confirm with user):
- `dependencies.electron` → Shell: `electron`, Platform: `macos` (if macOS) / `windows` / `linux`
- `dependencies."@tauri-apps/api"` → Shell: `tauri`
- `dependencies."@tauri-apps/cli"` → Shell: `tauri`
- `scripts.tauri` → Shell: `tauri`
- `build.appId` (Electron) → Product identifier
- `productName` → App name
- `description` → Product purpose hint

Treat repo evidence as hypothesis, not approval. Form a platform hypothesis: `macos`, `windows`, `linux`, or `adaptive`. An Electron/Tauri wrapper is still desktop; its chrome must follow the host OS. Mobile web stays out of this skill.

## Step 3: Interview

Ask only material gaps. At most two rounds of two or three questions. Confirm inferences. Do not ask for palettes, fonts, or “make it look like VS Code” as a default.

Start with what most changes later work:

1. Who is the primary user, in what situation, and what job in the first ten seconds?
2. Platform and shell: macOS / Windows / Linux / adaptive; Electron, Tauri, SwiftUI, WinUI, GTK, or other native.
3. Windowing: document windows, single workspace, or palette-only? Keyboard-first, pointer-first, or mixed?
4. What must remain native (menu bar, file dialogs, appearance, quit) versus what chrome is ours?

## Step 4: Write APP.md

Write only confirmed facts and explicitly marked open decisions. New files go at the project root `APP.md`.

```markdown
# App

<!-- perfectable:app-schema 2 -->

## Platform

macos

## Shell

electron

## Windowing

workspace

## Posture

sovereign

## Composition

editor-first

## Input

keyboard-first

## Users

[Primary users, situation, job. Other audiences only when confirmed.]

## Product Purpose

[What the app does, why it exists, what success means.]

## Positioning

[The mechanism a neighboring product could not truthfully copy.]

## Operating Context

[Files, projects, OS integration, rituals that are factual parts of use.]

## Personas

[Optional: 1–2 project-specific personas if audience differs from built-in (Alex, Jordan, Sam, Riley, Morgan, Devin). Format:
- name: "Persona Name"
  tests: [specific test scenarios]
  red_flags: [specific failure modes]
Only include if built-in personas don't cover your audience.]

## Capabilities and Constraints

[Confirmed functionality, technical constraints, terminology, undecided facts.]

## Native Contracts

[Menu bar, system dialogs, appearance follow, document model, quit, about. What must stay OS-native.]

## Evidence on Hand

[Real content, fixtures, screenshots, with paths. State absences that later work must not fabricate.]

## Product Principles

[Three to five durable principles. No visual recipes.]

## Accessibility

[Known needs or required standard. Omit when none established.]
```

`## Platform` is the bare value `macos`, `windows`, `linux`, or `adaptive`. `## Shell` is `electron`, `tauri`, `swiftui`, `winui`, `gtk`, or `native`. `## Windowing` is `document`, `workspace`, or `palette`. `## Posture` is `sovereign`, `transient`, or `daemonic`. `## Composition` is one id from [canon/compositions.md](canon/compositions.md). `## Input` is `keyboard-first`, `pointer-first`, or `mixed`.

Copy the `perfectable:app-schema 2` comment verbatim.

After writing, load the platform reference for the value you recorded (`macos.md` / `windows.md` / `linux.md`, or all three for `adaptive`) before any chrome work.

## Step 5: Wrap up

Summarize captured and deliberately undecided facts. Do not offer CHROME.md merely because it is missing.

- Empty project: ask for the first surface, or `$perfectable shape`.
- Existing chrome, no CHROME.md: `$perfectable document`.
- Existing surface needing work: name the scoped command.
