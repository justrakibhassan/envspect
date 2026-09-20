<div align="center">

# envspect

🔍 Zero-config `.env` validation, secret leak detection, and team sync CLI

[![npm version](https://img.shields.io/npm/v/envspect)](https://www.npmjs.com/package/envspect)
[![CI](https://github.com/Rakib-Coder00/envspect/actions/workflows/ci.yml/badge.svg)](https://github.com/Rakib-Coder00/envspect/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Why?

Every team has these problems:

- 🔴 `.env.example` is outdated — new devs waste hours figuring out missing vars
- 🔴 Secrets get hardcoded in source files and committed to git
- 🔴 No one knows if `.env` matches `.env.example` until something breaks in production

**envspect** fixes all of this with a single command.

## Install

```bash
# Use directly with npx (no install needed)
npx envspect scan

# Or install globally
npm install -g envspect

# Or as a dev dependency
npm install -D envspect
```

## Commands

### `envspect scan` — Env Diff Detection

Compares your `.env` against `.env.example` and reports missing, extra, and empty variables.

```bash
# Basic scan
envspect scan

# Custom files
envspect scan --env .env.local --example .env.template

# Strict mode (also flags empty values as errors)
envspect scan --strict

# JSON output (for CI/CD pipelines)
envspect scan --format json
```

### `envspect audit` — Secret Leak Detection

Scans your codebase for hardcoded secrets, API keys, tokens, and credentials.

```bash
# Scan current directory
envspect audit

# Only show critical severity
envspect audit --severity critical

# Custom include/exclude patterns
envspect audit --include "src/**" --exclude "**/*.test.ts"
```

**Detects 15+ secret patterns:**
- AWS Access Keys & Secret Keys
- GitHub Personal Access Tokens
- Stripe API Keys
- JWT Tokens
- Database Connection Strings (PostgreSQL, MongoDB, MySQL, Redis)
- Google API Keys
- Slack, SendGrid, Twilio, Discord tokens
- PEM Private Keys
- Generic API key/password assignments
- npm tokens

### `envspect sync` — Team Sync (Coming in v1.0)

Encrypted `.env` sharing for teams. No more Slack DMs with secrets.

## Configuration

Create a `.envspectrc` or `.envspectrc.json` in your project root:

```json
{
  "envFile": ".env",
  "exampleFile": ".env.example",
  "format": "table",
  "scan": {
    "strict": false
  },
  "audit": {
    "include": ["src/**"],
    "exclude": ["**/node_modules/**", "**/dist/**"],
    "severity": "low"
  }
}
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate environment
  run: npx envspect scan --format json --strict

- name: Audit for secrets
  run: npx envspect audit --severity high
```

## Programmatic API

```typescript
import { parseEnvFile, diffEnvFiles, scanDirectory, defaultRules } from 'envspect';

// Parse and diff env files
const example = await parseEnvFile('.env.example');
const env = await parseEnvFile('.env');
const diff = diffEnvFiles(example.entries, env.entries);

console.log(`Missing: ${diff.missing.length}`);
console.log(`Extra: ${diff.extra.length}`);

// Scan for secrets
const report = await scanDirectory({
  cwd: process.cwd(),
  rules: defaultRules,
  include: ['**/*.ts'],
  exclude: ['**/node_modules/**'],
  minSeverity: 'low',
});

console.log(`Found ${report.findings.length} potential secrets`);
```

## License

MIT © [Rakib Hassan](https://github.com/Rakib-Coder00)