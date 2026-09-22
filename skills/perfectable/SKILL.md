---
name: perfectable
description: >
  Audit, critique, shape, lay out, typeset, and finish IDE and desktop-app UI
  (Electron, Tauri, native macOS/Windows/Linux). Use when building or reviewing
  a code editor, workbench, desktop shell, titlebar, menu bar, command palette,
  file tree, settings window, or native windowing; when placing regions, spacing,
  alignment, density, type, or materials in a desktop window; when an LLM-built
  desktop app feels like a website; or when the user runs /perfectable. Catches
  web-shaped chrome, flat spacing, missing keyboard paths, VS Code clones, and
  platform-HIG drift. Not for websites, landing pages, or mobile-only apps
  (use impeccable).
argument-hint: "[init|document|shape|layout|typeset|materials|critique|audit|polish|harden|adapt|hooks|detect] [target]"
metadata:
  short-description: Desktop UI craft and layout
  version: "2.0.0"
---

# Perfectable

Operate-mode craft for IDEs, editors, and desktop apps. The editor is the product; chrome disappears into the task. Do not apply web marketing patterns or a 44px touch floor to professional chrome.

## Setup

1. Run once per session from the user's project:

   ```bash
   node <skill-base-dir>/scripts/context.mjs
   ```

   `<skill-base-dir>` is the loaded skill directory (this skill's folder). Fallbacks: `npx perfectable context`, then `~/.grok/skills/perfectable`. Follow every `LOAD` / `DIRECTIVE` line. Do not rerun.

2. Load the one playbook that owns the request (Commands table). Bare `/perfectable` with no argument: load [references/routing.md](references/routing.md) and present its menu; never auto-run a command.

3. After direction is settled, load [references/craft-floor.md](references/craft-floor.md) immediately before editing UI. Skip for planning-only work.

4. **For LLM agents:** Load [references/llm-guide.md](references/llm-guide.md) at session start. It contains the system prompt snippet, decision tree, few-shot examples, and common failure modes.

## How to work

- **APP.md wins.** Product, platform, windowing, and input contract beat model taste.
- **CHROME.md wins over category habit.** Density, tokens, native-vs-custom chrome are pinned there.
- **Incumbent chrome is visual authority.** Missing APP.md or CHROME.md does not make the project greenfield.
- **Refinement preserves; redesign replaces.** Ask before changing factual copy or adding claims.
- **Verify in bounded passes.** Inspect once (window sizes + light/dark + high contrast together), fix everything it shows in one batch, confirm with at most one more round, stop. Open-ended self-QA is failure.

## Commands

| Command | Job | Reference |
|---|---|---|
| `init` | Capture durable product truth in APP.md | [references/init.md](references/init.md) |
| `document` | Extract CHROME.md from existing chrome | [references/document.md](references/document.md) |
| `shape [feature]` | Plan workspace IA before code | [references/shape.md](references/shape.md) |
| `layout [target]` | Regions, rhythm, spread, optical alignment | [references/layout.md](references/layout.md) |
| `typeset [target]` | Chrome type versus document measure | [references/typeset.md](references/typeset.md) |
| `materials [target]` | Layers, tokens, elevation | [references/materials.md](references/materials.md) |
| `critique [target]` | Dual-agent UX review with scores | [references/critique.md](references/critique.md) |
| `audit [target]` | Technical + platform checks | [references/audit.md](references/audit.md) |
| `polish [target]` | Final quality pass; inherit critique P0/P1 | [references/polish.md](references/polish.md) |
| `harden [target]` | Crash, dirty state, a11y, i18n, permissions | [references/harden.md](references/harden.md) |
| `adapt [target]` | Window sizes, HiDPI, compact/full chrome | [references/adapt.md](references/adapt.md) |
| `hooks …` | Install or configure the detector hook | [references/hooks.md](references/hooks.md) |
| `detect [path]` | Run the deterministic scanner | `scripts/detect.mjs` |

Routing: explicit or clearly implied command → load that reference (and the platform file `context.mjs` named). A spacing, alignment, empty-space, or hierarchy complaint loads [references/layout.md](references/layout.md) before other chrome work. Otherwise treat as general chrome work: inspect the target, load craft-floor, edit, then run the detector on touched files. Missing APP.md on a **new** app routes through `init` first; a narrow refinement of existing chrome proceeds and offers `init` afterward.

After `init` writes APP.md, resume without rerunning `context.mjs`; `init` loads the platform reference itself.

## Detector

Rules live in `scripts/detect.mjs` only. Do not restate them in reports.

```bash
node <skill-base-dir>/scripts/detect.mjs [--json] [--immediate] [path]
# or: npx perfectable detect [--json] [--immediate] [path]
```

Exit 0 = clean, 2 = findings, 1 = usage/error. `--immediate` is the per-edit tier (mechanical rules only). A clean scan is not a quality certificate; craft-floor and critique still apply.

## Platform

`context.mjs` names one of [platforms/macos/macos.md](platforms/macos/macos.md), [platforms/windows/windows.md](platforms/windows/windows.md), [platforms/linux/linux.md](platforms/linux/linux.md). Load it before scoring platform conformance. `adaptive` loads every shipped desktop OS.

## Hooks

`$perfectable hooks <on|off|status|ignore-rule|ignore-file|reset>` — load [references/hooks.md](references/hooks.md).
