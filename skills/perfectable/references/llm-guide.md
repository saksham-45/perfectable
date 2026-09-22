# LLM Guide — Using Perfectable

This guide helps models use the Perfectable skill. Load it when the skill is invoked.

## System Prompt Snippet

When Perfectable is active, follow the skill's command routing. The pieces are:

- `$perfectable layout` for regions, rhythm, spread, and optical alignment. Load it when the complaint is spacing, alignment, empty space, or hierarchy, before polish.
- `$perfectable typeset` and `$perfectable materials` for type and layers.
- Detector (`$perfectable detect`) for mechanical defects.
- `$perfectable critique` for the 17 heuristics and 6 personas.
- `$perfectable shape` before code when the composition is unknown. The brief includes a spatial contract.
- `$perfectable init` and `$perfectable document` for APP.md and CHROME.md.
- `$perfectable polish`, `$perfectable harden`, `$perfectable adapt` for the finish, the edge cases, and the window sizes.

Pinned APP.md beats taste. Incumbent chrome is visual authority. Load the craft floor before editing UI. A clean detector scan is not a quality certificate. Do not run every command on every task.

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
    ├─ "Fix the spacing" / "spread this out" / "alignment" / "hierarchy" / "feels like a website"
    │   → $perfectable layout [target]
    │
    ├─ "Typography" / "type is too big" / "line length"
    │   → $perfectable typeset [target]
    │
    ├─ "Color" / "glass" / "too loud" / "too flat"
    │   → $perfectable materials [target]
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

### Example 1: New Electron app
```
User: "Build me a code editor in Electron"

Assistant:
1. `$perfectable init` → platform, shell, posture sovereign, composition editor-first
2. `$perfectable shape` → spatial contract: buffer is sovereign, air inside the buffer, chrome uses the platform row metric, sidebar toggles closed
3. Writes the window from that contract, the craft floor, and the platform file
4. `$perfectable detect` on the UI files
5. `$perfectable layout` if the first render is one padding everywhere
```

### Example 1b: Flat spacing
```
Before: a titlebar, sidebar, and editor share padding: 16px. Three columns are 1fr 1fr 1fr. The empty state is a centered card with a pill button.

After (three-pane): sidebar and list use the platform row metric and the tight role inside a row. The group role separates list sections. The detail column caps prose on the type measure and lets the margin grow. The command band uses the control role between buttons. The empty state sits in the detail pane, left-aligned, and names the next action.
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
2. Returns: dual-agent method, heuristic scores (out of 68 when all 17 apply), persona red flags, 3-5 priority issues with P0-P3
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
| One padding token everywhere | Squint test sees equal regions | `$perfectable layout` and the spatial contract |
| Ignores platform conventions | Audit: platform conformance < 3 | Load platform reference (macos.md/windows.md/linux.md) |
| Claims "done" after one pass | A named gap is still open (spacing, type, platform, crash) | Run the command for that gap. Do not run every command |
| Softens findings ("consider", "maybe") | Priority issues all P2/P3 | Be specific: name control, P0 blocks task, P1 before release |

## Command Pipeline — Standard Workflow

```
NEW APP:
  $perfectable init          → APP.md, including posture and composition
  $perfectable shape         → thesis, composition, spatial contract
  [write that contract]
  $perfectable layout        → if the first render has one interval everywhere
  $perfectable detect        → on touched UI files

EXISTING APP REVIEW:
  $perfectable document      → if CHROME.md is missing
  $perfectable layout        → when the complaint is spatial
  $perfectable critique      → when the user asked for a review
  $perfectable polish        → to finish P0/P1, after the composition is right

Run harden, adapt, audit, typeset, or materials when that specific gap is the one in front of you.

CI GATE:
  $perfectable detect --format=sarif src/ → Upload SARIF
  $perfectable detect --format=junit src/ → JUnit for CI
```

## Key References to Load

| File | When |
|------|------|
| `references/craft-floor.md` | Before any UI edit |
| `references/canon/layout-geometry.md` | During `layout`, via the command file |
| `references/layout.md` | Spacing, alignment, spread, hierarchy |
| `references/typeset.md` | Chrome type or prose measure |
| `references/materials.md` | Color, glass, elevation |
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

**Remember**: The detector catches mechanical defects. Layout, type, and materials are judged by their command files and by critique. A clean scan does not mean the window is sharp.