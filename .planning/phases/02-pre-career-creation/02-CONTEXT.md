# Phase 2: Pre-Career Creation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can generate characteristics (roll 2D × 6, assign to stats), select background skills from the adolescence list, and optionally attend University or Military Academy — the complete pre-career creation flow with real UI. This is the first phase with user-facing components. Career terms and mustering out are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Wizard Layout & Navigation
- Top horizontal progress bar with step indicators (completed/current/locked states)
- Steps: Characteristics → Background Skills → Education → Career → Muster Out
- Completed steps are clickable for read-only review; current step stays active
- Main content area on the left, live character summary panel on the right
- Slim bottom bar showing 8-char legitimacy hash + Legitimate/Modified badge + collapsible roll log drawer toggle
- Slide animation (~200ms) for step transitions (left/right based on direction)
- Explicit "Continue" button to advance — no auto-progression
- Dynamic sub-steps under Career for each term served (future phases build on this)

### Characteristic Assignment
- Roll all 6 values at once ("Roll All" button), then assign to stats
- Drag-and-drop assignment: drag rolled values from a pool into stat slots
- 2×3 grid layout: Physical (STR/DEX/END) left, Mental (INT/EDU/SOC) right
- Live DM preview: hovering a value over a slot shows the resulting modifier in real-time
- Individual die results shown as styled number chips per Phase 1 decisions (e.g., [4][3] = 7)

### Education Decision Flow
- Card selection UI: 3 cards side by side — University, Military Academy, Skip to Career
- Cards show entry requirements, skill grants, and what you gain on success
- Military Academy card offers branch sub-selection (Army/Marines/Navy)
- Entry roll results displayed inline on the card: target, modifiers, roll, pass/fail
- Success: card glows, "Admitted!" with skill grants listed
- Failure: "Entry denied" with inline options — "Try again (term N, DM penalty)" or "Skip to career"
- Skills earned during failed education terms are highlighted as retained
- Education events displayed as narrative cards — flavor text + mechanical effects + choice buttons when applicable

### Background Skill Picker
- Drag-from-pool into numbered slots pattern (consistent with characteristic assignment)
- Number of slots = EDU DM + 3 (0 to 6), dynamically calculated
- Available skills grouped by type (Physical, Mental, Social, Technical)
- Brief tooltips on hover showing what each skill covers
- Subtle relevance markers on skills commonly used in career/education rolls
- Pool dims when all slots filled; drag a skill out of a slot to free it and re-enable pool
- Same drag-from-pool + numbered slots pattern reused for ALL skill selections throughout creation (education skills, career skill picks, etc.)

### Claude's Discretion
- Exact drag-and-drop library/implementation approach
- Responsive breakpoints for side panel collapse
- Tooltip content wording
- Relevance marker design (dot, icon, border, etc.)
- Roll log drawer height and scroll behavior
- Exact animation easing curves
- Skill category groupings for the adolescence list
- Progress bar visual treatment (connected dots, segmented bar, etc.)

</decisions>

<specifics>
## Specific Ideas

- The wizard layout follows a three-zone pattern: top (progress), middle (content + character panel), bottom (hash + roll log) — this sets the shell for all future phases
- Drag-and-drop is the core interaction pattern for placing things (values into stats, skills into slots) — establishes muscle memory
- Education events should feel like story beats, not just mechanical effects — narrative cards with flavor text
- Entry roll results are inline, not modal — keeps the user in flow
- The side character panel updates in real-time as decisions are made — user always sees the impact

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/engine/dice.ts`: roll1D, roll2D, roll3D, rollD3, rollD66 — all dice mechanics ready
- `src/engine/hash.ts`: SHA-256 legitimacy hash computation
- `src/engine/roll-log.ts`: Append-only roll log with canonical serialization
- `src/machines/creation.ts`: XState machine with characteristics → backgroundSkills → education → career → musteringOut states
- `src/stores/character.ts`: Zustand + Immer store with setCharacteristic, addSkill, updateSkillLevel, appendRoll, setLegitimacyHash
- `src/types/common.ts`: CharacteristicId type, CHARACTERISTIC_IDS array, characteristicModifier() function
- `src/types/character.ts`: Full Character interface with characteristics, skills, rollLog, legitimacyHash, isModified

### Established Patterns
- XState manages workflow position ONLY; Zustand manages character data ONLY — strict separation
- Pure engine functions in src/engine/ with no React dependencies
- Tailwind v4 with @theme block: scanner-blue (#00d4ff), terminal-bg (#0a0e17), terminal-surface (#111827), legitimate (#22c55e), modified (#f59e0b)
- JetBrains Mono / Fira Code for numbers, Inter for body text

### Integration Points
- App.tsx is currently a placeholder — wizard shell replaces it
- XState machine needs nested states expanded for characteristics sub-flow (roll → assign), background skills, and education (choose → entry roll → events → graduation)
- Zustand store needs education-related state (education type, term, skills earned)
- No existing components directory — Phase 2 creates the component architecture

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-pre-career-creation*
*Context gathered: 2026-03-19*
