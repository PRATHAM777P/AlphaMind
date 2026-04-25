# Contributing to AlphaMind

Thank you for your interest in contributing! This document covers everything you need to get started.

---

## Code of Conduct

Be respectful, constructive, and kind. Harassment or abusive behaviour will not be tolerated.

---

## How to Contribute

### 1. Report Bugs

Open a [GitHub Issue](https://github.com/prathamesh-penshanwar/AlphaMind/issues) with:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behaviour
- Your OS, Bun version, and relevant environment details (no API keys!)

### 2. Suggest Features

Open a GitHub Issue labelled `enhancement`. Describe the use-case, not just the feature.

### 3. Submit a Pull Request

```bash
# Fork → clone → branch
git clone https://github.com/YOUR_USERNAME/AlphaMind.git
cd AlphaMind
git checkout -b feat/your-feature-name

# Make changes, then verify
bun install
bun run typecheck
bun test

# Commit using conventional commits
git commit -m "feat: add streaming progress to financial_search tool"
git push origin feat/your-feature-name
```

Then open a PR against `main`. Keep it small and focused — one feature or fix per PR.

---

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change, no feature/fix |
| `test:` | Adding or fixing tests |
| `chore:` | Tooling, deps, CI |

---

## Development Setup

```bash
bun install          # Install all dependencies
bun start            # Run interactive CLI
bun dev              # Run with watch mode (auto-reload)
bun run typecheck    # TypeScript type checking
bun test             # Run test suite
```

---

## Adding a New Tool

1. Create `src/tools/yourname/yourtool.ts` — implement `DynamicStructuredTool` from LangChain
2. Add a rich description in `src/tools/descriptions/yourname.ts`
3. Register it in `src/tools/registry.ts`
4. Add a test in `src/tools/yourname/yourtool.test.ts`

---

## Adding a Custom Skill

Drop a `SKILL.md` into `.alphamind/skills/` (project-level) or `~/.alphamind/skills/` (user-level). See `src/skills/dcf/SKILL.md` for the format.

---

## Security Issues

Do **not** open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md).

---

## Questions?

Open a [Discussion](https://github.com/prathamesh-penshanwar/AlphaMind/discussions) on GitHub.
