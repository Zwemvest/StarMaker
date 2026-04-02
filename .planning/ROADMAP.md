# Roadmap: StarMaker

## Overview

StarMaker delivers a faithful Mongoose Traveller 2E character builder as a static site on GitHub Pages. The build progresses from infrastructure (dice engine, hash system, state architecture) through the sequential creation flow (characteristics, background, education, careers, post-career) to the defining differentiator (override mode with legitimacy verification). Each phase delivers a verifiable, end-to-end capability that builds on the previous.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffold, dice engine, roll log, hash system, state architecture, and deployment pipeline
- [ ] **Phase 2: Pre-Career Creation** - Characteristics, background skills, and pre-career education with working wizard UI
- [ ] **Phase 3: Career Lifecycle** - All 12 careers with full term resolution, aging, mustering out, and social tracking
- [ ] **Phase 4: Post-Career and Character Sheet** - Psionics, equipment catalog, skill packages, and complete character sheet with export
- [ ] **Phase 5: Override Mode and Persistence** - Override/reroll system, legitimacy hash display, save/load, and multi-character management

## Phase Details

### Phase 1: Foundation
**Goal**: Infrastructure exists for building a dice-driven, state-machine-orchestrated character creation app with legitimacy verification from day one
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03, FNDN-04, FNDN-05, FNDN-06, FNDN-07, DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` launches the app in a browser with a working React + TypeScript + Vite setup
  2. The dice engine produces correct distributions for 1D, 2D, 3D, D3, and D66 rolls using crypto.getRandomValues()
  3. Every dice roll is automatically recorded in an append-only roll log and a SHA-256 hash is computed from the canonical log
  4. The XState creation workflow state machine models at least the top-level creation lifecycle (characteristics through mustering out) with placeholder nested states
  5. Pushing to main triggers a CI/CD pipeline that builds and deploys the app to GitHub Pages
**Plans:** 2/4 plans executed

Plans:
- [x] 01-01-PLAN.md — Project scaffold, dependencies, TypeScript types and Zod schemas
- [ ] 01-02-PLAN.md — Dice engine, roll log, and SHA-256 legitimacy hash (TDD)
- [ ] 01-03-PLAN.md — XState creation machine and Zustand character store (TDD)
- [ ] 01-04-PLAN.md — GitHub Actions CI/CD pipeline and GitHub Pages deployment

### Phase 2: Pre-Career Creation
**Goal**: Users can generate characteristics, select background skills, and optionally attend University or Military Academy — the complete pre-career creation flow with real UI
**Depends on**: Phase 1
**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04, BGSK-01, BGSK-02, EDUC-01, EDUC-02, EDUC-03, EDUC-04, EDUC-05, EDUC-06, EDUC-07, EDUC-08, EDUC-09, EDUC-10
**Success Criteria** (what must be TRUE):
  1. User can roll 2D for six characteristics, assign them to STR/DEX/END/INT/EDU/SOC in any order, and see correct modifier DMs auto-calculated
  2. User can select the correct number of background skills (EDU DM+3) from the adolescence skill list, granted at level 0
  3. User can choose to attend University or Military Academy with correct entry rolls, skill grants, graduation/honours rolls, and all education events
  4. Failed education entry or graduation is handled correctly (skills retained, no benefits, proper state transitions)
  5. The wizard enforces creation sequence — user cannot skip ahead or access steps out of order
**Plans:** 5/8 plans executed

Plans:
- [x] 02-01-PLAN.md — Wizard shell, shared DnD components, UI primitives, and core hooks
- [x] 02-02-PLAN.md — Game data layer (background skills, education paths, events) and education engine
- [x] 02-03-PLAN.md — Characteristics step with Roll All and drag-and-drop assignment
- [x] 02-04-PLAN.md — Background skills step with drag-from-pool skill picker
- [x] 02-05-PLAN.md — Education step with card selection, entry rolls, events, and graduation
- [ ] 02-06-PLAN.md — Fix drag offset and add session persistence (gap closure)
- [ ] 02-07-PLAN.md — Confirmation dialogs with irreversibility warnings (gap closure)
- [x] 02-08-PLAN.md — Education entry roll UX, event choices, roll log labels, relevance tooltips (gap closure)

### Phase 3: Career Lifecycle
**Goal**: Users can pursue any of the 12 careers through multiple terms with full rules enforcement — qualification, basic training, survival, events, commission, advancement, rank skills, aging, and mustering out
**Depends on**: Phase 2
**Requirements**: CRER-01, CRER-02, CRER-03, CRER-04, CRER-05, CRER-06, CRER-07, CRER-08, CRER-09, CRER-10, CRER-11, CRER-12, CRER-13, CRER-14, CRER-15, CRER-16, CRER-17, CRER-18, CRER-19, CRER-20, CRER-21, CRER-22, CRER-23, CRER-24, AGNG-01, AGNG-02, AGNG-03, MSTR-01, MSTR-02, MSTR-03, MSTR-04, MSTR-05, SOCL-01, SOCL-02
**Success Criteria** (what must be TRUE):
  1. User can enter any of the 12 careers, choose from 3 assignments each, and receive correct basic training (including Citizen/Drifter exception)
  2. Each career term resolves the full sequence: survival roll (with mishap on failure, natural-2 always fails), event table, commission (military), advancement (with forced-leave and natural-12 lock-in), and skill selection from correct tables
  3. Career transitions enforce all rules: DM-1 per previous career on qualification, draft-once-per-lifetime, failed-qualification routes to Draft or Drifter, no return to career in immediately following term
  4. After completing all career terms, user receives correct mustering out benefits (cash table max 3 rolls, benefit table with rank bonuses, pension for 5+ terms, lost benefit on mishap term)
  5. Aging effects trigger at 34+ with correct characteristic reductions and aging crisis at 0; skill limits (level 4 cap, total 3x(INT+EDU)) are enforced throughout; contacts/allies/rivals/enemies and noble titles are tracked
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Post-Career and Character Sheet
**Goal**: Users can test for psionics, purchase equipment, select skill packages, and view/export a complete character sheet
**Depends on**: Phase 3
**Requirements**: PSIN-01, PSIN-02, PSIN-03, PSIN-04, PSIN-05, PSIN-06, EQUP-01, EQUP-02, EQUP-03, EQUP-04, SKPK-01, SHEE-01, SHEE-02, SHEE-03, SHEE-04, SHEE-05
**Success Criteria** (what must be TRUE):
  1. User can test for PSI (2D minus terms served), attempt to learn all 5 talents with correct DMs and cumulative -1 penalty, and Telepathy is auto-granted if chosen first
  2. User can browse the Core Rulebook equipment catalog with category filtering, see stats (damage, range, protection, cost, TL, traits), and purchase items against their mustering-out credits
  3. User can select a post-creation skill package to fill group gaps
  4. A real-time character sheet updates progressively during creation, and a final sheet shows all stats, skills, career history, equipment, and contacts
  5. User can export/print the character sheet as PDF with the legitimacy hash prominently displayed and a clear Legitimate vs Modified indicator
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Override Mode and Persistence
**Goal**: Users can experiment freely with override mode while the legitimacy system tracks integrity, and characters persist across sessions
**Depends on**: Phase 4
**Requirements**: OVRD-01, OVRD-02, OVRD-03, OVRD-04, OVRD-05, SAVE-01, SAVE-02, SAVE-03
**Success Criteria** (what must be TRUE):
  1. User can toggle override mode on/off at any point and reroll any dice result or revert to any previous decision point
  2. Override actions are recorded in the roll log and the legitimacy hash changes from Legitimate to Modified upon any override
  3. Character state automatically saves to localStorage and user can resume creation after page reload from exactly where they left off
  4. User can manage multiple saved characters (create, switch between, delete)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/4 | In Progress|  |
| 2. Pre-Career Creation | 5/8 | In Progress|  |
| 3. Career Lifecycle | 0/? | Not started | - |
| 4. Post-Career and Character Sheet | 0/? | Not started | - |
| 5. Override Mode and Persistence | 0/? | Not started | - |
