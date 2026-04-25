# Security Policy

## Overview

AlphaMind is a CLI-based financial research agent. Security is taken seriously — especially since the tool handles API keys, external network requests, and financial data. This document outlines how to report vulnerabilities and what you can expect in response.

---

## Supported Versions

| Version | Supported |
|---|---|
| Latest (`main` branch) | ✅ Active support |
| Older releases | ❌ No backports |

Only the latest version on the `main` branch receives security fixes.

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Report security issues privately via one of the following:

- **Email:** prathamesh.penshanwar@[yourdomain].com *(replace with your actual contact)*
- **GitHub Private Vulnerability Reporting:** Use the [Security tab → Report a Vulnerability](https://github.com/prathamesh-penshanwar/AlphaMind/security/advisories/new) feature on GitHub (recommended).

### What to Include

Please include as much of the following as possible:

- Type of vulnerability (e.g., API key exposure, command injection, SSRF)
- Affected component(s) and file(s)
- Steps to reproduce
- Potential impact assessment
- Any suggested fix (optional but appreciated)

---

## Response Timeline

| Stage | Timeframe |
|---|---|
| Acknowledgement | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Fix / patch release | Within **30 days** (critical: sooner) |
| Public disclosure | After fix is released and users have had time to update |

---

## Security Best Practices for Users

### API Key Safety
- **Never commit your `.env` file** — it is gitignored by default.
- Use `.env` only for local development. For production/CI, use environment secrets (GitHub Actions secrets, etc.).
- Rotate any API keys that may have been accidentally exposed immediately.
- Grant minimal permissions to API keys — read-only where possible.

### Runtime Safety
- AlphaMind stores runtime data in `.alphamind/` (scratchpad, cache, settings). This directory is gitignored but may contain sensitive query history. Do not share it.
- Review `env.example` — it contains no real keys, only placeholders.
- The browser tool uses Playwright (Chromium). Ensure Playwright is kept up to date: `bun install`.

### Dependency Security
- Dependencies are managed via Bun and defined in `package.json`.
- Periodically audit for known vulnerabilities:
  ```bash
  bun audit   # when available
  # or use: npx audit (uses npm registry advisories)
  ```
- Pin major versions and review changelogs before upgrading LangChain or Playwright.

### Network Security
- AlphaMind makes outbound HTTPS calls to LLM APIs, financial data APIs, and search providers. No inbound ports are opened.
- The OpenBB bridge (`OPENBB_API_URL`) defaults to `localhost` — never expose it publicly.
- Web fetch and browser tools follow user-provided URLs. Avoid passing untrusted URLs from external sources.

---

## Scope

The following are **in scope** for security reports:

- Exposure or leakage of API keys or secrets
- Arbitrary code execution via tool calls or skill loading
- Server-Side Request Forgery (SSRF) via fetch/browser tools
- Path traversal in scratchpad, cache, or skill file loading
- Dependency vulnerabilities with a direct exploit path

The following are **out of scope**:

- Social engineering or phishing
- Denial-of-service via excessive API usage (rate limits are provider-side)
- Security issues in third-party APIs (report those to the respective providers)

---

## Credits

Responsible disclosures will be credited in release notes (with the reporter's permission).

Thank you for helping keep AlphaMind secure.
