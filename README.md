# CodeRabbit GitHub Parser

[![CI](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/ci.yml)
[![Code Quality](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/quality.yml/badge.svg)](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/quality.yml)

A CLI tool for fetching and analyzing GitHub pull request comments, with specialized support for parsing CodeRabbit AI review comments.

## Overview

This tool streamlines the workflow between GitHub pull requests and development teams by:

- **Fetching PR Data**: Retrieves pull requests and their comments using GitHub CLI
- **CodeRabbit Integration**: Specialized parsing of CodeRabbit AI review comments
- **Multiple Output Formats**: Supports table, JSON, and markdown output formats
- **Smart Filtering**: Filters resolved and outdated comments by default for focused review
- **Structured Analysis**: Categorizes comments by type, severity, and provides actionable suggestions

## Features

- 🚀 **Fast**: Built with Bun runtime for optimal performance
- 📝 **Multiple Formats**: Table, JSON, and markdown output options
- 🤖 **CodeRabbit Support**: Specialized parsing for CodeRabbit AI review comments
- 🔍 **Smart Filtering**: Shows only active comments by default, with options to include resolved/outdated
- 🎯 **Comment Analysis**: Categorizes by type (issue, suggestion) and severity (critical, major, minor, info)
- 📊 **Rich Output**: Includes code suggestions, AI prompts, and detailed comment metadata
- 🔧 **CLI Interface**: Intuitive command-line interface with comprehensive options

## Installation

### For End Users

**Install from GitHub Packages:**

```bash
# Configure npm to use GitHub Packages for @angelxmoreno scope
echo "@angelxmoreno:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install globally
npm install -g @angelxmoreno/coderabbit-github-parser

# Or with bun
bun install -g @angelxmoreno/coderabbit-github-parser

# Using in a project
npm install @angelxmoreno/coderabbit-github-parser
```

**Authentication for GitHub Packages:**
You'll need a GitHub Personal Access Token with `read:packages` permission:
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/fine-grained)
2. Create a fine-grained token with **Packages: Read** permission
3. Add to your `~/.npmrc`:
```text
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT_TOKEN
```

**Note**: This package requires [Bun](https://bun.sh/) to be installed on your system.

### For Development

```bash
bun install
```

## Commands

### Install CodeRabbit Template

Install the CodeRabbit review analysis template to your Claude commands directory for easy access:

```bash
@angelxmoreno/coderabbit-github-parser install:template [options]
# Or with the global alias:
cgp install:template [options]
```

**Installation Scopes:**
- **Global**: `~/.claude/commands` - Available across all projects
- **Project**: `./.claude/commands` - Available only in current project

**Options:**
- `--force` - Overwrite existing template file if it exists
- `--scope <scope>` - Installation scope: `project` or `global` (interactive prompt by default)
- `--target <path>` - Custom target directory
- `--filename <name>` - Custom filename (default: `coderabbit-review-template.md`)
- `--no-interactive` - Run in non-interactive mode with defaults

**Examples:**
```bash
# Interactive installation (prompts for scope and options)
cgp install:template

# Install globally with no prompts
cgp install:template --no-interactive --scope global

# Install to current project
cgp install:template --scope project

# Install with custom options
cgp install:template --filename my-template.md --force
```

The template provides comprehensive prompts and examples for analyzing CodeRabbit review comments with AI assistance.

### List Pull Requests

List pull requests for the current repository:

```bash
# With globally installed package
cgp pr:list [options]
# Or with npx
npx @angelxmoreno/coderabbit-github-parser pr:list [options]
# Development mode
bun pr:list [options]
```

**Options:**
- `-s, --state <state>` - Filter by state: open, closed, merged, or all (default: "all")
- `-a, --author <author>` - Filter by author
- `--assignee <assignee>` - Filter by assignee
- `-l, --limit <limit>` - Maximum number of items to fetch
- `-d, --draft` - Filter by draft state

**Examples:**
```bash
# List all open PRs
cgp pr:list --state open

# List PRs by specific author
cgp pr:list --author username

# List first 10 PRs
cgp pr:list --limit 10
```

### Fetch PR Comments

Fetch all comments (conversation + review comments) for a specific PR:

```bash
cgp pr:comments <prIdentifier> [options]
# Or with npx
npx @angelxmoreno/coderabbit-github-parser pr:comments <prIdentifier> [options]
```

**Options:**
- `-R, --repo <repo>` - Select another repository using [HOST/]OWNER/REPO format
- `-f, --format <format>` - Output format: table or json (default: "table")

**Examples:**
```bash
# Get comments for PR #123
cgp pr:comments 123

# Get comments in JSON format
cgp pr:comments 123 --format json

# Get comments for PR in different repo
cgp pr:comments 456 --repo owner/repo
```

### Analyze CodeRabbit Comments

Fetch and parse CodeRabbit AI review comments with advanced filtering:

```bash
cgp pr:coderabbit <prIdentifier> [options]
# Or with npx
npx @angelxmoreno/coderabbit-github-parser pr:coderabbit <prIdentifier> [options]
```

**Options:**
- `-R, --repo <repo>` - Select another repository using [HOST/]OWNER/REPO format
- `-f, --format <format>` - Output format: table, json, or markdown (default: "table")
- `-t, --type <type>` - Filter by comment type: issue, suggestion, or all (default: "all")
- `-s, --severity <severity>` - Filter by severity: critical, major, minor, info, or all (default: "all")
- `--include-resolved` - Include comments that have been marked as resolved
- `--include-outdated` - Include comments that are outdated (apply to old code)

**Filtering Behavior:**
- **Default**: Shows only active (unresolved, non-outdated) comments for focused review
- **Resolved comments**: Detected by text patterns like "✅ Addressed in commits", "✅ Resolved", or "<!-- resolved -->"
- **Outdated comments**: Comments where the original code has changed (different commit IDs and no current position)

**Examples:**
```bash
# Get active CodeRabbit comments (default - excludes resolved/outdated)
cgp pr:coderabbit 123

# Get all CodeRabbit comments including resolved and outdated
cgp pr:coderabbit 123 --include-resolved --include-outdated

# Get only critical issues
cgp pr:coderabbit 123 --severity critical --type issue

# Generate markdown report
cgp pr:coderabbit 123 --format markdown

# Get suggestions only in JSON format
cgp pr:coderabbit 123 --type suggestion --format json
```

### Output Formats

**Table Format** (default for terminal viewing):
- Clean tabular display with emojis for visual categorization
- Truncated content for readability
- Summary statistics

**JSON Format** (for programmatic processing):
- Complete comment data including parsed CodeRabbit structure
- Raw comment bodies and metadata
- Structured for further processing

**Markdown Format** (for documentation and reporting):
- Rich formatted report with summary statistics
- Collapsible sections for code suggestions and AI prompts
- Ready for documentation or sharing

## Development

### Scripts

- `bun run build` - Compile TypeScript
- `bun run test` - Run test suite
- `bun run typecheck` - Type checking without emit
- `bun run lint` - Lint code with Biome
- `bun run lint:fix` - Auto-fix lint issues
- `bun run check` - Run all quality checks (lint + typecheck + test)

### Code Quality

This project uses:
- **Biome** for linting and formatting
- **CommitLint** for conventional commit messages
- **LeftHook** for git hooks
- **TypeScript** with strict mode enabled

### Release Process

This project uses **release-please** for automated releases:

1. **Conventional Commits**: All commits must follow [conventional commit format](https://www.conventionalcommits.org/)
   ```bash
   feat: add new feature
   fix: resolve bug in component
   docs: update README
   chore: update dependencies
   ```

2. **Automated Releases**: When changes are merged to `main`:
   - release-please analyzes commit messages
   - Creates a "Release PR" with version bump and changelog
   - When Release PR is merged → automatic GitHub release + GitHub Packages publish

3. **Version Bumping**:
   - `feat:` → minor version bump (1.0.0 → 1.1.0)
   - `fix:` → patch version bump (1.0.0 → 1.0.1)
   - `feat!:` or `BREAKING CHANGE:` → major version bump (1.0.0 → 2.0.0)

4. **Manual Release** (if needed):
   ```bash
   # Create and merge a Release PR manually
   gh pr create --title "chore: release 1.1.0" --body "Release version 1.1.0"
   ```

### Contributing

1. **Follow conventional commits format** for automated releases
2. **Run quality checks** before committing:
   ```bash
   bun run check  # Runs lint + typecheck + test
   ```
3. **Create PR** against `main` branch
4. **Merge to main** triggers automated release process

## Requirements

- Bun v1.3.0 or higher
- Node.js (for compatibility)
- Git (for branch detection)
- GitHub CLI or API access (for fetching PR data)

## License

[MIT](LICENSE)
