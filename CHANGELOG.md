# Changelog

All notable changes to AlphaMind are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows `YYYY.M.D` (calendar versioning).

---

## [2026.4.25] — 2026-04-25

### Added
- Project rebranded to **AlphaMind** by Prathamesh Penshanwar
- `SECURITY.md` — responsible disclosure policy and security best practices
- `CONTRIBUTING.md` — developer guide with tool and skill contribution steps
- `CHANGELOG.md` — this file
- `requirements.txt` — Python dependencies for OpenBB Platform integration
- Expanded `.gitignore` — covers OS files, IDEs, Playwright, and coverage outputs
- `LICENSE` — MIT, copyright Prathamesh Penshanwar

### Changed
- All runtime data moved from `.dexter/` → `.alphamind/`
- `package.json` — name `dexter-ts` → `alphamind`, added `author` field
- `README.md` — fully rewritten: architecture diagram, feature table, usage examples, configuration guide
- `AGENTS.md` — updated repo URL and all project references
- All source file strings updated: `Dexter` → `AlphaMind`, eval run names updated

### Security
- `.env` pattern in `.gitignore` now explicitly allows `env.example` via negation rule
- `.alphamind/` runtime directory is fully gitignored (scratchpad, cache, settings)

---

## [2026.2.11] — 2026-02-11 *(upstream baseline)*

### Added
- Initial release of the financial research agent
- Multi-provider LLM support (OpenAI, Anthropic, Google, xAI, OpenRouter, Ollama)
- Financial tools: prices, fundamentals, key ratios, filings, insider trades, segments
- Web search via Exa → Perplexity → Tavily fallback chain
- Playwright-based browser tool for web scraping
- OpenBB Platform bridge for free local market data
- DCF valuation skill (`src/skills/dcf/`)
- LangSmith evaluation runner with real-time Ink UI
- Scratchpad logging for full agent debug history
- `/model` command for in-session provider/model switching
- Long-term chat history persistence
- Response caching layer with TTL support
- CI workflow: typecheck + tests on every push/PR
