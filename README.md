# CodeRabbit GitHub Parser

[![CI](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/ci.yml)
[![Code Quality](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/quality.yml/badge.svg)](https://github.com/amoreno/coderabbit-github-parser/actions/workflows/quality.yml)

A CLI tool that fetches GitHub pull request comments from the current branch and parses them into markdown format for AI agent consumption.

## Overview

This tool streamlines the workflow between GitHub pull requests and AI-powered development tools by:

- **Fetching PR Comments**: Automatically retrieves comments from the current branch's pull request
- **Parsing to Markdown**: Converts comments into structured markdown format
- **AI Integration**: Generates markdown files optimized for AI agent consumption and action execution

## Features

- 🚀 **Fast**: Built with Bun runtime for optimal performance
- 📝 **Structured Output**: Clean markdown format with proper comment threading
- 🤖 **AI-Ready**: Output format designed for AI agent processing
- 🔧 **CLI Interface**: Simple command-line tool for easy integration
- 📊 **Logging**: Structured logging with Pino for debugging and monitoring

## Installation

```bash
bun install
```

## Usage

```bash
bun run index.ts
```

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
