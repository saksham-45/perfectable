# Routing

Present this menu when the user invoked `/perfectable` with no command. Do not auto-run anything. Infer the likely next command from project state and put it first, then list the rest.

Use `context.mjs` output to pick the lead:

| State | Lead with |
|---|---|
| No APP.md | `init` — pin product, platform, windowing |
| APP.md, no CHROME.md, existing UI | `document` — extract chrome tokens from code |
| New surface / unknown IA | `shape` — plan workspace before code |
| Spacing, alignment, empty space, hierarchy | `layout` — regions, rhythm, spread |
| Dashboard, or "a grid of metrics" | `shape` — pick briefing, exception-board, or ledger |
| Flat / timid instrument | `amplify` — raise one region |
| Loud chrome, glass on data | `quiet` — noise down, hierarchy stays |
| Too many equal regions | `distill` — one job |
| Empty pane or first launch | `first-run` — next action in the sovereign pane |
| Vague labels or errors | `clarify` — copy |
| Animation, pulse, load sequence | `motion` — state only |
| UI exists, user wants a review | `critique` — dual-agent UX scores |
| UI exists, user wants defects | `audit` — technical + platform |
| Critique/audit already ran | `polish` — inherit P0/P1 and finish |
| Shipping / crash / i18n | `harden` |
| Window sizes / HiDPI / compact | `adapt` |
| Detector should run on every edit | `hooks on` |

Then:

1. **`$perfectable init`** — APP.md (users, platform, shell, windowing, input contract)
2. **`$perfectable document`** — CHROME.md from incumbent chrome
3. **`$perfectable shape [feature]`** — workspace IA and the spatial contract, no code
4. **`$perfectable layout [target]`** — regions, rhythm, spread, optical alignment
5. **`$perfectable typeset [target]`** — chrome type versus document measure
6. **`$perfectable materials [target]`** — layers, tokens, elevation
7. **`$perfectable amplify [target]`** — raise one region inside the existing system
8. **`$perfectable quiet [target]`** — reduce chrome noise
9. **`$perfectable distill [target]`** — strip to the one job
10. **`$perfectable first-run [target]`** — empty and first-launch states
11. **`$perfectable clarify [target]`** — labels, errors, empty copy
12. **`$perfectable motion [target]`** — state-change motion
13. **`$perfectable critique [target]`** — UX review, heuristic scores, personas
14. **`$perfectable audit [target]`** — a11y, perf, platform, workbench integrity, shell security
15. **`$perfectable polish [target]`** — one batched finish pass
16. **`$perfectable harden [target]`** — dirty/crash/a11y/i18n/permissions
17. **`$perfectable adapt [target]`** — sizes, appearance, compact chrome
18. **`$perfectable detect [path]`** — deterministic scan only
19. **`$perfectable hooks on`** — post-edit detector in this project

Ask which to run. If the user already named a target (“the titlebar”, `src/shell/Titlebar.tsx`), keep it on the command they pick.
