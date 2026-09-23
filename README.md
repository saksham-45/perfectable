# Perfectable

**Layout and quality for AI-built desktop apps.**

Coding agents are good at websites. They are bad at tools. Ask Claude, Cursor, Codex, or Grok to build an editor or an Electron/Tauri app and you usually get a website in a window: Inter, a violet accent, a hamburger menu, hover-only chrome, a 44px touch toolbar, one padding value everywhere, and no real File / Edit / Window menu.

[Impeccable](https://impeccable.style) already catches that class of failure on the web. Perfectable is the desktop counterpart. It places the window — one surface owns the spare space, related controls sit tight, regions separate — and it still enforces the operating system's contract. Guides: [Layout](docs/layout.md), [Commands](docs/commands.md).

```bash
npx github:saksham-45/perfectable install -y --scope=project
```

Then, in the harness:

```text
/perfectable
```

## Why this exists

LLMs grade their own UI generously. A prompt that says "make it feel native" does not stick. Web design skills encode the **wrong** floor for this domain (touch targets, marketing CTAs, fluid type). Desktop and IDE quality *is* mechanical enough to scan.

Perfectable puts a loop around the agent:

1. **Pinned truth** — `APP.md` and `CHROME.md` beat model taste. Posture and composition are part of that truth.
2. **Layout** — a spatial contract before CSS: which of eight window types this is, where the air goes, and at least two spacing roles. See [docs/layout.md](docs/layout.md).
3. **Craft floor** — density, keyboard, native menus, dirty documents. Judgment the scanner cannot catch.
4. **Deterministic detector** — Electron, SwiftUI, egui, Qt, GTK, WinUI, and Flutter. A toolkit that was not actually read exits 3. CI uses `--format=sarif`.
5. **Running-app lab** — `perfectable prove --pid` or `--launch` reads the live window: macOS Accessibility, Windows UI Automation, Linux AT-SPI. It requires a menu bar, a titled window, named controls, and caption buttons. `--golden` is a perceptual screenshot diff.
6. **Dual-agent critique** — 17 heuristics, including rhythm, alignment, and spread.
7. **Scored audit** — a11y, performance, theming, platform HIG, workbench integrity, shell security.
8. **Edit hook** — findings come back into the agent after UI writes, instead of an open-ended "polish until good" loop.

Use it when you are **generating or reviewing** an IDE, editor, or desktop app with an LLM and you want the result to feel like a tool, not a landing page.

Do **not** use it for websites, marketing pages, or mobile-only apps. That is Impeccable's job.

## What it catches

Typical LLM desktop slop:

| Instead of this | Perfectable wants |
|---|---|
| Hamburger menu, web `<input type="file">` | Native menu bar and OS file dialogs |
| Fake traffic lights / no titlebar drag | System window controls, `-webkit-app-region: drag` |
| Hover-only tab close and toolbar icons | Keyboard + persistent affordances |
| 44px "accessible" tree rows | The platform's row height, plus hit padding |
| One 16px gap everywhere, three equal columns | Two spacing roles, leftover space in the work |
| Glass and blur on the editor | Material on navigation only. Content stays solid |
| `nodeIntegration: true` | Isolated renderer + preload |
| Unvirtualized `files.map` in the sidebar | Windowed lists that survive 10k files |
| Inter / Geist / violet-on-near-black VS Code skin | A pinned chrome system in `CHROME.md` |
| Settings in a modal over the editor | A preferences window or searchable panel |
| `outline: none` with no focus ring | Visible keyboard focus |

The detector is a real CLI (`0` clean, `2` findings). A clean scan is evidence of defects, not a quality certificate — critique and the craft floor still apply.

## Install

Node 18+. From the repo, a tarball, or GitHub:

```bash
# current project, auto-detect Claude / Cursor / Codex / Grok / …
npx github:saksham-45/perfectable install -y --scope=project

# explicit harnesses
npx github:saksham-45/perfectable install -y --providers=claude,cursor,codex --scope=project

# every project on this machine
npx github:saksham-45/perfectable install -y --providers=claude,cursor --scope=global
```

Then open the harness and run `/perfectable`.

| Harness | Install |
|---|---|
| Any | `npx github:saksham-45/perfectable install -y --scope=project` |
| Claude Code | `/plugin marketplace add saksham-45/perfectable` then install `perfectable`, or `--providers=claude` |
| Cursor | `--providers=cursor` (enable Agent Skills) |
| Codex | `--providers=codex` |
| Grok Build | `grok plugin install saksham-45/perfectable --trust` or `--providers=grok` |
| Gemini CLI | `--providers=gemini` |
| GitHub Copilot | `--providers=github` |
| OpenCode / `.agents` | `--providers=opencode,agents` |

Project installs write `.<provider>/skills/perfectable` plus a hook manifest where the harness supports one. Grok project hooks need `/hooks-trust` once.

```bash
npx github:saksham-45/perfectable uninstall --scope=project
```

## Commands

In the harness, `/perfectable` with no argument shows a menu. Do not skip that.

| Command | What it does |
|---|---|
| `init` | Pin product truth in `APP.md` (platform, shell, posture, composition, native contracts) |
| `document` | Extract `CHROME.md` from existing chrome, including spacing roles and the material layer |
| `shape` | Plan the workspace and the spatial contract before code |
| `layout` | Regions, rhythm, spread, optical alignment |
| `typeset` | Chrome type versus the document's measure |
| `materials` | Content, navigation, and transient layers |
| `amplify` | Raise one region. Refuses a new palette and a louder card on every tile |
| `quiet` | Reduce chrome noise. Refuses flattening hierarchy or padding the chrome |
| `distill` | Strip to one job. Refuses a metric-card wall and cutting recovery |
| `first-run` | Empty and first launch in the sovereign pane. Refuses a blocking tour |
| `clarify` | Name the next action. Refuses vague Submit / OK copy |
| `motion` | State changes only. Refuses load choreography and pulsing dots |
| `critique` | Dual-agent UX review, 17 heuristics scored /68, including rhythm, alignment, and spread on tools and dashboards |
| `audit` | Technical + platform + shell security, /24 |
| `polish` | One batched finish pass; inherits critique P0/P1 |
| `harden` | Crash restore, dirty documents, a11y, i18n, permissions |
| `adapt` | Window sizes, HiDPI, compact chrome from the composition |
| `detect` | Deterministic scan only |
| `hooks` | `on` / `off` / `status` / ignores |

The full playbook is [docs/commands.md](docs/commands.md).

## CLI

After install, or from this checkout:

```bash
npx github:saksham-45/perfectable detect [--json] [--immediate] [path]
npx github:saksham-45/perfectable context
npx github:saksham-45/perfectable hooks on|off|status
npx github:saksham-45/perfectable providers
```

## Develop

```bash
git clone https://github.com/saksham-45/perfectable.git
cd perfectable
npm test
node bin/perfectable.mjs install -y --providers=claude,cursor --scope=project --cwd /tmp/some-app
```

Layout:

```
skills/perfectable/          the Agent Skill (SKILL.md, playbooks, detector, fixtures)
skills/perfectable/references/canon/   layout, type, materials, history
docs/layout.md               human guide to placing a window
docs/commands.md             command reference
bin/perfectable.mjs          installer + CLI
plugin.json                  Grok plugin manifest
.claude-plugin/              Claude Code plugin + marketplace
.grok-plugin/                Grok marketplace index
```

## License

MIT
