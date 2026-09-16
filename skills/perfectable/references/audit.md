# Audit

Systematic **technical** quality checks. Do not fix issues; document them for other commands. This is not a design critique — use `critique` for that.

Load the platform file `context.mjs` named (`macos.md` / `windows.md` / `linux.md`; all three if `adaptive`) before scoring Platform Conformance.

## Diagnostic scan

Score each dimension 0–4.

### 1. Accessibility

Missing AX names/roles/traits; illogical focus order; lost focus on navigation; fixed px type that defeats Dynamic Type / text scaling; contrast failures in either appearance; Reduce Motion ignored; icon-only controls.

0 = screen reader unusable. 4 = named, ordered, scales, Reduce Motion honored.

### 2. Performance

Slow startup before first paint; unvirtualized trees/lists; main-thread work on keystroke or scroll; editor re-renders the whole buffer; full-size images decoded for icons; bloated Electron/Tauri payload.

0 = janky everywhere. 4 = fast launch, smooth input, lean.

### 3. Theming

Raw hex instead of semantic tokens; broken dark/light; ignores system appearance; no high-contrast path; mixed token types.

0 = hardcoded everything. 4 = semantic throughout, both appearances first-class.

### 4. Platform conformance (CRITICAL)

Score against the loaded platform reference, including its slop tests: menus, windowing, drag regions, insets, system dialogs, shortcuts, window controls, no hover-only chrome, no web CTAs in toolbars.

0 = web port. 4 = a fluent OS user trusts every surface.

### 5. Workbench integrity

Dirty/untitled in the title and dock; layout persistence; command registry; keybinding collisions; crash restore; panel/split state.

0 = no document/workspace model. 4 = dirty, restore, layout, commands are coherent.

### 6. Shell security

Electron: `contextIsolation` on, `nodeIntegration` off, navigation lock, no privileged renderer. Tauri: tight CSP, no dangerous `withGlobalTauri`, capability least-privilege. Native: no needless TCC/entitlement prompts.

0 = renderer is Node. 4 = isolation and capabilities are tight.

Run the detector and verify each finding in context. Keep deterministic findings separate from visual judgment. Call out false positives.

```bash
node <skill-base-dir>/scripts/detect.mjs --json [target]
```

## Report

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | | |
| 2 | Performance | | |
| 3 | Theming | | |
| 4 | Platform Conformance | | |
| 5 | Workbench Integrity | | |
| 6 | Shell Security | | |
| **Total** | | **??/24** | **[band]** |

Bands: 22–24 Excellent, 17–21 Good, 12–16 Acceptable, 7–11 Poor, 0–6 Critical.

### Platform Conformance Verdict

Pass/fail: native app or ported website? List specific violations.

### Executive summary

Score, P0/P1/P2/P3 counts, top 3–5 issues, next steps.

### Detailed findings

Each issue: **[P?] name** · Location (file:line) · Category · Impact · Guideline (HIG / this skill's platform file) · Recommendation · Suggested `$perfectable` command.

Then patterns (systemic, not one-offs), then positive findings.

## Recommended actions

P0 first, then P1, then P2. Only `$perfectable adapt|audit|critique|document|harden|polish|shape`. End with `$perfectable polish` if any fixes were recommended.

Tell the user they can run the commands one at a time or together, and to re-run `$perfectable audit` after fixes.

Never report an issue without impact, a generic fix, skipped positives, or everything as P0. Verify detector hits before reporting them.
