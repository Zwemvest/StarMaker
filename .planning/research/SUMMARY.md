# Project Research Summary

**Project:** StarMaker — Mongoose Traveller 2E Character Builder
**Domain:** Client-side TTRPG character builder (data-heavy, sequential wizard workflow, static hosting)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

StarMaker is a fully client-side SPA that guides users through Mongoose Traveller 2E's notoriously complex character creation process. Experts in this domain build character builders as stepped wizards driven by state machines, not URL-based routers — the creation flow is too conditional and nested (optional education, career loops, forced exits, forced stays) to model with simple boolean flags or URL navigation. The recommended approach is React 19 + TypeScript + XState 5 for the workflow machine, Zustand for character data, and Vite for static builds deployed to GitHub Pages. The architecture is cleanly separated: XState owns "where are you in creation," Zustand owns "what does the character look like," and pure functions in an `engine/` layer own all game logic.

The two features that define this project's identity are the **all-12-careers implementation** (the largest single effort — ~1,200 structured data entries) and the **override/legitimacy hash system** (the key differentiator — no existing Traveller generator has this). Everything else flows from or depends on these two. The hash system must be designed before any dice code is written; the career data schema must be locked in before career logic is built. Getting the sequence wrong means rewriting foundational pieces.

The primary risks are data transcription errors (the Core Rulebook has hundreds of interrelated table entries that are easy to misread), state machine complexity if override/undo is bolted on later rather than designed from the start, and the ~13 non-obvious rules edge cases in the Traveller ruleset that most generators get wrong. All three risks are mitigated by the same strategy: type-safe data schemas, test suites built alongside each phase, and a roll-log-first design where the hash and undo systems are first-class citizens from day one.

## Key Findings

### Recommended Stack

The stack is straightforward for a modern React SPA. React 19 brings the compiler (eliminating manual memoization), TypeScript 5.9 provides compile-time safety across a complex data model, and Vite 8 handles builds with zero configuration friction. The non-obvious pick is XState 5 for workflow orchestration — this is a deliberate, justified choice over custom state machines or React Router. The Traveller creation workflow has nested sub-states, guards, conditional branches, forced transitions, and loops; XState models these explicitly and provides a visual inspector. Without it, the codebase accumulates `if/else` chains and `useState` flags that make undo and override mode impossible to implement correctly.

For state, the Zustand + Immer combination handles character data cleanly (deeply nested updates like `careers[2].skills[3].level` are readable with Immer's `produce()`). Zod validates runtime data and generates TypeScript types, ensuring career tables and user inputs stay within legal bounds. PDF export uses `@react-pdf/renderer` over jsPDF because it's declarative (JSX-based layout) rather than imperative (x/y coordinate calls). The Web Crypto API handles SHA-256 hashing with no third-party library needed.

**Core technologies:**
- React 19.2.4: UI framework — component model maps directly to wizard steps
- TypeScript 5.9.3: Type safety — non-negotiable for 1,200+ interrelated data entries
- Vite 8.0.1: Build tool — instant HMR, trivial static builds for GitHub Pages
- Tailwind CSS 4.2.2: Styling — rapid iteration for form/table-heavy UI, CSS-native config in v4
- XState 5.28.0: Workflow FSM — the correct tool for nested, conditional, loop-based creation flow
- Zustand 5.0.12 + Immer 11.1.4: Character data store — lightweight, TypeScript-native, persist middleware built in
- Zod 4.3.6: Runtime validation — validates career data on startup, enforces override mode bounds
- @react-pdf/renderer 4.3.2: PDF export — declarative React-based PDF layout
- Vitest 4.1.0: Testing — native Vite integration, essential for validating 1,200 data entries

### Expected Features

All 14 table stakes features must ship in v1. There is no viable partial career implementation — a tool that covers 8 of 12 careers is useless for actual play. The override/legitimacy hash (D-01) is elevated to MVP status because it is both the key differentiator and the system that must be designed first — every other feature depends on the roll log it creates.

**Must have (table stakes + key differentiator):**
- TS-01 Step-by-step creation wizard — Traveller creation is sequential; users need guardrails
- TS-02 Dice rolling with visual feedback — core interaction, must feel tactile
- TS-03 All 12 careers fully implemented — partial support = useless tool
- TS-04 Characteristic generation — first step; wrong here, everything is wrong
- TS-05 Skill management with limits — skills are the core of a Traveller character
- TS-06 Event and mishap tables — events are the story; skipping them removes the fun
- TS-07 Aging system — core tension mechanic ("one more term?")
- TS-08 Mustering out (cash + benefits) — how characters get starting equipment and money
- TS-09 Real-time character sheet display — users need to see what they're building
- TS-10 Export/print character sheet — the whole point is a character for table play
- TS-11 Save/load characters — losing mid-creation progress is unacceptable
- TS-12 Rule enforcement — the tool's value IS correct rule application
- TS-13 Commission and advancement — core mechanic for military careers
- TS-14 Pre-career education — popular creation path, commonly used
- D-01 Override mode + legitimacy hash — the defining differentiator; must be designed first

**Should have (competitive, ship post-MVP):**
- D-02 Full undo/history system — branching history for high-stakes decisions
- D-03 Career narrative timeline — turns mechanics into an engaging life story
- D-05 Psionics support — often omitted, meaningful differentiator
- D-07 Equipment catalog with filtering — most generators skip equipment

**Defer (v2+):**
- D-04 Polished visual character sheet styling — nice but not functional bloat
- D-06 Connections rule support — multi-character, complex
- D-08 Inline rules reference — useful but not blocking
- D-09 Character roster management — convenience feature, not core
- Supplement/expansion support (Central Supply Catalogue, High Guard, etc.)
- VTT integration (Roll20, Foundry)
- User accounts / cloud sync (requires backend, GitHub Pages is static)

### Architecture Approach

StarMaker uses a strict 4-layer architecture: UI (React components) → State (XState workflow + Zustand data) → Domain (pure functions in `engine/`) → Data (static TypeScript constants in `data/`). The critical boundary is that game logic never lives in React components — components call domain functions via state actions, domain functions are stateless and independently testable. The roll log is append-only by design; override mode marks rolls as overridden rather than deleting them, preserving the ability to recompute the hash. The critical path through the architecture is: TypeScript types → Dice engine + roll log format → Career data schema → XState machine skeleton → Career resolution logic → UI.

**Major components:**
1. Creation Workflow State Machine (XState) — models the full FSM from characteristics through mustering out, with nested sub-states for career terms, guards for rule enforcement, and history states for undo
2. Character Data Store (Zustand + Immer) — holds all character data (characteristics, skills, career history, benefits, equipment, contacts, PSI), persisted to localStorage
3. Dice Engine — pure functions using `crypto.getRandomValues()`, every roll logged to the append-only roll log
4. Roll Log and Hash Accumulator — SHA-256 of canonically serialized roll sequence, two-state display (Legitimate/Modified)
5. Career Data Engine — data-driven resolution against typed career definition objects (~1,200 entries across 12 careers)
6. Equipment Catalog — filter/search, budget tracking against mustered-out credits
7. Character Sheet Renderer — real-time display + PDF export via @react-pdf/renderer
8. Undo/History System — snapshot-based with branching support for override mode

### Critical Pitfalls

1. **Data transcription errors (CRITICAL)** — 1,200 structured entries across 12 careers; a misread modifier or wrong roll target breaks all downstream character builds. Prevention: TypeScript schema enforcing exact table shapes, automated validation at app startup, test suite with known "golden path" characters from the book, peer review against the PDF.

2. **State machine / undo complexity (CRITICAL)** — The workflow has loops, branches, forced exits, and forced stays. Bolting on undo or override mode after building a naive step-based approach requires rewriting everything. Prevention: Event-sourcing from day one — character state is derived from a sequence of logged events; undo removes events; override replaces an event. Design the roll log format before writing a single dice call.

3. **Traveller rules edge cases (HIGH)** — ~13 non-obvious rules that are real and commonly implemented wrong (e.g., Citizen/Drifter basic training exception, skill level 4 cap, total skill limit, commission+advancement interaction, draft-once-per-lifetime). Prevention: Encode every edge case as a specific test case before implementing; handle each as a guard in the state machine, not UI-level validation.

4. **Hash system design flaws (HIGH)** — Non-deterministic serialization (JSON.stringify doesn't guarantee key order), including timestamps in the hash input, hash too long for display, no way for users to independently verify. Prevention: Canonical serialization of roll ID + context + results only (no timestamps), truncate to 8 chars for display with full hash on hover, include a verification page where users can paste roll logs.

5. **UX overwhelm (MEDIUM)** — A term alone has 6-8 sequential interactions; 3-5 terms means 30-50 individual interactions. If the wizard shows multiple decisions at once, users bounce. Prevention: One decision at a time with full context, progressive disclosure, narrative framing over clinical labels, smart defaults.

## Implications for Roadmap

Based on combined research, six phases are recommended. The dependency chain is strict: later phases cannot begin without earlier foundations.

### Phase 1: Foundation
**Rationale:** The hash system and roll log format must be designed before any dice code; types must exist before data; the state architecture must be correct before any UI is built. Mistakes here require full rewrites downstream.
**Delivers:** Project scaffolding, TypeScript type system, dice engine with roll log, SHA-256 hash system, Zustand store structure, XState machine skeleton, Zod schemas, CI/CD to GitHub Pages
**Addresses:** TS-01 (wizard scaffold), TS-02 (dice engine), TS-04 (characteristic generation foundation)
**Avoids:** P2 (state machine complexity), P4 (hash system design flaws) — both are foundation-phase pitfalls that must be solved here

### Phase 2: Core Creation Flow
**Rationale:** Characteristics and background skills are the entry point; the XState machine must handle the pre-career path before career loops can be added.
**Delivers:** Full characteristic generation (roll 2D × 6, modifiers), background skill selection, pre-career education (university + military academy), working wizard for the pre-career segment
**Addresses:** TS-04, TS-05 (partial), TS-14
**Uses:** XState guards for education entry rolls, Zustand for characteristic storage, Zod validation for input bounds
**Implements:** Creation Workflow State Machine (pre-career states)

### Phase 3: Career Data Encoding
**Rationale:** Career data is the largest single work unit and the foundation for all career logic. It cannot be interleaved with logic development — the schema must be validated and tested before the engine uses it.
**Delivers:** All 12 careers encoded as typed TypeScript constants — qualification, survival, advancement, commission, ranks, all skill tables, events, mishaps, cash, and benefits tables for every career and assignment
**Addresses:** TS-03 (all 12 careers), TS-06 (event/mishap tables), TS-08 (mustering out data)
**Avoids:** P1 (data transcription errors) — this phase IS the pitfall; comprehensive test suite required alongside encoding
**Note:** This phase needs `/gsd:research-phase` if any career data is ambiguous in the PDF; page number citations in code comments are mandatory

### Phase 4: Career Engine and Term Resolution
**Rationale:** With validated data and a working state machine skeleton, the career resolution logic can be implemented and tested against known outcomes.
**Delivers:** Full career term loop in XState, career resolution engine (qualification → basic training → survival → events → commission → advancement → skills → aging → continue/leave), mustering out, all 13 rules edge cases enforced as guards
**Addresses:** TS-03, TS-05, TS-06, TS-07, TS-08, TS-12, TS-13
**Avoids:** P3 (rules edge cases) — encode every edge case from the pitfalls checklist as a test before implementing
**Implements:** Career Data Engine, XState career-term sub-machine

### Phase 5: Override Mode, Undo, and Character Sheet
**Rationale:** Override mode requires the roll log and snapshot system to already work correctly; building it on top of a working engine is far safer than designing it upfront with unknown constraints.
**Delivers:** Override mode UI with reroll/revert, legitimacy hash display (Legitimate/Modified states), verification page, full undo/history system with branching, real-time character sheet display, save/load to localStorage
**Addresses:** D-01 (override + hash), D-02 (undo/history), TS-09 (character sheet), TS-11 (save/load)
**Avoids:** P4 (hash display and verification UX) — canonical serialization and truncation decisions made here

### Phase 6: Equipment, Export, and Polish
**Rationale:** Equipment and PDF export depend on a complete character state; polish and narrative features require a working end-to-end flow to build on.
**Delivers:** Equipment catalog with filtering and budget tracking, PDF export via @react-pdf/renderer, browser print support, career narrative timeline, psionics support, GitHub Pages deployment with CI/CD, UX polish (progress indicators, narrative framing, smart defaults)
**Addresses:** TS-10 (export/print), D-03 (narrative timeline), D-05 (psionics), D-07 (equipment catalog)
**Avoids:** P6 (UX overwhelm) — narrative framing and one-decision-at-a-time UX applied throughout

### Phase Ordering Rationale

- Phase 1 before everything: the roll log format, type system, and state architecture are load-bearing; every subsequent phase depends on them being correct
- Phase 3 (data) before Phase 4 (engine): you cannot build a validated engine against unvalidated data; data errors discovered after engine work cost double the effort
- Phase 5 (override/undo) after Phase 4 (engine): override mode requires understanding the exact shape of the career flow; designing it before the engine is speculation
- Phase 6 last: export and polish are additive; they don't unblock other work

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Career Data Encoding):** Ambiguous rulebook interpretations are almost certain across 1,200 entries; page-number citations and community FAQ research will be needed during encoding
- **Phase 4 (Career Engine):** The 13 edge cases in PITFALLS.md require rule clarification for some interactions (commission + advancement same term, assignment-change rules varying by career type); Traveller community forums and errata should be checked

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Vite + React + XState + Zustand setup is fully documented with established patterns
- **Phase 2 (Core Creation):** Characteristic generation and background skills are the simplest part of Traveller creation; no ambiguity
- **Phase 6 (Export/Polish):** @react-pdf/renderer and GitHub Actions deployment are well-documented; no novel patterns required

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Version numbers verified live against npm registry; library choices are well-established ecosystem picks |
| Features | HIGH | Competitor analysis done (D&D Beyond, Pathbuilder 2e, existing Traveller generators); table stakes are unambiguous |
| Architecture | HIGH | 4-layer SPA pattern + XState for FSM workflows is a documented, repeatable approach; data volumes estimated from the rulebook |
| Pitfalls | HIGH | Rules edge cases sourced directly from the Core Rulebook; state machine complexity is well-documented failure mode for wizard-style apps |

**Overall confidence:** HIGH

### Gaps to Address

- **Tailwind v4 configuration details:** v4 is a major rewrite from v3 with CSS-native configuration. The approach is confirmed but specific Vite plugin setup (`@tailwindcss/vite`) should be verified against v4 docs during Phase 1 implementation.
- **@react-pdf/renderer specific API:** Version 4.3.2 exists and the declarative approach is confirmed, but exact component APIs for tables and custom fonts should be verified during Phase 6 implementation rather than assumed from training data.
- **XState v5 + @xstate/react integration patterns:** Core v5 concepts are stable, but specific React integration hooks (`useActor`, `useMachine`) may have API details that differ from training data. Verify during Phase 1 scaffolding.
- **Traveller rules edge cases requiring community clarification:** The 13 edge cases in PITFALLS.md are known; however, some (e.g., assignment-change rules for Agent vs. Army) may have errata or community consensus interpretations that differ from the PDF text. Flag for Phase 3/4 resolution.

## Sources

### Primary (HIGH confidence)
- npm registry (live queries, 2026-03-19) — all version numbers verified
- Mongoose Traveller 2E Core Rulebook — career tables, rules edge cases, creation sequence

### Secondary (MEDIUM confidence)
- Training data (knowledge cutoff August 2025) — architectural patterns, library comparisons, XState FSM patterns for wizard-style apps, @react-pdf/renderer capabilities
- Competitor analysis (D&D Beyond, Pathbuilder 2e, TravellerTools, Traveller Character Generator) — features research

### Tertiary (LOW confidence)
- Tailwind v4 CSS-native configuration specifics — verify during Phase 1 implementation
- @react-pdf/renderer v4 table/font API specifics — verify during Phase 6 implementation

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
