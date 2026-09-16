# LLM Guide — Using the Workbench Skill Effectively

This guide helps LLMs (Claude, Cursor, Codex, Grok, etc.) use the Workbench skill correctly. Load this when the skill is invoked.

## System Prompt Snippet

When the Workbench skill is active, prepend this to your system prompt:

```
You are an expert in desktop/IDE UI quality. You have access to the Workbench skill which provides:
- Deterministic detector (`$perfectable detect`) for Electron/Tauri/security/platform/IDE anti-patterns
- Dual-agent critique (`$perfectable critique`) with 14 heuristics and 6 personas
- Technical audit (`$perfectable audit`) across a11y, perf, theming, platform conformance, workbench integrity, shell security
- Chrome documentation (`$perfectable document`) to extract design tokens from existing UI
- Product truth capture (`$perfectable init`) for platform/shell/windowing/input contracts
- Workspace planning (`$perfectable shape`) before writing code
- Refinement passes (`$perfectable polish`, `$perfectable harden`, `$perfectable adapt`)

CRITICAL RULES:
1. NEVER skip `$perfectable init` on a new desktop app — pinned APP.md beats model taste
2. NEVER invent chrome without `$perfectable document` first — incumbent chrome is visual authority
3. ALWAYS run `$perfectable detect` on touched UI files after edits (unless DETECTOR_HOOK=on)
4. ALWAYS load craft-floor.md before editing UI
5. For reviews: use `$perfectable critique` (design) + `$perfectable audit` (technical) — both required
6. For shipping: `$perfectable harden` → `$perfectable adapt` → `$perfectable polish`
7. Detector findings are defect evidence, not proof of quality — critique and craft floor still apply
```

## Decision Tree — Which Command to Run

```
User request
    │
    ├─ "New desktop app" / "Start Electron/Tauri/SwiftUI/WinUI project"
    │   → $perfectable init
    │
    ├─ "Make my app feel native" / "Fix platform issues"
    │   → $perfectable init (if no APP.md) → $perfectable document (if no CHROME.md) → $perfectable audit
    │
    ├─ "Review this UI" / "Critique this editor/titlebar/sidebar"
    │   → $perfectable critique [target]
    │
    ├─ "Find defects" / "Technical audit" / "CI gate"
    │   → $perfectable audit [target]
    │
    ├─ "Plan workspace layout" / "Design new feature UI"
    │   → $perfectable shape [feature]
    │
    ├─ "Polish/finish this UI"
    │   → $perfectable polish [target] (after critique/audit)
    │
    ├─ "Handle errors/crash/first-run/i18n/a11y"
    │   → $perfectable harden [target]
    │
    ├─ "Responsive/compact/HiDPI/multi-window"
    │   → $perfectable adapt [target]
    │
    ├─ "Just run the detector"
    │   → $perfectable detect [path]
    │
    └─ "Enable detector on every edit"
        → $perfectable hooks on
```

## Few-Shot Examples

### Example 1: New Electron App
```
User: "Build me a code editor in Electron"

Assistant: 
1. Runs `$perfectable init` → captures: platform=macos, shell=electron, windowing=workspace, input=keyboard-first, users=developers
2. Runs `$perfectable shape` → confirms editor-first thesis, plans topology
3. Writes code following craft-floor.md and platform reference (macos.md)
4. Runs `$perfectable detect` on each UI file written
5. Runs `$perfectable audit` before shipping
```

### Example 2: Fix Platform Issues
```
User: "My Electron app doesn't feel native on macOS"

Assistant:
1. Runs `$perfectable context` → sees APP.md exists, CHROME.md missing
2. Runs `$perfectable document` → extracts CHROME.md from existing chrome
3. Runs `$perfectable audit` → finds: missing drag region, fake traffic lights, no native menu, dark-only
4. Fixes each P0/P1 finding
5. Runs `$perfectable audit` again to verify
```

### Example 3: Design Review
```
User: "Review my titlebar component"

Assistant:
1. Runs `$perfectable critique src/shell/Titlebar.tsx`
2. Returns: dual-agent method, heuristic scores (14/56), persona red flags, 3-5 priority issues with P0-P3
3. Recommends: `$perfectable adapt` for compact mode, `$perfectable polish` for focus rings
```

### Example 4: CI Integration
```
User: "Add workbench to CI"

Assistant:
1. Creates `.github/workflows/perfectable.yml` using `$perfectable detect --format=sarif`
2. Configures SARIF upload to GitHub Security tab
3. Adds pre-commit hook via `$perfectable hooks on`
```

## Common LLM Failure Modes & Corrections

| Failure Mode | Detection | Correction |
|--------------|-----------|------------|
| Skips `init` on new app | No APP.md, invents chrome | Run `$perfectable init` first |
| Invents chrome without `document` | No CHROME.md, creates new design system | Run `$perfectable document` first |
| Runs only `detect`, claims "clean = good" | Clean scan but no critique | Run `$perfectable critique` + `$perfectable audit` |
| Uses web patterns (44px, hover-only, CTAs) | Detector findings: touch-density, hover-only-affordance, web-cta-in-chrome | Load craft-floor.md, fix per detector |
| Ignores platform conventions | Audit: platform conformance < 3 | Load platform reference (macos.md/windows.md/linux.md) |
| Claims "done" after one pass | No polish/harden/adapt | Run full pipeline: critique → audit → harden → adapt → polish |
| Softens findings ("consider", "maybe") | Priority issues all P2/P3 | Be specific: name control, P0 blocks task, P1 before release |

## Command Pipeline — Standard Workflow

```
NEW APP:
  $perfectable init          → APP.md (pinned truth)
  $perfectable shape         → Workspace thesis + topology
  $perfectable document      → CHROME.md (if chrome exists)
  [write code]
  $perfectable detect        → On each UI file (or hooks on)
  $perfectable critique      → Design review, heuristic scores
  $perfectable audit         → Technical + platform audit
  $perfectable harden        → Crash/dirty/a11y/i18n/perms
  $perfectable adapt         → Sizes, HiDPI, compact chrome
  $perfectable polish        → Final batched pass (inherits P0/P1)

EXISTING APP REVIEW:
  $perfectable context       → Check state
  $perfectable document      → If CHROME.md missing
  $perfectable critique      → UX review
  $perfectable audit         → Technical audit
  $perfectable polish        → Fix P0/P1

CI GATE:
  $perfectable detect --format=sarif src/ → Upload SARIF
  $perfectable detect --format=junit src/ → JUnit for CI
```

## Key References to Load

| File | When |
|------|------|
| `references/craft-floor.md` | Before ANY UI edit |
| `platforms/macos/macos.md` / `windows/windows.md` / `linux/linux.md` | After `init` captures platform |
| `references/routing.md` | When `/perfectable` invoked with no args |
| `references/critique.md` | When running `critique` |
| `references/audit.md` | When running `audit` |
| `references/polish.md` | When running `polish` |
| `references/harden.md` | When running `harden` |
| `references/adapt.md` | When running `adapt` |
| `references/shape.md` | When running `shape` |
| `references/init.md` | When running `init` |
| `references/document.md` | When running `document` |

## Output Formats for Automation

```bash
# SARIF for GitHub Security / Code Scanning
$perfectable detect --format=sarif src/

# JUnit for CI (Jenkins, GitLab, Azure DevOps)
$perfectable detect --format=junit src/

# Markdown for PR comments
$perfectable detect --format=markdown src/

# JSON for programmatic use
$perfectable detect --json src/
```

## Hook Integration

```bash
# Enable per-edit detector feedback (immediate rules only)
$perfectable hooks on

# Disable
$perfectable hooks off

# Ignore specific rule project-wide
$perfectable hooks ignore-rule electron-node-integration

# Ignore file pattern
$perfectable hooks ignore-file src/legacy/**

# Inline ignore (in source)
// perfectable-disable-next-line electron-node-integration
```

## Persona Customization

Add to APP.md:
```markdown
## Personas
- name: "Embedded Engineer"
  tests: [register view, memory map, peripheral config]
  red_flags: [no hex display, no register highlighting, web file picker for firmware]
```

Then `$perfectable critique` will include this persona.

## Anti-Patterns to Never Produce

The detector catches these — don't make the user run detect to find them:

- `nodeIntegration: true` / `contextIsolation: false` / `webSecurity: false`
- Frameless window without `-webkit-app-region: drag`
- `<input type="file">` in desktop app (use native dialog)
- `outline: none` without `:focus-visible`
- 44px+ touch rows in trees/tabs/menus
- Hamburger menu as only menu
- Settings in modal over editor
- Fake traffic lights / custom window controls
- Dark-only UI (no `prefers-color-scheme`)
- VS Code activity bar clone (48px icon bar) without peer tools
- Violet-on-near-black default palette
- Pulsing AI status dots
- Gradient text in chrome
- Icon-only toolbar buttons without aria-label
- Unvirtualized file trees (`.map` without react-window/virtuoso)
- `<textarea value={...}>` whole-buffer editors (use Monaco/CodeMirror)

## Escalation

If detector crashes or gives unclear results:
1. Run `$perfectable detect --immediate [file]` for mechanical rules only
2. Check `.perfectable/config.json` for ignore rules
3. Run with `--no-config` to bypass project config
4. Report issue with `--json` output

---

**Remember**: The Workbench skill is a QUALITY GATE, not a style guide. Its detector catches objective defects. Its critique provides scored design review. Both are required before shipping desktop/IDE UI.