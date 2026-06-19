# Requirements: StarMaker

**Defined:** 2026-03-19
**Core Value:** Faithful implementation of Mongoose Traveller 2E character creation rules with override mode and legitimacy verification

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FNDN-01**: App scaffolded with React 19 + TypeScript + Vite, building to static assets for GitHub Pages
- [x] **FNDN-02**: Dice engine using crypto.getRandomValues() produces correct distributions for 1D, 2D, 3D, D3, D66
- [x] **FNDN-03**: Every dice roll is recorded in an append-only roll log with roll ID, context, and results
- [x] **FNDN-04**: SHA-256 legitimacy hash computed from canonically serialized roll log (deterministic — same rolls = same hash)
- [x] **FNDN-05**: XState creation workflow state machine models the full creation lifecycle with nested states, guards, and transitions
- [x] **FNDN-06**: Zustand character data store holds all character state with Immer for immutable updates
- [x] **FNDN-07**: TypeScript type system covers all game concepts (characteristics, skills, careers, ranks, equipment)

### Characteristics

- [x] **CHAR-01**: User can roll 2D for each of the 6 characteristics (STR, DEX, END, INT, EDU, SOC)
- [x] **CHAR-02**: User can assign rolled values to characteristics in any order
- [x] **CHAR-03**: Characteristic DMs auto-calculated from the modifier table (0→-3, 1-2→-2, 3-5→-1, 6-8→0, 9-11→+1, 12-14→+2, 15+→+3)
- [x] **CHAR-04**: Maximum unaugmented characteristic score enforced at 15

### Background Skills

- [x] **BGSK-01**: User can select EDU DM+3 background skills (0 to 6) from the adolescence skill list
- [x] **BGSK-02**: Background skills are granted at level 0

### Pre-Career Education

- [x] **EDUC-01**: User can choose to attend University or Military Academy (Army/Marines/Navy)
- [x] **EDUC-02**: University entry roll (EDU 7+) with term-based DMs and SOC bonus calculated correctly
- [x] **EDUC-03**: Military Academy entry rolls (Army END 8+, Marines END 9+, Navy INT 9+) with term DMs
- [x] **EDUC-04**: Pre-career education available terms 1-3 only, with increasing DM penalties
- [x] **EDUC-05**: University skills selection (level 0 and level 1 from specified list) and EDU +1
- [x] **EDUC-06**: Military Academy basic training (all service skills of tied career at level 0)
- [x] **EDUC-07**: Graduation roll with honours possibility (11+), all graduation benefits applied correctly
- [x] **EDUC-08**: Pre-career education events table (2D, 12 entries) fully implemented
- [x] **EDUC-09**: Failed graduation handles correctly (no benefits, but skills earned during term retained)
- [x] **EDUC-10**: Academy graduation without honours but failed 2- still allows auto-entry but no commission

### Careers

- [x] **CRER-01**: All 12 careers implemented: Agent, Army, Citizen, Drifter, Entertainer, Marine, Merchant, Navy, Noble, Rogue, Scholar, Scout
- [x] **CRER-02**: Each career has 3 assignments with correct specialist skill tables
- [ ] **CRER-03**: Qualification rolls with DM-1 per previous career enforced
- [ ] **CRER-04**: Basic training: first career = all service skills at level 0; subsequent = pick one
- [ ] **CRER-05**: Citizen and Drifter basic training exception: use assignment skill tables, not service skills
- [ ] **CRER-06**: Survival rolls per assignment with mishap tables (6 entries each) on failure
- [ ] **CRER-07**: Natural 2 on survival is always a failure regardless of modifiers
- [x] **CRER-08**: Event tables (2D, 12 entries per career) fully implemented with all effects
- [ ] **CRER-09**: Life Events table (shared across careers) fully implemented
- [ ] **CRER-10**: Commission system for Army, Navy, Marines with SOC 9+ extended eligibility
- [ ] **CRER-11**: Commission DM-1 per term after first; events that grant advancement DMs apply to commission
- [ ] **CRER-12**: Cannot advance in the same term as gaining commission
- [x] **CRER-13**: Advancement rolls with forced-leave mechanic (roll ≤ terms served = must leave)
- [x] **CRER-14**: Natural 12 on advancement = forced to stay (no choice)
- [ ] **CRER-15**: Rank tables with bonus skills granted immediately upon reaching rank
- [x] **CRER-16**: Skills and training tables (Personal Development, Service Skills, Specialist, Officer, Advanced Education)
- [ ] **CRER-17**: Advanced Education and Officer tables restricted by EDU 8+ or rank requirement
- [ ] **CRER-18**: Skill level 4 cap during creation enforced
- [ ] **CRER-19**: Total skill levels ≤ 3 × (INT + EDU) enforced
- [ ] **CRER-20**: Draft table (1D → career assignment), draft limited to once per lifetime
- [ ] **CRER-21**: Failed qualification → choose Draft or Drifter
- [ ] **CRER-22**: Changing careers requires new qualification roll with cumulative DM penalty
- [x] **CRER-23**: Changing assignments varies by career type (same-career vs new-career rules)
- [x] **CRER-24**: Cannot return to a career in the term immediately after leaving it

### Aging

- [x] **AGNG-01**: Aging rolls triggered at age 34+ (after 4th term)
- [x] **AGNG-02**: Aging effects correctly reduce characteristics per the aging table
- [x] **AGNG-03**: Aging crisis rules applied when characteristic reaches 0

### Mustering Out

- [x] **MSTR-01**: Cash table rolls (max 3 rolls across entire lifetime, all careers combined)
- [x] **MSTR-02**: Benefits table rolls with rank-based bonus rolls (rank 1-2: +1, rank 3-4: +2, rank 5-6: +3 and DM+1)
- [x] **MSTR-03**: Pension calculation for 5+ terms of service
- [x] **MSTR-04**: Lost benefit roll for term ended by mishap (previous terms' benefits retained)
- [x] **MSTR-05**: Commission + enlisted rank combined for benefits if applicable

### Psionics

- [ ] **PSIN-01**: PSI characteristic determination (2D minus terms served)
- [ ] **PSIN-02**: Psionic training table with learning DMs (Telepathy +4, Clairvoyance +3, Telekinesis +2, Awareness +1, Teleportation +0)
- [ ] **PSIN-03**: DM-1 per previous talent acquisition attempt enforced
- [ ] **PSIN-04**: Telepathy auto-granted if chosen first
- [ ] **PSIN-05**: All 5 talents with powers recorded: Telepathy, Clairvoyance, Telekinesis, Awareness, Teleportation
- [ ] **PSIN-06**: PSI cost and reach for each power tracked on character sheet

### Equipment

- [ ] **EQUP-01**: Equipment catalog from Core Rulebook (weapons, armour, survival gear, electronics, medical, tools)
- [ ] **EQUP-02**: Equipment browsing with category filtering and TL requirements
- [ ] **EQUP-03**: Budget tracking against credits from mustering out
- [ ] **EQUP-04**: Equipment stats displayed (damage, range, protection, cost, TL, traits)

### Social

- [x] **SOCL-01**: Contacts, Allies, Rivals, Enemies tracked throughout creation with notes
- [x] **SOCL-02**: Noble titles derived from Social Standing (11=Knight, 12=Baron, 13=Marquis, 14=Count, 15=Duke)

### Skill Packages

- [ ] **SKPK-01**: Post-creation skill package selection to fill group gaps *(Phase 6 — requires multi-character roster)*

### Connections

- [ ] **CONN-01**: Connections rule support for group creation (linking characters via shared events) *(Phase 6)*
- [ ] **CONN-02**: Bonus skill grants from connections (max 2, each with different character, skill ≤ level 3) *(Phase 6)*

### Character Sheet & Export

- [ ] **SHEE-01**: Real-time character sheet display updating progressively during creation
- [ ] **SHEE-02**: Final character sheet showing all stats, skills, career history, equipment, contacts
- [ ] **SHEE-03**: Printable/PDF character sheet export
- [ ] **SHEE-04**: Legitimacy hash prominently displayed on character sheet
- [ ] **SHEE-05**: Clear visual indicator: "Legitimate" (all rolls as-rolled) vs "Modified" (overrides used)

### Override Mode

- [ ] **OVRD-01**: User can toggle override mode on/off at any point during creation
- [ ] **OVRD-02**: In override mode, user can reroll any dice result
- [ ] **OVRD-03**: In override mode, user can revert to any previous decision point
- [ ] **OVRD-04**: Override actions are tracked in roll log and change the legitimacy hash
- [ ] **OVRD-05**: Hash changes from "Legitimate" to "Modified" upon any override action

### Save & Load

- [ ] **SAVE-01**: Character state persisted to localStorage automatically
- [ ] **SAVE-02**: User can resume creation from where they left off after page reload
- [ ] **SAVE-03**: User can manage multiple saved characters

### Deployment

- [x] **DEPL-01**: App deployed to GitHub Pages as static site
- [x] **DEPL-02**: CI/CD pipeline builds and deploys on push to main

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

*(Connections — formerly CONN-01/CONN-02 — promoted to v1 Phase 6 on 2026-06-19.)*

### Polish

- **PLSH-01**: Career narrative timeline visualization (life story as illustrated timeline)
- **PLSH-02**: Inline contextual rules reference at each creation step
- **PLSH-03**: Character roster management with campaign organization

### Integration

- **INTG-01**: JSON export format for VTT compatibility
- **INTG-02**: Supplement data support (Central Supply Catalogue, High Guard)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vehicles/spacecraft construction | Not part of character creation |
| Space combat rules | Gameplay system, not creation |
| Trade rules | Gameplay system, not creation |
| World/universe creation | Separate subsystem |
| Central Supply Catalogue equipment | Supplement — Core Rulebook only for v1 |
| Traveller Companion alternate creation | Supplement — Core Rulebook RAW only for v1 |
| User accounts / cloud sync | Requires backend; GitHub Pages is static-only |
| Real-time multiplayer | Massive complexity for niche use case |
| 3D animated dice | Development cost vs value is terrible |
| AI-generated backstories | Scope creep, adds API dependency |
| Post-creation character editor | Undermines legitimacy hash system |
| Mobile-first design | Desktop-first is correct for data-heavy creation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Complete |
| FNDN-02 | Phase 1 | Complete |
| FNDN-03 | Phase 1 | Complete |
| FNDN-04 | Phase 1 | Complete |
| FNDN-05 | Phase 1 | Complete |
| FNDN-06 | Phase 1 | Complete |
| FNDN-07 | Phase 1 | Complete |
| CHAR-01 | Phase 2 | Complete |
| CHAR-02 | Phase 2 | Complete |
| CHAR-03 | Phase 2 | Complete |
| CHAR-04 | Phase 2 | Complete |
| BGSK-01 | Phase 2 | Complete |
| BGSK-02 | Phase 2 | Complete |
| EDUC-01 | Phase 2 | Complete |
| EDUC-02 | Phase 2 | Complete |
| EDUC-03 | Phase 2 | Complete |
| EDUC-04 | Phase 2 | Complete |
| EDUC-05 | Phase 2 | Complete |
| EDUC-06 | Phase 2 | Complete |
| EDUC-07 | Phase 2 | Complete |
| EDUC-08 | Phase 2 | Complete |
| EDUC-09 | Phase 2 | Complete |
| EDUC-10 | Phase 2 | Complete |
| CRER-01 | Phase 3 | Complete |
| CRER-02 | Phase 3 | Complete |
| CRER-03 | Phase 3 | Pending |
| CRER-04 | Phase 3 | Pending |
| CRER-05 | Phase 3 | Pending |
| CRER-06 | Phase 3 | Pending |
| CRER-07 | Phase 3 | Pending |
| CRER-08 | Phase 3 | Complete |
| CRER-09 | Phase 3 | Pending |
| CRER-10 | Phase 3 | Pending |
| CRER-11 | Phase 3 | Pending |
| CRER-12 | Phase 3 | Pending |
| CRER-13 | Phase 3 | Complete |
| CRER-14 | Phase 3 | Complete |
| CRER-15 | Phase 3 | Pending |
| CRER-16 | Phase 3 | Complete |
| CRER-17 | Phase 3 | Pending |
| CRER-18 | Phase 3 | Pending |
| CRER-19 | Phase 3 | Pending |
| CRER-20 | Phase 3 | Pending |
| CRER-21 | Phase 3 | Pending |
| CRER-22 | Phase 3 | Pending |
| CRER-23 | Phase 3 | Complete |
| CRER-24 | Phase 3 | Complete |
| AGNG-01 | Phase 3 | Complete |
| AGNG-02 | Phase 3 | Complete |
| AGNG-03 | Phase 3 | Complete |
| MSTR-01 | Phase 3 | Complete |
| MSTR-02 | Phase 3 | Complete |
| MSTR-03 | Phase 3 | Complete |
| MSTR-04 | Phase 3 | Complete |
| MSTR-05 | Phase 3 | Complete |
| SOCL-01 | Phase 3 | Complete |
| SOCL-02 | Phase 3 | Complete |
| PSIN-01 | Phase 4 | Complete |
| PSIN-02 | Phase 4 | Complete |
| PSIN-03 | Phase 4 | Complete |
| PSIN-04 | Phase 4 | Complete |
| PSIN-05 | Phase 4 | Complete |
| PSIN-06 | Phase 4 | Complete |
| EQUP-01 | Phase 4 | Complete |
| EQUP-02 | Phase 4 | Complete |
| EQUP-03 | Phase 4 | Complete |
| EQUP-04 | Phase 4 | Complete |
| SKPK-01 | Phase 6 | Pending |
| CONN-01 | Phase 6 | Pending |
| CONN-02 | Phase 6 | Pending |
| SHEE-01 | Phase 4 | Complete |
| SHEE-02 | Phase 4 | Complete |
| SHEE-03 | Phase 4 | Complete |
| SHEE-04 | Phase 4 | Complete |
| SHEE-05 | Phase 4 | Complete |
| OVRD-01 | Phase 5 | Pending |
| OVRD-02 | Phase 5 | Pending |
| OVRD-03 | Phase 5 | Pending |
| OVRD-04 | Phase 5 | Pending |
| OVRD-05 | Phase 5 | Pending |
| SAVE-01 | Phase 5 | Pending |
| SAVE-02 | Phase 5 | Pending |
| SAVE-03 | Phase 5 | Pending |
| DEPL-01 | Phase 1 | Complete |
| DEPL-02 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 77 total (CONN-01/02 promoted from v2 on 2026-06-19)
- Mapped to phases: 77
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
