# Routing

Present this menu when the user invoked `/perfectable` with no command. Do not auto-run anything. Infer the likely next command from project state and put it first, then list the rest.

Use `context.mjs` output to pick the lead:

| State | Lead with |
|---|---|
| No APP.md | `init` — pin product, platform, windowing |
| APP.md, no CHROME.md, existing UI | `document` — extract chrome tokens from code |
| New surface / unknown IA | `shape` — plan workspace before code |
| UI exists, user wants a review | `critique` — dual-agent UX scores |
| UI exists, user wants defects | `audit` — technical + platform |
| Critique/audit already ran | `polish` — inherit P0/P1 and finish |
| Shipping / first-run / crash | `harden` |
| Window sizes / HiDPI / compact | `adapt` |
| Detector should run on every edit | `hooks on` |

Then:

1. **`$perfectable init`** — APP.md (users, platform, shell, windowing, input contract)
2. **`$perfectable document`** — CHROME.md from incumbent chrome
3. **`$perfectable shape [feature]`** — workspace IA, no code
4. **`$perfectable critique [target]`** — UX review, heuristic scores, personas
5. **`$perfectable audit [target]`** — a11y, perf, platform, workbench integrity, shell security
6. **`$perfectable polish [target]`** — one batched finish pass
7. **`$perfectable harden [target]`** — dirty/crash/a11y/i18n/permissions
8. **`$perfectable adapt [target]`** — sizes, appearance, compact chrome
9. **`$perfectable detect [path]`** — deterministic scan only
10. **`$perfectable hooks on`** — post-edit detector in this project

Ask which to run. If the user already named a target (“the titlebar”, `src/shell/Titlebar.tsx`), keep it on the command they pick.
