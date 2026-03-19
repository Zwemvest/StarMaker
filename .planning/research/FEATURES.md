# Features Research: StarMaker

**Researched:** 2026-03-19
**Domain:** TTRPG Character Builder (Mongoose Traveller 2E)
**Confidence:** HIGH
**Competitors analyzed:** D&D Beyond, Pathbuilder 2e, existing Traveller generators (TravellerTools, Traveller Character Generator)

## Table Stakes Features

These are features users expect in any TTRPG character builder. Missing any of these and users will leave.

### TS-01: Step-by-Step Creation Wizard
- **What:** Guided walkthrough of the creation process in order
- **Complexity:** Medium
- **Why table stakes:** Traveller creation is deeply sequential — users need guardrails
- **Dependencies:** State machine, UI framework

### TS-02: Dice Rolling with Visual Feedback
- **What:** Click to roll, see dice results, see modifiers applied
- **Complexity:** Low
- **Why table stakes:** Dice rolling IS the core interaction; must feel tactile and clear
- **Dependencies:** Dice engine

### TS-03: All 12 Careers Fully Implemented
- **What:** Agent, Army, Citizen, Drifter, Entertainer, Marine, Merchant, Navy, Noble, Rogue, Scholar, Scout — complete with all assignments, skill tables, events, mishaps
- **Complexity:** HIGH (largest data entry effort)
- **Why table stakes:** Partial career support makes the tool useless for actual play
- **Dependencies:** Career data encoding, career resolution engine

### TS-04: Characteristic Generation & Modifiers
- **What:** Roll 2D for 6 characteristics, auto-calculate DMs from the modifier table
- **Complexity:** Low
- **Why table stakes:** First step of creation; if this is wrong nothing else matters
- **Dependencies:** Dice engine, types

### TS-05: Skill Management
- **What:** Track all skills with levels, enforce limits (max 4, total ≤ 3×(INT+EDU)), handle background skills
- **Complexity:** Medium
- **Why table stakes:** Skills are the most important aspect of a Traveller
- **Dependencies:** Characteristic data, skill definitions

### TS-06: Event & Mishap Tables
- **What:** Full event tables (2D, career-specific) and mishap tables with narrative text
- **Complexity:** Medium (data entry heavy)
- **Why table stakes:** Events ARE the story of a Traveller's life; skipping them removes the fun
- **Dependencies:** Career data, dice engine

### TS-07: Aging System
- **What:** Aging rolls at 34+, characteristic reductions, aging crisis rules
- **Complexity:** Low-Medium
- **Why table stakes:** Aging is a core tension mechanic — "one more term?"
- **Dependencies:** Characteristic tracking, term counter

### TS-08: Mustering Out (Cash + Benefits)
- **What:** Cash table (max 3 rolls lifetime), benefits table, rank-based bonus rolls, pension calculation
- **Complexity:** Medium
- **Why table stakes:** How Travellers get their starting equipment and money
- **Dependencies:** Career/rank tracking, benefits resolution

### TS-09: Character Sheet Display
- **What:** Real-time character sheet that updates as creation progresses, showing all stats, skills, career history, equipment, contacts
- **Complexity:** Medium
- **Why table stakes:** Users need to see what they're building at every step
- **Dependencies:** Character data store, UI components

### TS-10: Export/Print Character Sheet
- **What:** Generate a printable character sheet (PDF or print-friendly HTML)
- **Complexity:** Medium
- **Why table stakes:** The whole point is to create a character for play at a table
- **Dependencies:** Character sheet renderer, PDF library

### TS-11: Save/Load Characters
- **What:** Save character to localStorage, load previously saved characters
- **Complexity:** Low
- **Why table stakes:** Users will close the browser mid-creation; losing progress is unacceptable
- **Dependencies:** Serialization, localStorage

### TS-12: Rule Enforcement
- **What:** Enforce creation rules (qualification DMs, skill limits, draft rules, career change penalties)
- **Complexity:** High
- **Why table stakes:** The tool's value IS correct rule application — errors undermine trust
- **Dependencies:** Domain logic, state machine guards

### TS-13: Commission & Advancement
- **What:** Military commission system, advancement rolls, forced-leave mechanics, natural 12 lock-in
- **Complexity:** Medium
- **Why table stakes:** Core career progression mechanic for 3 of 12 careers
- **Dependencies:** Career engine, military career data

### TS-14: Pre-Career Education
- **What:** University and Military Academy options with entry, skills, events, graduation
- **Complexity:** Medium
- **Why table stakes:** Popular character creation path, commonly used
- **Dependencies:** Education data, state machine branching

## Differentiators

Features that set StarMaker apart from existing Traveller generators.

### D-01: Override Mode + Legitimacy Hash ⭐
- **What:** Toggle that allows reverting/rerolling any dice result. Cryptographic hash on character sheet shows whether character was generated legitimately (all rolls as-rolled) or modified. GMs can verify at a glance.
- **Complexity:** HIGH
- **Why differentiating:** No existing Traveller generator has this. Solves the trust problem ("did you actually roll those stats?") while still allowing experimentation.
- **Dependencies:** Roll log, hash system, must be designed before any dice code

### D-02: Full Undo/History System
- **What:** Snapshot at every decision point. Go back to any previous state. In override mode, branch history (not just linear undo).
- **Complexity:** HIGH
- **Why differentiating:** Most generators are forward-only. Traveller creation has high-stakes irreversible moments (survival rolls, career ejection) that players want to explore.
- **Dependencies:** Snapshot system, state management

### D-03: Career Narrative Timeline
- **What:** Visual timeline showing the character's life story — each term as a chapter with events, skills gained, career changes, aging effects
- **Complexity:** Medium
- **Why differentiating:** Turns dry mechanics into an engaging story; existing tools just show final stats
- **Dependencies:** Career history data, UI component

### D-04: Visual Character Sheet
- **What:** Polished, styled character sheet that looks like an official Traveller sheet (not just a data dump)
- **Complexity:** Medium
- **Why differentiating:** Most generators produce ugly plaintext or basic HTML
- **Dependencies:** Design work, PDF renderer

### D-05: Psionics Support
- **What:** Full PSI testing, institute training, all 5 talents with powers, PSI cost tracking
- **Complexity:** Medium
- **Why differentiating:** Often omitted in character generators due to complexity and rarity
- **Dependencies:** Psionics data, additional creation branch

### D-06: Connections Rule Support
- **What:** Support for linking characters together during group creation (shared events, bonus skills)
- **Complexity:** Medium
- **Why differentiating:** Core Traveller feature that's almost never implemented digitally
- **Dependencies:** Multi-character awareness (even if single-user, managing a roster)

### D-07: Equipment Catalog with Filtering
- **What:** Full Core Rulebook equipment with search, filter by category/TL/cost, budget tracking
- **Complexity:** Medium
- **Why differentiating:** Most generators skip equipment or have minimal lists
- **Dependencies:** Equipment data encoding, UI components

### D-08: Inline Rules Reference
- **What:** Contextual rules text shown at each creation step — what this roll means, what the options are
- **Complexity:** Low-Medium
- **Why differentiating:** Reduces need to have the book open alongside the tool
- **Dependencies:** Rules text data (paraphrased, not copied for copyright)

### D-09: Character Roster
- **What:** Manage multiple characters, compare them, organize by campaign
- **Complexity:** Low
- **Why differentiating:** Convenience feature for GMs creating NPCs or players with multiple characters
- **Dependencies:** Save/load system, localStorage management

## Anti-Features

Things to deliberately NOT build. Including reasoning to prevent scope creep.

### AF-01: 3D Animated Dice
- **Why not:** Development cost vs value is terrible. Dice animation is eye candy that slows down the creation process. Traveller creation involves dozens of rolls — fast feedback beats flashy animation.

### AF-02: User Accounts / Cloud Sync
- **Why not:** Requires a backend. GitHub Pages is static-only. localStorage is sufficient for v1. Cloud sync is a v2+ feature requiring infrastructure.

### AF-03: Real-Time Multiplayer Creation
- **Why not:** Massive complexity for a niche use case. The connections rule can be handled by managing multiple characters locally, not via WebSocket collaboration.

### AF-04: AI-Generated Backstories
- **Why not:** Scope creep. The events and career narrative already tell a story. AI generation adds API dependency and cost.

### AF-05: Supplement/Expansion Support
- **Why not for v1:** Core Rulebook alone has ~1,200 data entries. Adding Central Supply Catalogue, High Guard, Traveller Companion etc. multiplies data work enormously. Architecture should allow it (data-driven), but v1 scope is Core Rulebook only.

### AF-06: Post-Creation Character Editor
- **Why not:** StarMaker is a character CREATOR, not a character MANAGER. Editing stats after creation undermines the legitimacy hash system and blurs the tool's purpose.

### AF-07: Mobile-First Design
- **Why not:** Character creation involves reading lots of text, making complex decisions, and viewing data tables. Desktop-first is the right call. Responsive is nice-to-have, mobile-optimized is not worth the effort.

### AF-08: VTT Integration (Roll20, Foundry)
- **Why not for v1:** Each VTT has its own character sheet format. Export to generic formats (PDF, JSON) is sufficient. VTT-specific integration is a future milestone.

## Dependency Graph

```
Dice Engine ─────────────────────────┐
     │                                │
     ▼                                ▼
Characteristics ──► Background ──► Pre-Career Education
                       Skills              │
                                           ▼
                                    Career Engine ◄── Career Data
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                          Events    Commission   Advancement
                              │      & Ranks         │
                              ▼          │           ▼
                           Aging ◄───────┘     Skills/Training
                              │
                              ▼
                        Mustering Out
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                Equipment  Psionics  Skill Package
                    │         │         │
                    └─────────┼─────────┘
                              ▼
                       Character Sheet
                              │
                        ┌─────┼─────┐
                        ▼     ▼     ▼
                      PDF   Print  Save
```

## MVP Definition

**Minimum viable product** = TS-01 through TS-14 (all table stakes) + D-01 (override/hash — the core differentiator).

Everything else can ship incrementally after MVP.

## Prioritization Matrix

| Priority | Features | Rationale |
|----------|----------|-----------|
| P0 - Must Ship | TS-01 to TS-14, D-01 | Core creation flow + key differentiator |
| P1 - Should Ship | D-02, D-03, D-05, D-07 | High value, reasonable effort |
| P2 - Nice to Have | D-04, D-06, D-08, D-09 | Polish and convenience |
| P3 - Future | AF-05 (supplements), AF-08 (VTT) | Clear v2+ candidates |

---
*Researched: 2026-03-19*
