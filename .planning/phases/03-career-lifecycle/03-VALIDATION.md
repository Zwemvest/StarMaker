---
phase: 03
slug: career-lifecycle
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-03
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | vite.config.ts (vitest inline config) |
| **Quick run command** | `npx vitest run --reporter=verbose 2>&1 \| tail -30` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose 2>&1 | tail -30`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Plan | Task | Automated Verify |
|------|------|-----------------|
| 03-01 | Task 1 (Types + Zod) | `npx vitest run tests/schemas/career.test.ts` |
| 03-01 | Task 2 (Engine) | `npx vitest run tests/engine/career.test.ts` |
| 03-02 | Task 1 (Aging) | `npx vitest run tests/engine/aging.test.ts` |
| 03-02 | Task 2 (Mustering + Life Events) | `npx vitest run tests/engine/mustering-out.test.ts tests/data/life-events.test.ts` |
| 03-03 | Task 1a (Careers JSON batch 1) | `node -e "..." structural check` |
| 03-03 | Task 1b (Careers JSON batch 2) | `node -e "..." structural check` |
| 03-03 | Task 2 (Index + tests) | `npx vitest run tests/data/careers.test.ts` |
| 03-04 | Task 1 (Store) | `npx vitest run tests/stores/character.test.ts` |
| 03-04 | Task 2 (XState) | `npx vitest run tests/machines/creation.test.ts` |
| 03-05 | Task 1-2 (Career selection UI) | `npx vitest run` (full suite, no regressions) |
| 03-06 | Task 1-2 (Term loop UI) | `npx vitest run` (full suite, no regressions) |
| 03-07 | Task 1-2 (Continue/Leave + Mustering UI) | `npx vitest run` (full suite, no regressions) |
| 03-08 | Task 1 (CharacterPanel) | `npx vitest run` |
| 03-08 | Task 2 (Golden-path) | `npx vitest run tests/engine/golden-path.test.ts` |
| 03-08 | Task 3 (Human verify) | Manual checkpoint |

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. Vitest, jsdom, and test utilities already installed from Phase 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-to-slot skill selection feel | CRER-06 | Visual/interaction quality | Test drag from tabbed skill table to slot, verify smooth behavior |
| Career grid visual layout | CRER-01 | Visual design | Verify 12 career cards render correctly with qualification info |
| Survival roll dramatic reveal | CRER-09 | Animation/tension UX | Verify Roll button, animation, pass/fail visual effects |
| Vertical timeline appearance | CRER-01 | Visual design | Verify terms stack, collapse, expand correctly |
| Aging crisis visual treatment | AGNG-03 | Visual drama | Verify characteristic-at-0 dramatic display |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
