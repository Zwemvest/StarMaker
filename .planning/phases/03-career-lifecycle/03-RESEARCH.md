# Phase 3: Career Lifecycle - Research

**Researched:** 2026-04-02
**Domain:** Mongoose Traveller 2E career creation engine + UI
**Confidence:** HIGH

## Summary

Phase 3 is the largest phase in the project (34 requirements) implementing the full career lifecycle: qualification, basic training, survival, events, commission, advancement, rank skills, aging, mustering out, and social tracking. The codebase already has strong patterns from Phase 2 (education step) that directly transfer: XState sub-states for multi-step flows, Zustand store for character data, useLoggedRoll for all dice operations, EventCard for narrative events, and drag-to-slot for skill selection.

The primary technical challenge is **data volume**: 12 careers x (qualification + survival + events + mishaps + ranks + skill tables + mustering out) = ~1,200 data entries that must be faithfully transcribed from the Core Rulebook. The career JSON data files (D-08) need Zod schemas for runtime validation. The XState machine's `career` state (currently a flat node) must be expanded into ~15 nested sub-states to model the term lifecycle loop.

**Primary recommendation:** Layer the implementation in 3 waves: (1) career data + engine + Zod schemas, (2) XState machine expansion + career term UI components, (3) multi-career transitions + mustering out + aging + social tracking.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Step-by-step cards for each phase of a term: survival roll card, event card, commission card (military), advancement card, skill pick card, continue/leave card. Matches the Phase 2 education pattern.
- **D-02:** Vertical timeline for multi-term visualization. Completed terms collapse to summary rows. Current term expanded. Scrolls naturally.
- **D-03:** Narrative event cards for career events -- same scanner-blue border, italic flavor text, mechanical effects, choice buttons pattern from Phase 2 education events.
- **D-04:** Tabbed skill tables for career skill selection. Available tables shown as tabs (Personal Dev, Service, Specialist, Officer, Advanced Education). User picks a table, then selects from the 6-entry list using drag-to-slot pattern.
- **D-05:** Dramatic survival roll -- show target number and DM, then "Roll for Survival" button. Pass: relief glow + continue. Fail: red flash + mishap card. Maximum tension for this highest-stakes roll.
- **D-06:** Sequential commission + advancement cards for military careers. After events, commission card (if not yet commissioned) then advancement card. Each with target, DM, roll button, and result.
- **D-07:** Decision card with context for continue/leave -- shows current rank, terms served, age, aging warnings (34+), pension eligibility (5+ terms). Two buttons: "Serve Another Term" vs "Muster Out".
- **D-08:** JSON data files (not TypeScript constants) -- one JSON file per career in src/data/careers/ (agent.json, army.json, etc.). Zod schemas for runtime validation on import.
- **D-09:** Both structural AND golden-path testing -- structural tests verify data shapes (right number of entries, required fields), golden-path tests run 3-5 pre-rolled characters through the engine to verify values match the rulebook.
- **D-10:** Career grid with info cards -- 12 career cards in a grid showing: name, qualification target + user's DM, 3 assignments preview, and DM-1 penalty if previously served. Locked careers grayed out.
- **D-11:** Sub-cards for assignment selection -- after choosing a career, 3 assignment cards expand below showing name, description, and specialist skill table preview.
- **D-12:** Choice card for qualification failure -- "Qualification Failed" card with two options: "Submit to Draft" (1D random career) or "Become a Drifter" (automatic entry). Consequences displayed for each.
- **D-13:** Career history always accessible in character panel (right sidebar) -- shows all terms served with career, rank, and key events. Collapsible, updates live.
- **D-14:** Roll-by-roll mustering out -- show remaining rolls count, user picks Cash or Benefits table per roll, clicks Roll, result appears inline. Running total of credits and items shown. Cash table max 3 rolls enforced.
- **D-15:** Aging warning card at term end -- when age reaches 34+, show "Aging" card after term resolves with roll results and which characteristics decrease. Aging crisis (stat hits 0) shown dramatically.
- **D-16:** Pension highlighted in continue/leave card -- "One more term qualifies for Cr10,000/year pension!" at 4 terms. After 5+: pension amount shown in mustering out summary.
- **D-17:** Contacts/Allies/Rivals/Enemies tracked in character panel -- collapsible section with labeled counts and expandable details. Events that create them show brief notification.
- **D-18:** Noble titles auto-displayed -- when SOC reaches 10+, corresponding title (Knight, Baron, etc.) shown next to SOC value in character panel. Updated live.

### Claude's Discretion
- Exact JSON schema structure for career data files
- Career card visual treatment and grid layout details
- Timeline collapse/expand animation
- Mishap card visual treatment
- Skill table tab styling
- How to handle the Citizen/Drifter basic training exception
- Whether to show skill limits (level 4 cap, total 3x(INT+EDU)) as warnings or hard blocks

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRER-01 | All 12 careers implemented | Career JSON data files (one per career), Zod schema validation |
| CRER-02 | Each career has 3 assignments with correct specialist skill tables | Assignment sub-objects in career JSON with specialist skill arrays |
| CRER-03 | Qualification rolls with DM-1 per previous career | Career engine function: calculateQualificationDM, XState guard |
| CRER-04 | Basic training: first career = all service skills at 0; subsequent = pick one | Engine function with career-count check, conditional UI |
| CRER-05 | Citizen and Drifter basic training exception | Use assignment skill tables instead of service skills for these two careers |
| CRER-06 | Survival rolls per assignment with mishap tables (6 entries each) | Survival engine function, mishap data in career JSON, natural-2 check |
| CRER-07 | Natural 2 on survival is always a failure regardless of modifiers | Pre-modifier check in survival engine function |
| CRER-08 | Event tables (2D, 12 entries per career) fully implemented | Event data in career JSON, reuse EventCard pattern from education |
| CRER-09 | Life Events table (shared across careers) | Separate life-events.json shared data file |
| CRER-10 | Commission system for Army, Navy, Marines with SOC 9+ | Commission engine function, military-only XState branch |
| CRER-11 | Commission DM-1 per term after first; advancement DMs apply | Cumulative DM tracking in machine context |
| CRER-12 | Cannot advance in the same term as gaining commission | XState guard preventing advancement after new commission |
| CRER-13 | Advancement rolls with forced-leave mechanic | Advancement engine with terms-served comparison |
| CRER-14 | Natural 12 on advancement = forced to stay | Pre-modifier check in advancement engine function |
| CRER-15 | Rank tables with bonus skills granted immediately | Rank data in career JSON, engine function to apply rank skills |
| CRER-16 | Skills and training tables (5 types) | Tab-based UI with 5 table categories per career |
| CRER-17 | Advanced Education and Officer tables restricted | Engine guard checking EDU >= 8 or commissioned status |
| CRER-18 | Skill level 4 cap during creation | Validation in addSkill / skill selection UI |
| CRER-19 | Total skill levels <= 3 x (INT + EDU) | Running total check in engine, warning in UI |
| CRER-20 | Draft table (1D -> career assignment), once per lifetime | Draft data, drafted flag in machine context |
| CRER-21 | Failed qualification -> choose Draft or Drifter | Choice card UI with two options |
| CRER-22 | Changing careers requires new qualification with cumulative DM | Career count tracking, DM calculation |
| CRER-23 | Changing assignments varies by career type | Engine rules per career type |
| CRER-24 | Cannot return to career in immediately following term | Previous-career tracking in machine context |
| AGNG-01 | Aging rolls triggered at age 34+ | Age tracking, post-term aging check |
| AGNG-02 | Aging effects correctly reduce characteristics | Aging table data, characteristic reduction engine |
| AGNG-03 | Aging crisis rules when characteristic reaches 0 | Crisis detection and resolution in engine |
| MSTR-01 | Cash table rolls (max 3 lifetime) | Cash roll counter, mustering out engine |
| MSTR-02 | Benefits table rolls with rank-based bonus | Rank-to-bonus mapping, DM+1 for rank 5-6 |
| MSTR-03 | Pension calculation for 5+ terms | Pension table in engine, terms-served check |
| MSTR-04 | Lost benefit roll for mishap term | Mishap flag per term, benefit deduction logic |
| MSTR-05 | Commission + enlisted rank combined for benefits | Dual-rank tracking for military careers |
| SOCL-01 | Contacts/Allies/Rivals/Enemies tracked with notes | Contact store in Zustand, event-driven creation |
| SOCL-02 | Noble titles derived from Social Standing | SOC-to-title mapping function, live display |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.0.0 | UI framework | Project standard |
| XState | ^5.28.0 | Career workflow state machine | Handles complex nested state transitions, already used for education |
| @xstate/react | ^6.1.0 | React bindings for XState | Project standard |
| Zustand | ^5.0.12 | Character data store | Project standard, persist middleware for session storage |
| Immer | ^11.1.4 | Immutable state updates | Project standard via Zustand middleware |
| Zod | ^4.3.6 | Runtime JSON validation for career data files | Project standard, used for character/roll-log schemas |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop for skill selection | Project standard, reuse from characteristics step |
| Tailwind CSS | ^4.2.2 | Styling | Project standard, CSS-native config |
| Vitest | ^4.1.0 | Testing | Project standard |

### No New Dependencies Needed
This phase uses exclusively the existing stack. No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
  data/
    careers/              # NEW: One JSON file per career (D-08)
      agent.json
      army.json
      citizen.json
      drifter.json
      entertainer.json
      marine.json
      merchant.json
      navy.json
      noble.json
      rogue.json
      scholar.json
      scout.json
    life-events.json      # NEW: Shared life events table (CRER-09)
    aging.ts              # NEW: Aging table data
    draft.ts              # NEW: Draft table data
    mustering-out.ts      # NEW: Pension table, noble titles
  schemas/
    career.ts             # NEW: Zod schemas for career JSON validation
  engine/
    career.ts             # NEW: Pure career engine functions
    aging.ts              # NEW: Aging engine functions
    mustering-out.ts      # NEW: Mustering out engine functions
  types/
    careers.ts            # EXTEND: Add detailed career data types
  machines/
    creation.ts           # EXTEND: Expand career state to nested sub-states
  stores/
    character.ts          # EXTEND: Add career history, contacts, pension, age tracking
  components/
    career/               # NEW: Career step components
      CareerStep.tsx       # Main orchestrator (like EducationStep)
      CareerGrid.tsx       # 12-career selection grid (D-10)
      AssignmentCards.tsx   # 3-assignment sub-cards (D-11)
      SurvivalRoll.tsx     # Dramatic survival roll card (D-05)
      CareerEventCard.tsx   # Career-specific event wrapper
      CommissionCard.tsx    # Commission roll card (D-06)
      AdvancementCard.tsx   # Advancement roll card (D-06)
      SkillTableTabs.tsx    # Tabbed skill table picker (D-04)
      ContinueLeaveCard.tsx # Decision card (D-07)
      QualFailCard.tsx      # Qualification failure choice (D-12)
      MishapCard.tsx        # Mishap display card
      TermTimeline.tsx      # Vertical timeline (D-02)
      TermSummary.tsx       # Collapsed term row
      AgingCard.tsx         # Aging warning/crisis (D-15)
      BasicTrainingCard.tsx # Basic training skill display
    mustering-out/         # NEW: Mustering out components
      MusteringOutStep.tsx  # Main orchestrator
      BenefitRoll.tsx       # Roll-by-roll benefit card (D-14)
      PensionSummary.tsx    # Pension display (D-16)
    character-panel/
      CharacterPanel.tsx   # EXTEND: Career history, contacts, noble titles
```

### Pattern 1: Career JSON Data Schema
**What:** Each career is a single JSON file validated by a Zod schema at import time.
**When to use:** All 12 career files follow this structure.
**Recommended schema:**
```typescript
// src/schemas/career.ts
import { z } from 'zod';

const skillEntrySchema = z.union([
  z.string(),  // Simple skill name like "Athletics"
  z.object({   // Skill with specialty
    name: z.string(),
    specialty: z.string().optional(),
  }),
]);

const assignmentSchema = z.object({
  name: z.string(),
  description: z.string(),
  survival: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }),
  advancement: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }),
  specialistSkills: z.array(skillEntrySchema).length(6),
});

const rankSchema = z.object({
  level: z.number().int().min(0).max(6),
  title: z.string(),
  bonusSkill: z.string().nullable(),
  bonusSkillLevel: z.number().int().min(0).max(1).optional(),
});

const eventEffectSchema = z.object({
  type: z.enum(['skill', 'characteristic', 'contact', 'ally', 'rival', 'enemy', 'choice', 'special', 'benefit', 'injury']),
  detail: z.string(),
  options: z.array(z.string()).optional(),
});

const careerEventSchema = z.object({
  rollValue: z.number().int().min(2).max(12),
  description: z.string(),
  effectDescription: z.string(),
  effects: z.array(eventEffectSchema),
  hasChoice: z.boolean(),
});

const mishapSchema = z.object({
  rollValue: z.number().int().min(1).max(6),
  description: z.string(),
  effectDescription: z.string(),
  effects: z.array(eventEffectSchema),
});

const musteringOutTableSchema = z.object({
  cash: z.array(z.number().int()).length(7),  // Indexed 1-7 (roll 1D+rank bonus)
  benefits: z.array(z.string()).length(7),
});

export const careerSchema = z.object({
  name: z.string(),
  description: z.string(),
  qualification: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }).nullable(),  // null for Drifter (auto-entry)
  assignments: z.array(assignmentSchema).length(3),
  isMilitary: z.boolean(),
  commission: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }).nullable(),  // null for non-military
  ranks: z.object({
    enlisted: z.array(rankSchema),
    officer: z.array(rankSchema).optional(),  // military only
  }),
  skillTables: z.object({
    personalDevelopment: z.array(skillEntrySchema).length(6),
    serviceSkills: z.array(skillEntrySchema).length(6),
    advancedEducation: z.array(skillEntrySchema).length(6),
    officer: z.array(skillEntrySchema).length(6).optional(),  // military only
  }),
  events: z.array(careerEventSchema).length(11),  // Rolls 2-12
  mishaps: z.array(mishapSchema).length(6),  // Rolls 1-6
  musteringOut: musteringOutTableSchema,
  basicTrainingException: z.boolean().default(false),  // true for Citizen, Drifter
});
```

### Pattern 2: Career Engine Functions (Pure)
**What:** Pure functions for all career mechanics, following the education engine pattern.
**When to use:** All career roll resolution, validation, and state transitions.
```typescript
// src/engine/career.ts - key function signatures
export function calculateQualificationDM(previousCareersCount: number): number;
export function resolveQualificationRoll(diceTotal: number, dm: number, target: number): { success: boolean; total: number };
export function resolveSurvivalRoll(diceTotal: number, dm: number, target: number): { survived: boolean; isMishap: boolean; naturalTwo: boolean };
export function resolveCommissionRoll(diceTotal: number, dm: number, target: number, termsInCareer: number): { success: boolean; total: number };
export function resolveAdvancementRoll(diceTotal: number, dm: number, target: number, termsServed: number): { advanced: boolean; forcedToLeave: boolean; forcedToStay: boolean };
export function getAvailableSkillTables(career: CareerData, isCommissioned: boolean, edu: number): string[];
export function applyRankSkill(career: CareerData, newRank: number, isOfficer: boolean): { skill: string; level: number } | null;
export function checkSkillLevelCap(currentLevel: number): boolean; // level 4 cap
export function checkTotalSkillLimit(skills: Skill[], int: number, edu: number): boolean; // 3x(INT+EDU)
export function getBasicTrainingSkills(career: CareerData, isFirstCareer: boolean): string[];
```

### Pattern 3: XState Career Sub-States
**What:** The flat `career` state must become a deeply nested machine modeling the term lifecycle.
**When to use:** Core workflow for the career step.
```
career (compound state)
  initial: choosingCareer
  states:
    choosingCareer          # Show career grid (D-10)
    choosingAssignment      # Show 3 assignment cards (D-11)
    qualificationRoll       # Roll for qualification
    qualificationFailed     # Draft or Drifter choice (D-12)
    basicTraining           # Show/assign basic training skills
    termLoop (compound)     # The term lifecycle
      initial: survivalRoll
      states:
        survivalRoll        # Dramatic survival roll (D-05)
        mishap              # Mishap result card
        event               # Career event card (D-03)
        commission          # Commission roll (military only) (D-06)
        advancement         # Advancement roll (D-06)
        skillSelection      # Tabbed skill tables (D-04)
        aging               # Aging check at 34+ (D-15)
        continueOrLeave     # Decision card (D-07)
    changingCareer          # Re-entering choosingCareer with penalties
    musteringOut            # Roll-by-roll benefits (D-14)
```

### Pattern 4: Zustand Store Extensions
**What:** The character store needs new fields for career tracking.
**When to use:** Career history, contacts, age, pension.
```typescript
// Additional state fields needed in CharacterState:
interface CareerExtensions {
  careerHistory: CareerTermRecord[];  // Full history with detailed records
  contacts: Contact[];                // Contacts/Allies/Rivals/Enemies
  age: number;                        // Current age (starts 18, +4 per term)
  cashRollsUsed: number;              // Max 3 lifetime (MSTR-01)
  credits: number;                    // Accumulated cash
  pension: number;                    // Annual pension (5+ terms)
  benefits: string[];                 // Mustering out benefits
  drafted: boolean;                   // Once per lifetime flag (CRER-20)
  previousCareers: CareerName[];      // For DM-1 penalty tracking
  lastCareer: CareerName | null;      // Cannot return immediately (CRER-24)
}

// Additional actions:
interface CareerActions {
  addCareerTerm: (term: CareerTermRecord) => void;
  addContact: (contact: Contact) => void;
  setAge: (age: number) => void;
  addCredits: (amount: number) => void;
  setPension: (amount: number) => void;
  addBenefit: (benefit: string) => void;
  incrementCashRolls: () => void;
  setDrafted: () => void;
  reduceCharacteristic: (id: CharacteristicId, amount: number) => void;
}
```

### Pattern 5: Career Data Import with Validation
**What:** JSON files imported dynamically and validated with Zod.
**When to use:** Loading career data at runtime.
```typescript
// src/data/careers/index.ts
import { careerSchema } from '../../schemas/career';
import type { CareerData } from '../../types/careers';

// Static imports for bundling (JSON files)
import agentJson from './agent.json';
import armyJson from './army.json';
// ... etc

const RAW_CAREERS = { agent: agentJson, army: armyJson, /* ... */ };

export const CAREERS: Record<CareerName, CareerData> = Object.fromEntries(
  Object.entries(RAW_CAREERS).map(([key, raw]) => {
    const parsed = careerSchema.parse(raw);
    return [key, parsed];
  })
) as Record<CareerName, CareerData>;

export function getCareer(name: CareerName): CareerData {
  return CAREERS[name];
}
```

### Anti-Patterns to Avoid
- **Putting career data in TypeScript constants:** Decision D-08 explicitly chose JSON files. TypeScript constants make the ~1,200 entries harder to diff and review.
- **Mixing workflow state into Zustand:** XState manages which sub-state of the career term flow the user is on. Zustand manages character data only. This separation is a core architectural decision from Phase 1.
- **Duplicating career flow logic in components:** All roll resolution, DM calculation, and rules checks must be pure engine functions. Components only call engine functions and dispatch XState events.
- **Using modals for rolls:** The project pattern is inline roll results, not modals. Keep this consistent.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop skill selection | Custom drag handlers | `useDragAssign` hook + `@dnd-kit` | Already working, tested pattern from characteristics step |
| Dice rolling | Custom random | `useLoggedRoll` hook | Atomically logs + hashes every roll |
| State persistence | Custom localStorage | Zustand persist middleware | Already configured with sessionStorage |
| Event replay on refresh | Custom replay logic | `deriveReplayEvents()` in `useCreationMachine` | Extend existing pattern for career states |
| Narrative event cards | New event display component | Extend `EventCard` component | Same pattern, different data shape |
| DM calculations | Inline math | `characteristicModifier()` from `types/common.ts` | Standard modifier table |

**Key insight:** Phase 3 has enormous data volume but relatively few new UI patterns. Almost everything reuses Phase 2 patterns with career-specific data. The real work is data transcription accuracy and XState machine expansion.

## Common Pitfalls

### Pitfall 1: Data Transcription Errors
**What goes wrong:** With ~1,200 entries to transcribe from the Core Rulebook, typos and wrong values are inevitable.
**Why it happens:** Manual transcription from PDF, fatigue over 12 career files.
**How to avoid:** Golden-path tests (D-09) with 3-5 pre-rolled characters that verify specific values. Structural tests verify counts and shapes. Cross-reference every career file against the rulebook systematically.
**Warning signs:** Tests pass structurally but golden-path characters produce wrong skill values or wrong rank titles.

### Pitfall 2: XState Machine Complexity Explosion
**What goes wrong:** The career sub-state machine becomes unmanageable with too many states, guards, and context variables.
**Why it happens:** Career terms have many conditional branches (military vs civilian, first career vs subsequent, aging, forced leave, forced stay).
**How to avoid:** Keep the machine modeling workflow ONLY. Use guards that call engine functions. Keep context minimal (phase tracking variables only). Let Zustand handle all character data.
**Warning signs:** Machine context grows beyond 10-12 properties. Guards contain business logic instead of calling engine functions.

### Pitfall 3: Event Replay Breaking on Refresh
**What goes wrong:** After adding career sub-states, `deriveReplayEvents()` can't reconstruct the correct machine position from persisted Zustand data.
**Why it happens:** Career state has more intermediate positions than education. The replay heuristic needs to handle "user was mid-term in their 3rd career term" scenarios.
**How to avoid:** Store a breadcrumb in Zustand (e.g., `careerPhase: 'survivalRoll'`) that the replay function can use. Or store the full XState snapshot for career state restoration.
**Warning signs:** Page refresh during a career term sends user back to career selection instead of mid-term.

### Pitfall 4: Natural 2/12 Edge Cases
**What goes wrong:** Natural 2 on survival must ALWAYS fail regardless of DMs (CRER-07). Natural 12 on advancement must ALWAYS force staying (CRER-14). These are pre-modifier checks.
**Why it happens:** Easy to check `total >= target` without first checking the raw dice.
**How to avoid:** Engine functions receive BOTH `diceTotal` (raw sum) and `modifier` separately. Check `diceTotal === 2` before applying modifier.
**Warning signs:** Characters with high DMs survive natural 2 rolls. Characters with advancement nat-12 are allowed to leave.

### Pitfall 5: Citizen/Drifter Basic Training Exception
**What goes wrong:** CRER-05 says Citizen and Drifter use assignment skill tables for basic training, not service skills. If this is treated the same as other careers, characters get wrong skills.
**Why it happens:** The exception is easily overlooked because it applies to only 2 of 12 careers.
**How to avoid:** `basicTrainingException: true` flag in the career JSON. Engine function checks this flag and returns assignment-specific skills instead of service skills.
**Warning signs:** Citizen/Drifter characters receive generic service skills instead of assignment-specific ones.

### Pitfall 6: Mustering Out Benefit Calculation Complexity
**What goes wrong:** Benefit rolls involve multiple modifiers: rank-based bonus rolls, rank-based DM+1, cash table max 3 rolls lifetime, lost benefit on mishap term. Getting all these right simultaneously is tricky.
**Why it happens:** Multiple overlapping rules interact: MSTR-01 through MSTR-05 all affect the same mustering out sequence.
**How to avoid:** Dedicated `mustering-out.ts` engine file. Separate functions for: calculating total rolls, applying rank bonuses, checking cash limit, handling mishap deduction. Unit test each independently.
**Warning signs:** Characters get wrong number of benefit rolls, or rank bonuses are applied incorrectly.

### Pitfall 7: Commission + Advancement Interaction
**What goes wrong:** CRER-12 says you cannot advance in the same term you gain commission. CRER-11 says events that grant advancement DMs also apply to commission. These interactions are easy to miss.
**Why it happens:** Commission and advancement are modeled separately but interact through shared state.
**How to avoid:** Track `justCommissioned` flag in the term flow. XState guard prevents advancement state entry when flag is true. DM bonuses from events are stored in machine context and applied to both commission and advancement rolls.
**Warning signs:** Characters advance in the same term they gain commission, or event DMs only apply to one roll type.

## Code Examples

### Career Engine: Survival Roll Resolution
```typescript
// src/engine/career.ts
export function resolveSurvivalRoll(
  diceTotal: number,  // Raw dice sum before modifier
  dm: number,
  target: number,
): { survived: boolean; isMishap: boolean; naturalTwo: boolean } {
  // CRER-07: Natural 2 is always a failure regardless of modifiers
  if (diceTotal === 2) {
    return { survived: false, isMishap: true, naturalTwo: true };
  }
  const total = diceTotal + dm;
  const survived = total >= target;
  return { survived, isMishap: !survived, naturalTwo: false };
}
```

### Career Engine: Advancement Roll Resolution
```typescript
export function resolveAdvancementRoll(
  diceTotal: number,
  dm: number,
  target: number,
  termsServed: number,  // Total terms in THIS career
): { advanced: boolean; forcedToLeave: boolean; forcedToStay: boolean } {
  // CRER-14: Natural 12 = forced to stay
  if (diceTotal === 12) {
    const total = diceTotal + dm;
    return { advanced: total >= target, forcedToLeave: false, forcedToStay: true };
  }
  const total = diceTotal + dm;
  const advanced = total >= target;
  // CRER-13: If roll (before DM) <= terms served, must leave at end of term
  const forcedToLeave = !advanced && diceTotal <= termsServed;
  return { advanced, forcedToLeave, forcedToStay: false };
}
```

### Aging Engine
```typescript
// src/engine/aging.ts
const AGING_TABLE = [
  { age: 34, checks: [{ stat: 'STR', target: 8 }, { stat: 'DEX', target: 7 }, { stat: 'END', target: 8 }] },
  { age: 46, checks: [{ stat: 'STR', target: 9 }, { stat: 'DEX', target: 8 }, { stat: 'END', target: 9 }] },
  { age: 58, checks: [{ stat: 'STR', target: 10 }, { stat: 'DEX', target: 9 }, { stat: 'END', target: 10 }] },
  { age: 70, checks: [{ stat: 'STR', target: 11 }, { stat: 'DEX', target: 10 }, { stat: 'END', target: 11 }] },
  // 70+: same as 70
];

export function getAgingChecks(age: number): { stat: string; target: number }[] | null {
  if (age < 34) return null;
  const bracket = AGING_TABLE.findLast(b => age >= b.age);
  return bracket?.checks ?? AGING_TABLE[AGING_TABLE.length - 1].checks;
}

export function resolveAgingCheck(
  diceTotal: number, dm: number, target: number
): { reduced: boolean; amount: number } {
  const total = diceTotal + dm;
  if (total >= target) return { reduced: false, amount: 0 };
  const diff = target - total;
  return { reduced: true, amount: diff };
}

export function isAgingCrisis(currentValue: number, reduction: number): boolean {
  return currentValue - reduction <= 0; // AGNG-03
}
```

### Noble Titles Mapping
```typescript
// SOCL-02
export function getNobleTitle(soc: number): string | null {
  if (soc >= 15) return 'Duke';
  if (soc >= 14) return 'Count';
  if (soc >= 13) return 'Marquis';
  if (soc >= 12) return 'Baron';
  if (soc >= 11) return 'Knight';
  return null;
}
```

### Qualification DM
```typescript
// CRER-03, CRER-22
export function calculateQualificationDM(previousCareersCount: number): number {
  return previousCareersCount > 0 ? -1 * previousCareersCount : 0;
}
```

### Skill Limit Checks
```typescript
// CRER-18: Level 4 cap
export function isSkillAtCap(level: number): boolean {
  return level >= 4;
}

// CRER-19: Total skill levels <= 3 x (INT + EDU)
export function getTotalSkillLevels(skills: Skill[]): number {
  return skills.reduce((sum, s) => sum + s.level, 0);
}

export function isOverSkillLimit(skills: Skill[], int: number, edu: number): boolean {
  return getTotalSkillLevels(skills) > 3 * (int + edu);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TS constants for game data | JSON files + Zod validation (D-08) | Phase 3 decision | Career data is JSON, not TS -- departure from Phase 2 education pattern |
| Flat career state in XState | Deeply nested career sub-states | Phase 3 | Machine expansion needed for term lifecycle |
| No age tracking | Active age tracking with aging mechanics | Phase 3 | Store needs age field, updated per term |

## Discretion Recommendations

### Citizen/Drifter Basic Training Exception (CRER-05)
**Recommendation:** Add `basicTrainingException: true` to citizen.json and drifter.json. The engine function `getBasicTrainingSkills()` checks this flag: if true, returns the assignment-specific specialist skill table instead of service skills. UI shows the same basic training card either way -- the data source just differs. This is the simplest approach and keeps the exception data-driven.

### Skill Limits: Warnings vs Hard Blocks
**Recommendation:** Use **hard blocks with clear explanation**. When a skill would exceed level 4 or push total over 3x(INT+EDU), gray out that option in the skill table and show a tooltip explaining why. This prevents invalid characters while keeping the UI responsive. The hard block approach is consistent with how the project already handles the max-15 characteristic cap -- the store silently clamps with `Math.min(value, 15)`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vite.config.ts (vitest section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRER-01 | 12 career JSON files parse with Zod | unit | `npx vitest run tests/data/careers.test.ts -t "structural"` | Wave 0 |
| CRER-02 | Each career has 3 assignments with 6 specialist skills | unit | `npx vitest run tests/data/careers.test.ts -t "assignments"` | Wave 0 |
| CRER-03 | Qualification DM-1 per previous career | unit | `npx vitest run tests/engine/career.test.ts -t "qualification"` | Wave 0 |
| CRER-04 | Basic training: first career all service skills, subsequent pick one | unit | `npx vitest run tests/engine/career.test.ts -t "basic training"` | Wave 0 |
| CRER-05 | Citizen/Drifter use assignment skills for basic training | unit | `npx vitest run tests/engine/career.test.ts -t "basic training exception"` | Wave 0 |
| CRER-06 | Survival rolls with mishap on failure | unit | `npx vitest run tests/engine/career.test.ts -t "survival"` | Wave 0 |
| CRER-07 | Natural 2 always fails survival | unit | `npx vitest run tests/engine/career.test.ts -t "natural 2"` | Wave 0 |
| CRER-08 | Event tables fully implemented (12 per career) | unit | `npx vitest run tests/data/careers.test.ts -t "events"` | Wave 0 |
| CRER-09 | Life Events shared table | unit | `npx vitest run tests/data/life-events.test.ts` | Wave 0 |
| CRER-10 | Commission for military careers | unit | `npx vitest run tests/engine/career.test.ts -t "commission"` | Wave 0 |
| CRER-11 | Commission DM-1 per term | unit | `npx vitest run tests/engine/career.test.ts -t "commission dm"` | Wave 0 |
| CRER-12 | No advancement same term as commission | unit | `npx vitest run tests/engine/career.test.ts -t "no advance with commission"` | Wave 0 |
| CRER-13 | Advancement forced-leave mechanic | unit | `npx vitest run tests/engine/career.test.ts -t "forced leave"` | Wave 0 |
| CRER-14 | Natural 12 advancement forced stay | unit | `npx vitest run tests/engine/career.test.ts -t "natural 12"` | Wave 0 |
| CRER-15 | Rank bonus skills | unit | `npx vitest run tests/engine/career.test.ts -t "rank skills"` | Wave 0 |
| CRER-16 | 5 skill table types | unit | `npx vitest run tests/data/careers.test.ts -t "skill tables"` | Wave 0 |
| CRER-17 | Advanced/Officer table restrictions | unit | `npx vitest run tests/engine/career.test.ts -t "table restrictions"` | Wave 0 |
| CRER-18 | Skill level 4 cap | unit | `npx vitest run tests/engine/career.test.ts -t "skill cap"` | Wave 0 |
| CRER-19 | Total skill limit 3x(INT+EDU) | unit | `npx vitest run tests/engine/career.test.ts -t "total skill limit"` | Wave 0 |
| CRER-20 | Draft table, once per lifetime | unit | `npx vitest run tests/engine/career.test.ts -t "draft"` | Wave 0 |
| CRER-21 | Failed qual -> Draft or Drifter | unit | `npx vitest run tests/engine/career.test.ts -t "failed qualification"` | Wave 0 |
| CRER-22 | Career change cumulative DM | unit | `npx vitest run tests/engine/career.test.ts -t "career change"` | Wave 0 |
| CRER-23 | Assignment change rules | unit | `npx vitest run tests/engine/career.test.ts -t "assignment change"` | Wave 0 |
| CRER-24 | Cannot return immediately | unit | `npx vitest run tests/engine/career.test.ts -t "no immediate return"` | Wave 0 |
| AGNG-01 | Aging at 34+ | unit | `npx vitest run tests/engine/aging.test.ts -t "trigger"` | Wave 0 |
| AGNG-02 | Correct characteristic reduction | unit | `npx vitest run tests/engine/aging.test.ts -t "reduction"` | Wave 0 |
| AGNG-03 | Aging crisis at 0 | unit | `npx vitest run tests/engine/aging.test.ts -t "crisis"` | Wave 0 |
| MSTR-01 | Cash table max 3 rolls | unit | `npx vitest run tests/engine/mustering-out.test.ts -t "cash limit"` | Wave 0 |
| MSTR-02 | Benefits with rank bonus | unit | `npx vitest run tests/engine/mustering-out.test.ts -t "rank bonus"` | Wave 0 |
| MSTR-03 | Pension for 5+ terms | unit | `npx vitest run tests/engine/mustering-out.test.ts -t "pension"` | Wave 0 |
| MSTR-04 | Lost benefit on mishap | unit | `npx vitest run tests/engine/mustering-out.test.ts -t "mishap"` | Wave 0 |
| MSTR-05 | Combined rank for benefits | unit | `npx vitest run tests/engine/mustering-out.test.ts -t "combined rank"` | Wave 0 |
| SOCL-01 | Contacts tracked | unit | `npx vitest run tests/stores/character.test.ts -t "contacts"` | Wave 0 |
| SOCL-02 | Noble titles from SOC | unit | `npx vitest run tests/engine/career.test.ts -t "noble title"` | Wave 0 |
| D-09 | Golden-path test characters | integration | `npx vitest run tests/engine/golden-path.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/data/careers.test.ts` -- structural validation of all 12 career JSON files
- [ ] `tests/engine/career.test.ts` -- all career engine pure functions
- [ ] `tests/engine/aging.test.ts` -- aging mechanics
- [ ] `tests/engine/mustering-out.test.ts` -- mustering out mechanics
- [ ] `tests/data/life-events.test.ts` -- shared life events table validation
- [ ] `tests/engine/golden-path.test.ts` -- 3-5 pre-rolled character scenarios
- [ ] `tests/machines/creation.test.ts` -- EXTEND with career sub-state transitions

## Open Questions

1. **Core Rulebook PDF access**
   - What we know: The PDF exists at `Sourcebooks/MgT 2E - Core Rulebook (Printer Friendly).pdf` but cannot be read programmatically in this environment (pdftoppm not available).
   - What's unclear: The implementing agent needs direct access to transcribe all ~1,200 data entries.
   - Recommendation: The implementing agent MUST read the PDF for career tables, event tables, mishap tables, rank tables, skill tables, mustering out tables, aging tables, and commission/advancement targets. Use the canonical references section in CONTEXT.md to guide which pages to read.

2. **Event replay strategy for career mid-term**
   - What we know: Current `deriveReplayEvents()` handles education state restore by checking for education roll log entries.
   - What's unclear: How to reliably restore a user who was mid-term in their 3rd career when they refresh.
   - Recommendation: Store a `careerFlowPosition` string in Zustand that maps to the XState sub-state. On refresh, replay events to reach that position. Alternative: persist the full XState snapshot (XState 5 supports this via `.getPersistedSnapshot()`).

3. **Advancement forced-leave mechanic details**
   - What we know: CRER-13 says "roll <= terms served = must leave." The exact interpretation (raw dice vs modified roll) needs rulebook verification.
   - What's unclear: Whether this means the effect roll result or the raw dice total.
   - Recommendation: Verify against Core Rulebook during data transcription. Most interpretations use the raw advancement roll total (before DMs).

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/types/careers.ts`, `src/types/character.ts`, `src/engine/education.ts`, `src/data/education.ts`, `src/machines/creation.ts`, `src/stores/character.ts` -- all read and analyzed
- CONTEXT.md decisions (D-01 through D-18) -- locked design decisions
- Phase 2 implementation patterns -- verified working code

### Secondary (MEDIUM confidence)
- Core Rulebook PDF referenced in CONTEXT.md -- exists in `Sourcebooks/` but could not be read programmatically. Career rules knowledge based on Mongoose Traveller 2E general knowledge.

### Tertiary (LOW confidence)
- Exact aging table values, exact event table text, exact rank titles -- these MUST be verified against the Core Rulebook PDF during implementation. Research provides the structure but not the exact values.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries
- Architecture: HIGH -- directly extends established Phase 2 patterns with more data
- Pitfalls: HIGH -- based on actual codebase analysis and rules complexity assessment
- Career data values: LOW -- cannot read PDF; implementing agent must transcribe from source

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable -- no fast-moving dependencies)
