---
phase: 2
slug: pre-career-creation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (test section) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CHAR-01 | unit | `npx vitest run tests/engine/characteristics.test.ts -t "roll" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CHAR-02 | unit + integration | `npx vitest run tests/components/characteristics.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | CHAR-03 | unit | `npx vitest run tests/types/types.test.ts -t "modifier" --reporter=verbose` | ✅ partial | ⬜ pending |
| 02-01-04 | 01 | 1 | CHAR-04 | unit | `npx vitest run tests/stores/character.test.ts -t "max" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | BGSK-01 | unit | `npx vitest run tests/data/background-skills.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | BGSK-02 | unit | `npx vitest run tests/stores/character.test.ts -t "background" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | EDUC-01 | unit | `npx vitest run tests/machines/creation.test.ts -t "education" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | EDUC-02 | unit | `npx vitest run tests/data/education.test.ts -t "university entry" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | EDUC-03 | unit | `npx vitest run tests/data/education.test.ts -t "academy entry" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 2 | EDUC-04 | unit | `npx vitest run tests/machines/creation.test.ts -t "term limit" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-05 | 03 | 2 | EDUC-05 | unit | `npx vitest run tests/data/education.test.ts -t "university skills" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-06 | 03 | 2 | EDUC-06 | unit | `npx vitest run tests/data/education.test.ts -t "academy training" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-07 | 03 | 2 | EDUC-07 | unit | `npx vitest run tests/data/education.test.ts -t "graduation" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-08 | 03 | 2 | EDUC-08 | unit | `npx vitest run tests/data/education-events.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-09 | 03 | 2 | EDUC-09 | integration | `npx vitest run tests/machines/creation.test.ts -t "failed graduation" --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-03-10 | 03 | 2 | EDUC-10 | unit | `npx vitest run tests/data/education.test.ts -t "no commission" --reporter=verbose` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/data/background-skills.test.ts` — stubs for BGSK-01, BGSK-02
- [ ] `tests/data/education.test.ts` — stubs for EDUC-02, EDUC-03, EDUC-05, EDUC-06, EDUC-07, EDUC-10
- [ ] `tests/data/education-events.test.ts` — stubs for EDUC-08
- [ ] `tests/machines/creation.test.ts` — expand for EDUC-01, EDUC-04, EDUC-09
- [ ] `tests/components/characteristics.test.ts` — stubs for CHAR-01, CHAR-02 (React Testing Library)
- [ ] `tests/stores/character.test.ts` — expand for CHAR-04, BGSK-02
- [ ] Framework install: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop assignment UX | CHAR-02 | Visual interaction pattern | Roll characteristics, verify drag from pool to slots works, verify live DM preview on hover |
| Wizard step transitions | SC-5 | Visual animation | Navigate between steps, verify slide animation, verify progress bar states |
| Education card selection UI | EDUC-01 | Visual layout | Verify 3 cards display with correct info, verify selection interaction |
| Narrative event cards | EDUC-08 | Visual presentation | Trigger education event, verify narrative card renders with flavor text and choices |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
