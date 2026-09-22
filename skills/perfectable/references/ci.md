# CI/CD Integration Guide

Integrate the Perfectable detector into your CI/CD pipeline to gate merges on desktop/IDE UI quality.

## GitHub Actions

### Basic Workflow (SARIF Upload)

Create `.github/workflows/perfectable.yml`:

```yaml
name: Perfectable UI Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  perfectable:
    runs-on: ubuntu-latest
    permissions:
      security-events: write  # for SARIF upload
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install perfectable-skill
        run: npx github:saksham-45/perfectable install -y --scope=project --providers=github
      
      - name: Run Perfectable Detector (SARIF)
        run: npx perfectable detect --format=sarif src/ > perfectable-results.sarif || true
      
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: perfectable-results.sarif
          category: perfectable-ui
```

### With JUnit Output (for CI Dashboards)

```yaml
      - name: Run Perfectable Detector (JUnit)
        run: npx perfectable detect --format=junit src/ > perfectable-results.xml || true
      
      - name: Publish JUnit Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: perfectable-junit
          path: perfectable-results.xml
```

### Fail Build on P0 Findings Only

```yaml
      - name: Run Perfectable Detector (JSON)
        id: detect
        run: |
          npx perfectable detect --json src/ > detect.json || true
          echo "findings=$(cat detect.json | jq '.findings | length')" >> $GITHUB_OUTPUT
          echo "errors=$(cat detect.json | jq '[.findings[] | select(.severity=="error")] | length')" >> $GITHUB_OUTPUT
      
      - name: Fail on Errors
        if: steps.detect.outputs.errors > 0
        run: |
          echo "::error::Perfectable detector found ${{ steps.detect.outputs.errors }} error(s)"
          cat detect.json | jq -r '.findings[] | select(.severity=="error") | "\(.file):\(.line) [\(.severity)] \(.id) — \(.name)"'
          exit 1
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
perfectable:
  stage: test
  image: node:20
  before_script:
    - npm ci
    - npx github:saksham-45/perfectable install -y --scope=project
  script:
    - npx perfectable detect --format=junit src/ > perfectable-junit.xml || true
  artifacts:
    reports:
      junit: perfectable-junit.xml
    when: always
  allow_failure: false  # Set true to not block pipeline
```

## Azure DevOps Pipelines

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
  
  - script: npm ci
    displayName: 'Install dependencies'
  
  - script: npx github:saksham-45/perfectable install -y --scope=project
    displayName: 'Install Perfectable Skill'
  
  - script: npx perfectable detect --format=junit src/ > perfectable-junit.xml || true
    displayName: 'Run Perfectable Detector'
  
  - task: PublishTestResults@2
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'perfectable-junit.xml'
    condition: always()
```

## Pre-commit Hook (Local)

### Using Husky

```bash
# Install
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx perfectable detect --immediate $(git diff --cached --name-only -- '*.tsx' '*.ts' '*.jsx' '*.js' '*.css' '*.html' '*.vue' '*.svelte') || exit 1"
```

### Using Perfectable Hooks (Recommended)

```bash
# In your project
$perfectable hooks on

# This installs PostToolUse + Stop hooks for supported harnesses
# The detector runs automatically after UI edits
```

## Docker (for Consistent CI Environment)

```dockerfile
# Dockerfile.perfectable
FROM node:20-alpine
RUN npm install -g perfectable@latest
WORKDIR /app
ENTRYPOINT ["perfectable"]
```

```yaml
# In CI
- name: Run Perfectable in Docker
  run: |
    docker build -f Dockerfile.perfectable -t perfectable .
    docker run --rm -v $(pwd):/app perfectable detect --format=sarif /app/src/ > perfectable.sarif
```

## Badge for README

```markdown
![Perfectable UI Quality](https://github.com/<owner>/<repo>/actions/workflows/perfectable.yml/badge.svg)
```

## Configuration

### Ignore Rules in CI Only

```json
// .perfectable/config.json
{
  "hook": { "enabled": false },
  "detector": {
    "ignoreRules": ["overused-dev-font"],
    "ignoreFiles": ["src/legacy/**", "**/*.test.ts"],
    "customRules": ["./.perfectable/rules/project-rules.mjs"]
  }
}
```

### Environment-Specific Config

```bash
# CI-only ignores
PERFETABLE_IGNORE_RULES="overused-dev-font" npx perfectable detect src/
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Clean — no findings |
| 2 | Findings detected |
| 1 | Usage error / crash |

Use `|| true` in CI scripts to capture artifacts even on findings, then check exit code or parse output for gating.

## Performance Tips

- Run detector only on changed files: `detect --json $(git diff --name-only HEAD~1 -- '*.tsx' '*.css' ...)`
- Cache `node_modules` and `.perfectable` between runs
- Use `--immediate` for fast per-edit checks in pre-commit
- Full scan (`detect --json src/`) in CI takes ~2-5s for typical projects

## Skill fixtures

The skill's own layout fixtures live in `fixtures/` next to this reference's parent. They are not a product scan.

```bash
node scripts/detect.mjs --no-config fixtures/slop-editor.html
node scripts/detect.mjs --no-config fixtures/editor-first.html
node scripts/detect.mjs --no-config fixtures/three-pane.html
node scripts/detect.mjs --no-config fixtures/settings.html
```

`slop-editor.html` and `slop-three-pane.html` and `slop-settings.html` exit 2. `editor-first.html`, `three-pane.html`, and `settings.html` exit 0. Run with `--no-config` so a project ignore list cannot hide a regression.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found" | Ensure `npx github:saksham-45/perfectable install` ran |
| SARIF not uploading | Check `security-events: write` permission |
| False positives | Add to `.perfectable/config.json` ignoreRules/ignoreFiles |
| Slow on large projects | Run on changed files only, or use `--immediate` |
| Windows line endings | Use `git diff --name-only` with proper path handling |