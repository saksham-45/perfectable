# Perfectable Quality Check GitHub Action

Run Perfectable detector on your desktop/IDE UI code as part of your CI/CD pipeline.

## Usage

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
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Perfectable Detector
        uses: saksham-45/perfectable-action@v1
        with:
          path: 'src/'
          format: 'sarif'
          fail-on-findings: 'true'
      
      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: perfectable-results.sarif
          category: perfectable-ui
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `path` | Path to scan (relative to repository root) | No | `src/` |
| `format` | Output format (`json`, `sarif`, `junit`, `markdown`) | No | `sarif` |
| `fail-on-findings` | Fail the action if findings are detected | No | `true` |
| `config-file` | Path to `.perfectable/config.json` (optional) | No | - |
| `install-version` | Perfectable skill version to install | No | `latest` |

## Outputs

The action produces a results file in the specified format:
- `perfectable-results.json` (JSON format)
- `perfectable-results.sarif` (SARIF format for GitHub Security)
- `perfectable-results.xml` (JUnit format for CI dashboards)
- `perfectable-results.md` (Markdown for PR comments)

## Example: PR Comment with Results

```yaml
- name: Comment PR with Perfectable Results
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const results = fs.readFileSync('perfectable-results.md', 'utf8');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '## Perfectable UI Quality Report\n\n' + results
      })
```

## Configuration

Create a `.perfectable/config.json` in your repository root to customize behavior:

```json
{
  "hook": { "enabled": false },
  "detector": {
    "ignoreRules": ["overused-dev-font"],
    "ignoreFiles": ["src/legacy/**"],
    "customRules": ["./.perfectable/rules/project-rules.mjs"]
  }
}
```

## Supported Formats

| Format | Use Case |
|--------|----------|
| `sarif` | GitHub Security tab, code scanning |
| `json` | Programmatic processing |
| `junit` | CI dashboards (Jenkins, GitLab, Azure DevOps) |
| `markdown` | PR comments, documentation |

## Local Testing

```bash
# Build the Docker image
docker build -t perfectable-action -f action/Dockerfile .

# Run locally
docker run --rm -v $(pwd):/github/workspace perfectable-action src/ sarif
```

## License

MIT