# Critique

Resolve one stable target, run two independent assessments, synthesize a UX critique, persist a snapshot, ask what to improve next. The chat response is the deliverable; the snapshot is backlog for `polish`.

## Invariants

- Assessment A (design review) and Assessment B (detector evidence) are both required.
- Spawn A and B as two isolated sub-agents whenever `spawn_subagent` is available. They must not see each other's output. Inline is allowed only when no sub-agent tool exists; then the report's first line is `⚠️ DEGRADED: single-context (<reason>)`.
- A skipped detector is a failed critique unless `detect.mjs` is missing or crashes after a real attempt.
- Viewable targets require a running window when one can be started (Electron/Tauri app, or renderer URL). Do not claim an overlay exists unless you actually inspected the live UI.
- The question is the last thing in the response. A run with neither targeted questions nor `Questions skipped: <reason>` is incomplete.

## Setup

1. Resolve the target to a file path (prefer source over a drifting localhost URL).
2. Slug it:

   ```bash
   node <skill-base-dir>/scripts/critique-storage.mjs slug "<resolved-path>"
   ```

   Non-zero: skip persistence and trend, continue the critique.

3. Read `.perfectable/critique/ignore.md` if it exists. Drop matching findings silently.

## Assessment A — tool design director

Read source. Inspect the live window when available. Do not run the detector. Do not see B's output.

Evaluate: design specificity (authored for this product vs category-interchangeable), hierarchy, IA, discoverability, density, keyboard, native fluency, states, copy, edge cases.

Cognitive load: fail any of: single focus, chunking ≤4, grouping, hierarchy, one decision at a time, working memory, progressive disclosure. 4+ failures = critical.

Score the 17 heuristics 0–4 using [Heuristics](#heuristics). Mark a heuristic `n/a` only when it cannot apply; renormalize the maximum.

Walk 2–3 personas from [Personas](#personas) through the primary action. Name the exact control that fails them.

Return: specificity verdict, heuristic table, cognitive load, 2–3 strengths, 3–5 priority issues, persona red flags, minor notes, provocative questions.

## Assessment B — detector evidence

```bash
node <skill-base-dir>/scripts/detect.mjs --json [target]
```

Exit 0 = clean, 2 = findings. For a running renderer, also note what a visual pass showed (contrast, missing focus, clipped chrome). Return counts, rule ids, file:line, false positives, skipped steps with reasons.

Do not rerun the detector in the parent unless B omitted counts, rule names, or locations.

## Report

First line:

- Dual-agent: `Method: dual-agent (A: <id> · B: <id>)`
- Degraded: `⚠️ DEGRADED: single-context (<reason>)`

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | | |
| 2 | Match system / real world | | |
| 3 | User control and freedom | | |
| 4 | Consistency and standards | | |
| 5 | Error prevention | | |
| 6 | Recognition rather than recall | | |
| 7 | Flexibility and efficiency | | |
| 8 | Aesthetic and minimalist chrome | | |
| 9 | Error recovery | | |
| 10 | Help and documentation | | |
| 11 | Keyboard completeness | | |
| 12 | Platform fluency | | |
| 13 | Workspace memory | | |
| 14 | Scale | | |
| 15 | Spatial rhythm | | |
| 16 | Optical alignment | | |
| 17 | Spread | | |
| **Total** | | **??/[applicable max]** | **[band]** |

Applicable max is 4 × scored heuristics (68 when all apply). Bands by percentage: 90%+ Excellent, 70%+ Good, 50%+ Acceptable, 30%+ Poor, else Critical. Most real tools score in the middle of the band, not at the ceiling.

### Design Specificity Verdict

Start here. LLM assessment, then detector summary (counts, ids, locations, false positives).

### Overall impression, what's working (2–3), priority issues (3–5)

Each issue: **[P0–P3] What** · Why it matters · Fix · Suggested command (`$perfectable layout|typeset|materials|adapt|audit|document|harden|polish|shape`).

P0 blocks the task. P1 before release. P2 next pass. P3 polish. “Would they file a bug?” → at least P1.

### Persona red flags, minor observations, questions to consider

### Run Notes

Target slug, ignore list, assessment independence, detector, live window, snapshot write. Failed steps: observed reason + fallback.

Be specific. Name the control. Do not soften. Prioritize; everything cannot be P0.

## Persist

Write the report in chat first. Then persist (skip if slug was null):

```bash
WORKBENCH_CRITIQUE_META='{"target":"<phrasing>","total_score":<n>,"max_score":<n>,"na_heuristics":"<nums or empty>","p0_count":<n>,"p1_count":<n>}' \
  node <skill-base-dir>/scripts/critique-storage.mjs write "<resolved target>" <body-file>
```

Delete the temp body file either way. Then:

```bash
node <skill-base-dir>/scripts/critique-storage.mjs trend "<resolved target>" 5
```

Append: **Trend for `<slug>` (last 5 runs): 24 → 28 → 32 (out of 68)** and the written path. First run: say so. The denominator is the applicable max for that run, 68 only when every heuristic scored.

## Ask the user

After the report, 2–4 questions tied to actual findings, each with 2–3 options: priority direction, intent (is the web-shaped chrome deliberate?), scope, off-limits. Skip only when fewer than 3 Priority Issues, and then print `Questions skipped: <reason>`.

After they answer, list recommended `$perfectable …` commands in their priority order, end with `$perfectable polish` if any fixes were recommended, and tell them they can run them one at a time or together. Re-run `$perfectable critique` after fixes to see the score move.

---

## Heuristics

Score 0–4. A 4 is genuinely excellent.

1. **Visibility of status** — dirty, language mode, git, LSP, running task, current file. 0 = guessing.
2. **Match real world** — file/window/document metaphors of the host OS; no unexplained jargon.
3. **User control** — close, undo, cancel, Esc from palette/modal; never trapped.
4. **Consistency** — OS conventions plus this app's own chrome. Same action, same widget.
5. **Error prevention** — confirm only irreversible; constraints over error dialogs; autosave/drafts.
6. **Recognition** — palette, recents, labeled icons, visible options.
7. **Flexibility** — shortcuts, chords, bulk actions, power paths that do not complicate the default.
8. **Minimalist chrome** — editor is the product; density without noise.
9. **Error recovery** — crash restore, failed save, LSP down; plain language + next step; work preserved.
10. **Help** — keybinding editor, `?` overlay, task-focused; not a tutorial wall.
11. **Keyboard completeness** — every primary task with no mouse; focus visible; no traps.
12. **Platform fluency** — menu, titlebar, dialogs, appearance, multi-window. Reads native, not a ported site.
13. **Workspace memory** — layout, splits, open files, pane sizes persist across launch.
14. **Scale** — 50k-file tree, 10k-line buffer, many editors: still usable.
15. **Spatial rhythm** — at least two spacing roles. One padding everywhere scores 0. Rules in [canon/layout-geometry.md](canon/layout-geometry.md).
16. **Optical alignment** — label rail and control rail, icon to cap height, tabular numbers, scrollbars and focus that do not reflow, OS controls outside the toolbar grid.
17. **Spread** — air in the sovereign surface or the reading measure. Chrome stays dense. Equal columns for unequal jobs score low.

On every critique, answer in one sentence: where the eye went in the first second, and whether that was the task.

## Personas

Pick 2–3. Walk the primary action. Report specific red flags, not profiles.

| Persona | Tests | Red flags |
|---|---|---|
| **Alex** (power user) | Core task <60s, chords, skip onboarding, Esc dismiss, bulk | Forced tour, no shortcuts, slow motion, one-item workflows |
| **Jordan** (first-timer) | First action obvious in 5s, labeled icons, undo, no jargon | Icon-only nav, jargon, no help, no success confirmation |
| **Sam** (AX / keyboard) | Full flow keyboard-only, names, contrast, Dynamic Type | Click-only, missing focus, color-only state, unlabeled controls |
| **Riley** (scale / stress) | 0 items, 100k files, huge buffer, dead LSP, refresh mid-flow | Silent failure, lost data, empty with no next step |
| **Morgan** (OS-native) | Cmd/Ctrl+W/Q/,, menu bar, system dialogs, appearance | Hamburger menu, web file picker, dark-only, fake traffic lights |
| **Devin** (lives in the editor) | Chrome recedes, input latency, no stolen focus | Pulse dots, layout jump on keystroke, chrome that competes |

If APP.md names an audience not covered, add 1–2 project personas from that text only. Do not invent.
