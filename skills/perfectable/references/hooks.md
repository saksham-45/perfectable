# Hooks

Manage the Perfectable detector hook for the current project. The hook runs after UI file edits and feeds findings into Grok as `additionalContext`. It does not rewrite the tool output. It does not auto-ignore findings.

Per-edit (`PostToolUse` on `search_replace` / `write`): `--immediate` rules only (mechanical: isolation, drag region, `outline: none`, unvirtualized tree, web file picker).

Stop: full rule set on git-changed UI files, deduped against what this session already reported. Never blocks the stop; it only reminds.

## Routing

First argument is the action. Default `status`.

| Action | What it does |
|---|---|
| `status` | Print config paths, enabled, ignores |
| `on` | Enable in `.perfectable/config.json` and write `.grok/hooks/perfectable.json` |
| `off` | Set `hook.enabled: false` |
| `ignore-rule <id>` | Suppress that rule project-wide |
| `ignore-file <glob>` | Suppress every rule for matching files |
| `reset` | Delete `.perfectable/config.json` and the project hook file |

Always go through the admin script (or `npx perfectable hooks <action>`):

```bash
node <skill-base-dir>/scripts/hook-admin.mjs <action> [args...]
```

Relay stdout verbatim. On `on`: “The detector will fire after the next UI edit.” On `off`: “New edits will not trigger the Perfectable hook until `$perfectable hooks on`.”

## Triage

The hook never writes ignores. After a finding:

- Real problem: fix it.
- Confident false positive (fixture, deliberate demo, user-confirmed): `ignore-rule` / `ignore-file` with the user, or an inline `perfectable-disable-next-line <id>`.
- Unsure: leave it and ask once.

Prefer the narrowest exception. Do not `ignore-file` a real UI surface to push a write through.

## Constraints

- Do not hand-edit `.perfectable/config.json` or `.grok/hooks/perfectable.json` from this command.
- Do not edit `hook.mjs` from this flow.
- Project hooks require folder trust (`/hooks-trust`) before they run.
