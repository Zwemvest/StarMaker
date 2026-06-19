---
phase: 03-career-lifecycle
plan: 12
subsystem: career-lifecycle
tags: [career, persistence, xstate, complete-summary, uat-gap-6, uat-gap-7, tdd]

# Dependency graph
requires:
  - phase: 03-career-lifecycle
    provides: creation machine, useCreationMachine replay, CareerStep orchestrator, MusteringOutStep
provides:
  - Persisted creationPhase marker ('active' | 'complete') in the character store
  - RESTORE_COMPLETE machine transition (idle -> complete) for terminal replay
  - deriveReplayEvents short-circuit to the complete state when creationPhase is 'complete'
  - CompleteSummary terminal view (characteristics, skills, career history, credits/pension/benefits, contacts, legitimacy hash)
  - WizardShell routes to CompleteSummary from BOTH its own machine state AND the persisted creationPhase flag
  - CareerStep diagnostic fallback replaced with a DEV-only warn + null render
affects: [04-post-career, 05-persistence, 03-HUMAN-UAT retest]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Persisted phase marker drives terminal replay (store flag -> RESTORE_COMPLETE)"
    - "Shell consults the store flag, not just its own actor, because shell and step run separate machine actors"

key-files:
  created:
    - src/components/wizard/CompleteSummary.tsx
    - tests/hooks/useCreationMachine.test.ts
    - tests/components/wizard.test.ts
  modified:
    - src/stores/character.ts
    - src/machines/creation.ts
    - src/hooks/useCreationMachine.ts
    - src/components/career/CareerStep.tsx
    - src/components/wizard/WizardShell.tsx
    - tests/machines/creation.test.ts
    - vite.config.ts
---

# Plan 03-12 Summary — XState persistence + terminal complete view

Closes UAT gaps 6 and 7.

## What changed
- **Store**: added `creationPhase: 'active' | 'complete'` (persisted to sessionStorage via the existing persist middleware) plus a `setCreationPhase` action; `resetCharacter` returns it to `'active'`.
- **Machine**: added the `RESTORE_COMPLETE` event with an `idle -> #creation.complete` transition.
- **Replay**: `deriveReplayEvents` now checks `creationPhase` first and returns `[{type: 'RESTORE_COMPLETE'}]` to fast-forward straight to the terminal state on refresh.
- **CareerStep**: wraps the `send` passed to `MusteringOutStep` so `MUSTERING_COMPLETE` also calls `setCreationPhase('complete')`. The dev-diagnostic fallback (`Career state: unknown`) is replaced by a DEV-only `console.warn` + `return null`.
- **CompleteSummary**: new read-only terminal view.
- **WizardShell**: routes `complete` to `CompleteSummary`; removed the dead `musteringOut` branch.

## UAT-discovered follow-up (same plan scope)
Live UAT exposed that WizardShell and CareerStep each instantiate their **own** machine actor (`useCreationMachine` memoizes a fresh actor per component). On muster-out, only CareerStep's actor reached `complete`; WizardShell's actor stayed on `career` and rendered a blank step until a refresh re-derived the terminal state. Fixed by having WizardShell also derive `isComplete` from the persisted `creationPhase` flag, so the summary appears immediately in the same session. Regression test added.

## Tooling
`vite.config.ts` now excludes `**/.claude/**` from vitest — orphaned GSD agent worktrees held stale source/test copies that inflated the run ~7x (10532 → true 796).

## Verification
- `npm run test`: 796 passing. `npm run build`: clean.
- Live browser UAT: completing muster-out renders CompleteSummary immediately; refresh keeps the user on the summary (no career grid); the `Career state: unknown` string never appears.
