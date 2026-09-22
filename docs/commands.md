# Commands

`/perfectable` with no argument shows a menu. An explicit command loads one playbook. A complaint about spacing, alignment, empty space, or hierarchy loads `layout` before anything else.

Pinned `APP.md` beats taste. Existing chrome, once written into `CHROME.md`, beats a new palette. A clean detector run is not a certificate.

Product facts (who it is for, what the numbers mean, the native contracts) live only in `APP.md`, written by `init`. Visual decisions (tokens, spacing roles, the material layer) live only in `CHROME.md`, written by `document`. A pass that styles the window does not rewrite product facts. A pass that records product facts does not pick a palette.

A dashboard is a desktop surface. It is not a webpage and it is not left without a layout. Before styling, `shape` names a spatial contract: the sovereign region, where leftover space goes, and at least two spacing roles. Legitimate dashboard compositions are `briefing`, `exception-board`, and `ledger`. A wall of equal metric cards is none of them.

A clean `detect` run is not a quality certificate. Rhythm, alignment, and spread are scored by `critique`.

| Command | What the pass is for | What it refuses |
|---|---|---|
| `init` | Durable product setup in `APP.md`: platform, shell, posture, composition, native contracts | A visual system, hex values, or chrome tokens |
| `document` | Document the incumbent chrome into `CHROME.md` | Inventing tokens the code does not use; overwriting product truth |
| `shape` | Plan the workspace before code, including a dashboard composition | Hybrid theses, a metric-card wall, CSS values, code |
| `layout` | Regions, rhythm, spread, then an optical pass | Restyling a wrong composition; one padding value everywhere |
| `typeset` | Chrome type versus the document measure | Fluid `clamp()` type in chrome; the phone body size on a toolbar; a display face in a label |
| `materials` | Color and materials: content solid, navigation on the platform material, transient surfaces separate | Glass or blur on the editor, table, or chart; accent used as a wash |
| `amplify` | Raise one region to the conviction the chrome already has | A new palette, equal loudness on every card, gradient text, a hero |
| `quiet` | Turn down saturated chrome, extra shadows, and decorative motion | Flattening every weight; growing chrome padding to look calm |
| `distill` | Strip to the one job. Collapse peer cards into the sovereign region | Cutting undo, names, or recovery; replacing a table with a marketing stack |
| `first-run` | Empty, no-results, permission, and first-launch states inside the sovereign pane | A blocking tour, a centered pill hero, fake sample numbers as live data |
| `clarify` | Copy: the next action, the failed thing, the recovery | Jokes on destructive errors; placeholder-as-label; renamed domain terms |
| `motion` | Motion that explains a state change | Load choreography, pulsing dots, bounce, blur on the data |
| `critique` | Review. Scores rhythm, optical alignment, and spread on tools and dashboards | A single-context review when two assessments were possible; treating a clean scan as a pass |
| `audit` | Technical quality: accessibility, performance, platform, shell security | A design verdict in place of a defect |
| `polish` | Finish a composition that is already right | Smuggling a new composition in through polish |
| `harden` | Crash restore, dirty documents, i18n, permissions | New features |
| `adapt` | Compact, regular, and wide windows; light, dark, high contrast | A phone layout |
| `detect` | Mechanical scan. Exit 0 clean, 2 findings, 1 usage error | Being read as proof the layout is good |
| `hooks` | Run that scan after UI edits | Auto-ignoring findings |

## Spatial contract

`shape` and `layout` both require this before CSS:

```text
composition: three-pane
sovereign: detail
roles: tight in the row, control in the toolbar, group between list sections, inset in the detail
air: detail measure; list stays dense
compact: sidebar collapses; list and detail remain
```

Composition ids are in [layout.md](layout.md).

## CLI

```bash
npx github:saksham-45/perfectable detect [--json] [--immediate] [--no-config] [path]
npx github:saksham-45/perfectable context
npx github:saksham-45/perfectable hooks on|off|status
npx github:saksham-45/perfectable version
```

`--immediate` is the per-edit tier. `--no-config` ignores a project's ignore list. Use it when checking the skill's own fixtures:

```bash
node skills/perfectable/scripts/detect.mjs --no-config skills/perfectable/fixtures/slop-editor.html
node skills/perfectable/scripts/detect.mjs --no-config skills/perfectable/fixtures/editor-first.html
```

The flat fixtures exit 2. `editor-first.html`, `three-pane.html`, and `settings.html` exit 0.

## What not to run

Do not run every command on every task. Run the one that matches the gap. Do not port Impeccable's marketing-page invention (concept tournaments, display faces, fluid type) into a tool window. Expression that hides the task fails.
