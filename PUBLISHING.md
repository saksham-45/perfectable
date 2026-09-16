# Publishing Guide

This document describes how to publish the Perfectable skill to various marketplaces.

## Prerequisites

- Node.js 18+
- npm account (for npm publishing)
- VS Code Marketplace publisher account
- OpenVSX publisher account
- GitHub repository with Actions enabled

## Publishing to npm (Core Package)

```bash
# Login to npm
npm login

# Build and pack
npm run pack:check
npm publish --access public
```

## Publishing to VS Code Marketplace

### 1. Install vsce
```bash
npm install -g vsce
```

### 2. Login to VS Code Marketplace
```bash
vsce login <publisher-name>
```

### 3. Package and Publish
```bash
cd lsp/vscode
npm install
npm run compile
vsce package
vsce publish
```

### 4. Update README with Marketplace Badge
Add to README.md:
```markdown
![Version](https://img.shields.io/visual-studio-marketplace/v/perfectable.perfectable-lsp)
![Installs](https://img.shields.io/visual-studio-marketplace/i/perfectable.perfectable-lsp)
![Rating](https://img.shields.io/visual-studio-marketplace/r/perfectable.perfectable-lsp)
```

## Publishing to OpenVSX Registry

```bash
# Login to OpenVSX
vsce login <publisher-name>  # or use ovsx

# Publish to OpenVSX
cd lsp/vscode
ovsx publish perfectable-lsp-<version>.vsix
```

## GitHub Marketplace (GitHub Actions)

### 1. Create a GitHub Action

Create `.github/workflows/perfectable.yml`:
```yaml
name: Perfectable Quality Check

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
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install Perfectable
        run: npm install -g perfectable
      
      - name: Run Perfectable Detector
        run: perfectable detect --format=sarif src/ > perfectable.sarif || true
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: perfectable.sarif
```

### 2. Publish to GitHub Marketplace

1. Create a new repository for the GitHub Action
2. Add `action.yml`:
```yaml
name: 'Perfectable Quality Check'
description: 'Run Perfectable detector on your desktop/IDE UI code'
inputs:
  path:
    description: 'Path to scan'
    required: false
    default: 'src/'
  format:
    description: 'Output format (json|sarif|junit|markdown)'
    required: false
    default: 'sarif'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.path }}
    - --format=${{ inputs.format }}
```
3. Publish to GitHub Marketplace from repository settings

## Cursor Extensions Marketplace

1. Package as VS Code extension (`.vsix`)
2. Submit to Cursor Extensions Marketplace via their submission process
3. Cursor supports VS Code extensions natively

## Docker Hub (for CI/CD)

```dockerfile
# Dockerfile.perfectable
FROM node:20-alpine
RUN npm install -g perfectable@latest
WORKDIR /app
ENTRYPOINT ["perfectable"]
```

```bash
docker build -f Dockerfile.perfectable -t perfectable .
docker tag perfectable <username>/perfectable:latest
docker push <username>/perfectable:latest
```

## Homebrew (macOS)

```ruby
# Formula/perfectable.rb
class Perfectable < Formula
  desc "Desktop/IDE UI quality audit tool"
  homepage "https://github.com/saksham-45/perfectable"
  url "https://registry.npmjs.org/perfectable/-/perfectable-1.0.0.tgz"
  sha256 "<sha256>"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "perfectable", shell_output("#{bin}/perfectable --help")
  end
end
```

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run `npm test`
- [ ] Build LSP extension: `cd lsp/vscode && npm run compile`
- [ ] Test VS Code extension locally
- [ ] Package: `vsce package`
- [ ] Test packaged extension
- [ ] Publish to VS Code Marketplace: `vsce publish`
- [ ] Publish to OpenVSX: `ovsx publish`
- [ ] Publish to npm: `npm publish`
- [ ] Create GitHub Release with changelog
- [ ] Update Docker image: `docker build && docker push`
- [ ] Submit to Cursor Marketplace
- [ ] Update Homebrew formula (if applicable)

## Automated Release with GitHub Actions

Create `.github/workflows/release.yml`:
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Test
        run: npm test
      
      - name: Build LSP
        run: |
          cd lsp/vscode
          npm ci
          npm run compile
      
      - name: Package VS Code Extension
        run: |
          cd lsp/vscode
          npx vsce package
      
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Publish to VS Code Marketplace
        run: |
          cd lsp/vscode
          npx vsce publish -p ${{ secrets.VSCE_TOKEN }}
      
      - name: Publish to OpenVSX
        run: |
          cd lsp/vscode
          npx ovsx publish *.vsix -p ${{ secrets.OVSX_TOKEN }}
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: lsp/vscode/*.vsix
          generate_release_notes: true
```

## Required Secrets

Add these secrets to your GitHub repository:

- `NPM_TOKEN`: npm authentication token
- `VSCE_TOKEN`: VS Code Marketplace personal access token
- `OVSX_TOKEN`: OpenVSX personal access token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Versioning Strategy

Follow Semantic Versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes to CLI, detector rules, or schema
- MINOR: New features, new detector rules, new platform support
- PATCH: Bug fixes, documentation updates, minor improvements

Tag releases as `v1.0.0`, `v1.1.0`, etc.