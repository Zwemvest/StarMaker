---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (inline test config) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FNDN-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 01-01-02 | 01 | 1 | FNDN-07 | unit | `npx tsc --noEmit` | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | FNDN-02 | unit | `npx vitest run tests/engine/dice.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FNDN-03 | unit | `npx vitest run tests/engine/roll-log.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | FNDN-04 | unit | `npx vitest run tests/engine/hash.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | FNDN-05 | unit | `npx vitest run tests/machines/creation.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | FNDN-06 | unit | `npx vitest run tests/stores/character.test.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | DEPL-01 | smoke | Manual — verify URL loads | N/A | ⬜ pending |
| 01-04-02 | 04 | 2 | DEPL-02 | integration | `gh run list --workflow=deploy.yml --limit=1` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/setup.ts` — Web Crypto API polyfill for jsdom (`globalThis.crypto = require('node:crypto').webcrypto`)
- [ ] `tests/engine/dice.test.ts` — stubs for FNDN-02
- [ ] `tests/engine/roll-log.test.ts` — stubs for FNDN-03
- [ ] `tests/engine/hash.test.ts` — stubs for FNDN-04
- [ ] `tests/machines/creation.test.ts` — stubs for FNDN-05
- [ ] `tests/stores/character.test.ts` — stubs for FNDN-06
- [ ] Vitest config in `vite.config.ts` (globals, jsdom, setupFiles)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App loads on GitHub Pages | DEPL-01 | Requires live deployment | Push to main, check URL loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
