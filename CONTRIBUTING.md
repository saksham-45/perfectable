# Contributing

Perfectable is a skill plus a small Node CLI. There are no runtime dependencies.

## Setup

```bash
git clone https://github.com/saksham-45/perfectable.git
cd perfectable
npm test
```

Node 18+.

## Where to change things

| Change | Home |
|---|---|
| Detector rules | `skills/perfectable/scripts/detect.mjs` |
| Craft floor / bans | `skills/perfectable/references/craft-floor.md` |
| Critique / audit playbooks | `skills/perfectable/references/critique.md`, `audit.md` |
| macOS / Windows / Linux HIG | `references/macos.md`, `windows.md`, `linux.md` |
| Installer / harnesses | `src/providers.mjs`, `src/install.mjs` |
| Skill routing | `skills/perfectable/SKILL.md` |

One home per fact. Do not restate detector rule IDs in the playbooks.

## Tests

`npm test` runs the detector against a fixture and installs into a temp tree for Claude, Cursor, Grok, Codex, and GitHub Copilot.

Add a detector case as a file the scanner will actually hit (filename + source pattern), not a one-off string in the test.

## Pull requests

- Keep the skill body a prompt, not a blog post.
- A new detector rule needs an `id`, `severity`, and a fixture that fires it.
- Do not add npm dependencies unless the installer or detector cannot work without them.
