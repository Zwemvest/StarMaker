# Phase 3: Career Lifecycle - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can pursue any of the 12 careers through multiple terms with full rules enforcement — qualification, basic training, survival, events, commission, advancement, rank skills, aging, and mustering out. This is the largest phase in the project (34 requirements, ~1,200 career data entries). Career terms loop until the user chooses to leave or is forced out. Mustering out resolves benefits, cash, and pension. Psionics, equipment, and character sheet export are Phase 4. Override mode is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Career Term Flow
- **D-01:** Step-by-step cards for each phase of a term: survival roll card → event card → commission card (military) → advancement card → skill pick card → continue/leave card. Matches the Phase 2 education pattern.
- **D-02:** Vertical timeline for multi-term visualization. Completed terms collapse to summary rows. Current term expanded. Scrolls naturally.
- **D-03:** Narrative event cards for career events — same scanner-blue border, italic flavor text, mechanical effects, choice buttons pattern from Phase 2 education events.
- **D-04:** Tabbed skill tables for career skill selection. Available tables shown as tabs (Personal Dev, Service, Specialist, Officer, Advanced Education). User picks a table, then selects from the 6-entry list using drag-to-slot pattern.
- **D-05:** Dramatic survival roll — show target number and DM, then "Roll for Survival" button. Pass: relief glow + continue. Fail: red flash + mishap card. Maximum tension for this highest-stakes roll.
- **D-06:** Sequential commission + advancement cards for military careers. After events, commission card (if not yet commissioned) then advancement card. Each with target, DM, roll button, and result.
- **D-07:** Decision card with context for continue/leave — shows current rank, terms served, age, aging warnings (34+), pension eligibility (5+ terms). Two buttons: "Serve Another Term" vs "Muster Out".

### Career Data Strategy
- **D-08:** JSON data files (not TypeScript constants) — one JSON file per career in src/data/careers/ (agent.json, army.json, etc.). Zod schemas for runtime validation on import.
- **D-09:** Both structural AND golden-path testing — structural tests verify data shapes (right number of entries, required fields), golden-path tests run 3-5 pre-rolled characters through the engine to verify values match the rulebook.

### Multi-Career Transitions
- **D-10:** Career grid with info cards — 12 career cards in a grid showing: name, qualification target + user's DM, 3 assignments preview, and DM-1 penalty if previously served. Locked careers grayed out.
- **D-11:** Sub-cards for assignment selection — after choosing a career, 3 assignment cards expand below showing name, description, and specialist skill table preview.
- **D-12:** Choice card for qualification failure — "Qualification Failed" card with two options: "Submit to Draft" (1D random career) or "Become a Drifter" (automatic entry). Consequences displayed for each.
- **D-13:** Career history always accessible in character panel (right sidebar) — shows all terms served with career, rank, and key events. Collapsible, updates live.

### Mustering Out & Aging
- **D-14:** Roll-by-roll mustering out — show remaining rolls count, user picks Cash or Benefits table per roll, clicks Roll, result appears inline. Running total of credits and items shown. Cash table max 3 rolls enforced.
- **D-15:** Aging warning card at term end — when age reaches 34+, show "Aging" card after term resolves with roll results and which characteristics decrease. Aging crisis (stat hits 0) shown dramatically.
- **D-16:** Pension highlighted in continue/leave card — "One more term qualifies for Cr10,000/year pension!" at 4 terms. After 5+: pension amount shown in mustering out summary.

### Social Tracking
- **D-17:** Contacts/Allies/Rivals/Enemies tracked in character panel — collapsible section with labeled counts and expandable details. Events that create them show brief notification.
- **D-18:** Noble titles auto-displayed — when SOC reaches 10+, corresponding title (Knight, Baron, etc.) shown next to SOC value in character panel. Updated live.

### Claude's Discretion
- Exact JSON schema structure for career data files
- Career card visual treatment and grid layout details
- Timeline collapse/expand animation
- Mishap card visual treatment
- Skill table tab styling
- How to handle the Citizen/Drifter basic training exception
- Whether to show skill limits (level 4 cap, total 3×(INT+EDU)) as warnings or hard blocks

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Rulebook
- `MgT 2E - Core Rulebook (Printer Friendly).pdf` — All career tables, event tables, mishap tables, rank tables, qualification/survival/advancement/commission targets, skill tables, aging rules, mustering out tables, pension rules, noble titles, contacts/allies/rivals/enemies

### Existing Code
- `src/types/careers.ts` — CareerName, Assignment, Rank, CareerTerm, CareerHistory types (already defined, may need extension)
- `src/types/character.ts` — Character and Skill types
- `src/data/education.ts` — Pattern for how education paths are structured (reference for career data structure)
- `src/engine/education.ts` — Pattern for pure engine functions (reference for career engine)
- `src/machines/creation.ts` — XState machine (needs career sub-states)
- `src/stores/character.ts` — Zustand store (needs career history, contacts, pension fields)

### Phase 2 Patterns
- `src/components/education/EventCard.tsx` — Reference for narrative event card pattern
- `src/components/education/EducationStep.tsx` — Reference for step-by-step card flow with inline rolls
- `src/hooks/useLoggedRoll.ts` — All rolls go through this hook
- `src/hooks/useDragAssign.ts` — Drag-to-slot pattern for skill selection

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DragPool + DropSlot + useDragAssign`: Drag-to-slot pattern for skill selection — reuse directly for career skill picks
- `EventCard`: Narrative event card with scanner-blue border — reuse for career events and mishaps
- `useLoggedRoll`: All dice operations go through this — reuse for survival, commission, advancement, aging, mustering out rolls
- `useCreationMachine`: XState actor wrapper — extend with career sub-states
- `Button`, `Card`, `Tooltip`: UI primitives ready to use
- `formatRollContext`: Human-readable roll log labels — extend with career roll context mappings
- `characteristicModifier`: DM calculation — used for qualification, survival, etc.

### Established Patterns
- XState nested sub-states for multi-step flows (education has 10 sub-states)
- Zustand store with persist middleware (sessionStorage)
- Event replay for machine fast-forward on refresh
- Inline roll results, not modals
- Confirmation dialogs with amber warning for irreversible actions

### Integration Points
- WizardShell: Career step renders in the content area, character panel on right
- ProgressBar: Career step is step 4 of 5
- CharacterPanel: Needs new sections for career history, contacts, noble titles
- HashBar: All rolls update the legitimacy hash automatically

</code_context>

<specifics>
## Specific Ideas

- The career term loop should feel like a story unfolding — each term a chapter with real stakes (survival roll tension, event narratives, advancement progress)
- The vertical timeline gives a sense of a life being lived — terms stacking up like a biography
- Mustering out should feel like cashing in — the roll-by-roll card sequence creates anticipation for each benefit
- The aging warning creates a natural "should I push my luck?" tension at the continue/leave decision
- Career grid should immediately communicate which careers the character is suited for (high DM) vs risky (low DM)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-career-lifecycle*
*Context gathered: 2026-04-03*
