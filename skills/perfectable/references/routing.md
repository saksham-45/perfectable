# Routing

Present this menu when the user invoked `/perfectable` with no command. Do not auto-run anything. Infer the likely next command from project state and put it first, then list the rest.

Use `context.mjs` output to pick the lead:

| State | Lead with |
|---|---|
| No APP.md | `init` — pin product, platform, windowing |
| APP.md, no CHROME.md, existing UI | `document` — extract chrome tokens from code |
| New surface / unknown IA | `shape` — plan workspace before code |
| Spacing, alignment, empty space, hierarchy | `layout` — regions, rhythm, spread |
| UI exists, user wants a review | `critique` — dual-agent UX scores |
| UI exists, user wants defects | `audit` — technical + platform |
| Critique/audit already ran | `polish` — inherit P0/P1 and finish |
| Shipping / first-run / crash | `harden` |
| Window sizes / HiDPI / compact | `adapt` |
| Detector should run on every edit | `hooks on` |

Then:

1. **`$perfectable init`** — APP.md (users, platform, shell, windowing, input contract)
2. **`$perfectable document`** — CHROME.md from incumbent chrome
3. **`$perfectable shape [feature]`** — workspace IA and the spatial contract, no code
4. **`$perfectable layout [target]`** — regions, rhythm, spread, optical alignment
5. **`$perfectable typeset [target]`** — chrome type versus document measure
6. **`$perfectable materials [target]`** — layers, tokens, elevation
7. **`$perfectable critique [target]`** — UX review, heuristic scores, personas
8. **`$perfectable audit [target]`** — a11y, perf, platform, workbench integrity, shell security
9. **`$perfectable polish [target]`** — one batched finish pass
10. **`$perfectable harden [target]`** — dirty/crash/a11y/i18n/permissions
11. **`$perfectable adapt [target]`** — sizes, appearance, compact chrome
12. **`$perfectable detect [path]`** — deterministic scan only
13. **`$perfectable hooks on`** — post-edit detector in this project

Ask which to run. If the user already named a target (“the titlebar”, `src/shell/Titlebar.tsx`), keep it on the command they pick.
