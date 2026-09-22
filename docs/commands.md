# Commands

`/perfectable` with no argument shows a menu. An explicit command loads one playbook. A complaint about spacing, alignment, empty space, or hierarchy loads `layout` before anything else.

Pinned `APP.md` beats taste. Existing chrome, once written into `CHROME.md`, beats a new palette. A clean detector run is not a certificate.

| Command | Use it when | It writes or decides |
|---|---|---|
| `init` | A new app, or the product truth is missing | `APP.md`: platform, shell, windowing, posture, composition, native contracts |
| `document` | Chrome exists and `CHROME.md` does not | `CHROME.md` schema 2: tokens, spacing roles, region map, measure, material layer |
| `shape` | The workspace is undecided | One thesis, one composition, a spatial contract. No code, no hex values |
| `layout` | Spacing, alignment, hierarchy, "it feels like a website" | Regions, then intervals, then an optical pass on a screenshot |
| `typeset` | Chrome type, line length, tabular numbers | Platform face and size for chrome. Measure for prose |
| `materials` | Color, glass, blur, elevation, contrast | Each surface as content, functional, or transient |
| `critique` | A review | 17 heuristics (68 when all apply), personas, priority issues |
| `audit` | Defects, platform conformance, shell security | A scored technical report |
| `polish` | The composition is right and the finish is not | One batched pass. A wrong thesis goes back to `shape` |
| `harden` | Crash, dirty documents, i18n, permissions | Edge states |
| `adapt` | Window sizes, HiDPI, compact chrome | Collapse rules from the composition, at compact, regular, and wide |
| `detect` | A mechanical scan, or CI | Exit 0 clean, 2 findings, 1 usage error |
| `hooks` | Findings after every UI edit | `on`, `off`, `status`, ignore a rule or a file |

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
