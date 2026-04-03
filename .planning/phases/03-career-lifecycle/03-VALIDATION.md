---
phase: 03
slug: career-lifecycle
status: draft
nyquist_compliant: false
wave_0_complete: false
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

*Populated by planner after plans are created.*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
