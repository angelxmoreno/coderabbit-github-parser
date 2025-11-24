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

```bash
bun install
```

## Commands

### Install CodeRabbit Template

Install the CodeRabbit review analysis template to your Claude commands directory for easy access:

```bash
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
bun pr:list --state open

# List PRs by specific author
bun pr:list --author username

# List first 10 PRs
bun pr:list --limit 10
```

### Fetch PR Comments

Fetch all comments (conversation + review comments) for a specific PR:

```bash
bun pr:comments <prIdentifier> [options]
```

**Options:**
- `-R, --repo <repo>` - Select another repository using [HOST/]OWNER/REPO format
- `-f, --format <format>` - Output format: table or json (default: "table")

**Examples:**
```bash
# Get comments for PR #123
bun pr:comments 123

# Get comments in JSON format
bun pr:comments 123 --format json

# Get comments for PR in different repo
bun pr:comments 456 --repo owner/repo
```

### Analyze CodeRabbit Comments

Fetch and parse CodeRabbit AI review comments with advanced filtering:

```bash
bun pr:coderabbit <prIdentifier> [options]
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
bun pr:coderabbit 123

# Get all CodeRabbit comments including resolved and outdated
bun pr:coderabbit 123 --include-resolved --include-outdated

# Get only critical issues
bun pr:coderabbit 123 --severity critical --type issue

# Generate markdown report
bun pr:coderabbit 123 --format markdown

# Get suggestions only in JSON format
bun pr:coderabbit 123 --type suggestion --format json
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

### Contributing

1. Follow conventional commits format
2. Run `bun run check` before committing
3. Ensure all tests pass and code is properly typed

## Requirements

- Bun v1.3.0 or higher
- Node.js (for compatibility)
- Git (for branch detection)
- GitHub CLI or API access (for fetching PR data)

## License

[MIT](LICENSE)
