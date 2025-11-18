# Publishing Guide

This document explains how to publish tm-cli to npm and Homebrew.

[中文版本](PUBLISHING.md) | **English**

---

## Prerequisites

### 1. NPM Publishing Preparation

1. Register an account at [npmjs.com](https://www.npmjs.com/)
2. Login to npm locally:
   ```bash
   npm login
   ```
3. Create an access token on the npm website:
   - Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select "Automation" type
   - Copy the generated token

4. Add NPM_TOKEN secret to your GitHub repository:
   - Visit your GitHub repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token

### 2. GitHub Repository Setup

The following fields in `package.json` have been configured:
```json
{
  "name": "@imkratos/tm-cli",  // Using your npm username
  "author": "imkratos <imkratos@users.noreply.github.com>",
  "repository": {
    "url": "https://github.com/imkratos/tm-cli.git"
  }
}
```

GitHub URLs in `homebrew/tm-cli.rb` have been configured:
```ruby
homepage "https://github.com/imkratos/tm-cli"
url "https://github.com/imkratos/tm-cli/archive/refs/tags/v1.0.0.tar.gz"
```

## Publishing Process

### Method 1: Automatic Publishing via GitHub Release

1. **Create and push git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create a Release on GitHub**:
   - Visit your repository page
   - Click "Releases" > "Create a new release"
   - Select the tag you just created (v1.0.0)
   - Fill in the Release title and description
   - Click "Publish release"

3. **Automatic workflow triggers**:
   - GitHub Actions will run automatically
   - npm-publish.yml will publish the project to npm
   - homebrew-update.yml will update the Homebrew formula

### Method 2: Manual Trigger via GitHub Actions

1. **Visit the Actions page**:
   - Go to your GitHub repository
   - Click the "Actions" tab

2. **Manually trigger NPM publish**:
   - Select "Publish to NPM" workflow
   - Click "Run workflow"
   - Enter version number (optional, e.g., 1.0.1)
   - Click "Run workflow" button

3. **Manually trigger Homebrew update**:
   - Select "Update Homebrew Formula" workflow
   - Click "Run workflow"
   - Click "Run workflow" button

## NPM Installation

After successful publishing, users can install via:

```bash
# Global installation
npm install -g @imkratos/tm-cli

# Or if not using scope
npm install -g tm-cli

# Usage
tm --help
```

## Homebrew Installation

### Option 1: Create Your Own Homebrew Tap (Recommended)

1. **Create tap repository**:
   - Create a new repository on GitHub named `homebrew-tap`
   - Full path should be: `https://github.com/imkratos/homebrew-tap`

2. **Copy formula to tap repository**:
   ```bash
   git clone https://github.com/imkratos/homebrew-tap.git
   cd homebrew-tap
   mkdir -p Formula
   cp /path/to/tm-cli/homebrew/tm-cli.rb Formula/
   git add Formula/tm-cli.rb
   git commit -m "Add tm-cli formula"
   git push
   ```

3. **User installation**:
   ```bash
   # Add tap
   brew tap imkratos/tap

   # Install
   brew install tm-cli
   ```

### Option 2: Submit to Official Homebrew Repository

1. Fork [homebrew-core](https://github.com/Homebrew/homebrew-core)
2. Add your formula to the `Formula/` directory
3. Create a Pull Request
4. Wait for Homebrew team review

After approval, users can install directly:
```bash
brew install tm-cli
```

## Version Management

### Update Version Number

Use npm's version management commands:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

This will automatically:
- Update version number in `package.json`
- Create a git commit
- Create a git tag

Then push:
```bash
git push && git push --tags
```

## Troubleshooting

### NPM Publishing Fails

1. **Permission error**:
   - Confirm NPM_TOKEN is correctly set
   - Confirm package name is not already taken
   - If using scope (@username/package), confirm you have permission

2. **Build fails**:
   - Check TypeScript compilation errors
   - Ensure all tests pass

### Homebrew Installation Fails

1. **SHA256 mismatch**:
   - Wait for GitHub Actions to update formula
   - Or manually calculate the correct SHA256

2. **Dependency issues**:
   - Ensure user has Node.js installed
   - Check dependency declarations in formula

## CI/CD Description

The project includes two GitHub Actions workflows:

1. **npm-publish.yml**:
   - Trigger: On Release creation or manual trigger
   - Function: Run tests, build project, publish to npm

2. **homebrew-update.yml**:
   - Trigger: On Release creation or manual trigger
   - Function: Update Homebrew formula URL and SHA256

## Best Practices

1. **Semantic Versioning**: Follow [SemVer](https://semver.org/) specification
2. **Changelog**: Maintain CHANGELOG.md to record changes for each version
3. **Test Coverage**: Ensure all tests pass before publishing
4. **Documentation Sync**: Update README.md when updating versions

## Quick Start Checklist

- [ ] Set up NPM_TOKEN in GitHub Secrets
- [ ] Verify package.json configuration is correct
- [ ] Run `npm test` to ensure tests pass
- [ ] Run `npm run build` to ensure build succeeds
- [ ] Create and push git tag
- [ ] Create GitHub Release
- [ ] Verify npm package published successfully
- [ ] (Optional) Create homebrew-tap repository
- [ ] (Optional) Copy formula to tap repository

## Support

If you encounter any issues during the publishing process, please:
1. Check the GitHub Actions logs
2. Refer to the troubleshooting section above
3. [Submit an issue](https://github.com/imkratos/tm-cli/issues)
