# Phase 2: Pre-Career Creation - Research

**Researched:** 2026-03-19
**Domain:** React UI components, drag-and-drop interactions, XState nested states, Traveller 2E pre-career rules
**Confidence:** HIGH

## Summary

Phase 2 transforms StarMaker from a foundation-only project into a user-facing application. It introduces the wizard shell (progress bar, content area, character panel, hash bar), three creation steps (characteristics, background skills, education), and the drag-and-drop interaction pattern that will be reused throughout the app. The existing engine layer (dice, hash, roll-log) and state management (XState machine, Zustand store) are solid foundations -- this phase builds the UI and data layers on top.

The primary technical challenges are: (1) implementing a polished drag-and-drop "assign values to slots" pattern, (2) expanding the XState machine with nested sub-states for the characteristic and education flows, (3) encoding the Traveller 2E pre-career education rules with their branching logic (university vs academy, entry rolls, events, graduation/honours), and (4) establishing the component architecture that all future phases will build upon.

**Primary recommendation:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop (mature, accessible, well-documented), CSS transitions for the 200ms slide animations (no need for a full animation library for simple transitions), and expand the XState machine with hierarchical nested states for the characteristic assignment and education sub-flows.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Top horizontal progress bar with step indicators (completed/current/locked states)
- Steps: Characteristics -> Background Skills -> Education -> Career -> Muster Out
- Completed steps clickable for read-only review; current step stays active
- Main content left, live character summary panel right
- Slim bottom bar: 8-char legitimacy hash + Legitimate/Modified badge + collapsible roll log drawer toggle
- Slide animation (~200ms) for step transitions (left/right based on direction)
- Explicit "Continue" button to advance -- no auto-progression
- Roll all 6 values at once ("Roll All" button), then assign to stats via drag-and-drop
- 2x3 grid layout: Physical (STR/DEX/END) left, Mental (INT/EDU/SOC) right
- Live DM preview: hovering a value over a slot shows resulting modifier in real-time
- Individual die results shown as styled number chips (e.g., [4][3] = 7)
- Card selection UI for education: University, Military Academy, Skip to Career
- Military Academy card offers branch sub-selection (Army/Marines/Navy)
- Entry roll results displayed inline on card
- Success: card glows, "Admitted!" with skill grants listed
- Failure: "Entry denied" with inline options "Try again (term N, DM penalty)" or "Skip to career"
- Skills earned during failed education terms highlighted as retained
- Education events displayed as narrative cards with flavor text + mechanical effects + choice buttons
- Drag-from-pool into numbered slots for background skill picker (consistent with characteristic assignment)
- Number of slots = EDU DM + 3 (0 to 6), dynamically calculated
- Available skills grouped by type (Physical, Mental, Social, Technical)
- Brief tooltips on hover showing what each skill covers
- Subtle relevance markers on commonly-used skills
- Pool dims when all slots filled; drag out to free and re-enable pool
- Same drag-from-pool + numbered slots pattern reused for ALL skill selections throughout creation

### Claude's Discretion
- Exact drag-and-drop library/implementation approach
- Responsive breakpoints for side panel collapse
- Tooltip content wording
- Relevance marker design (dot, icon, border, etc.)
- Roll log drawer height and scroll behavior
- Exact animation easing curves
- Skill category groupings for the adolescence list
- Progress bar visual treatment (connected dots, segmented bar, etc.)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAR-01 | User can roll 2D for each of the 6 characteristics | Dice engine `roll2D()` exists; need `rollDice(2,6)` for individual die results; UI "Roll All" button + number chips |
| CHAR-02 | User can assign rolled values to characteristics in any order | dnd-kit drag-from-pool-to-slot pattern; DndContext + droppable slots |
| CHAR-03 | Characteristic DMs auto-calculated from modifier table | `characteristicModifier()` already exists in `src/types/common.ts` |
| CHAR-04 | Maximum unaugmented characteristic score enforced at 15 | Validation guard on assignment -- 2D max is 12, so only relevant for future augmentation; enforce in store |
| BGSK-01 | User can select EDU DM+3 background skills (0 to 6) from adolescence list | Drag-from-pool-to-slots pattern; slot count = `characteristicModifier(EDU) + 3` |
| BGSK-02 | Background skills granted at level 0 | `addSkill(name, 0)` in Zustand store |
| EDUC-01 | User can choose University or Military Academy (Army/Marines/Navy) | Card selection UI; XState education sub-states |
| EDUC-02 | University entry roll EDU 7+ with term-based DMs and SOC bonus | Roll engine + modifier calculation + target check |
| EDUC-03 | Military Academy entry rolls (Army END 8+, Marines END 9+, Navy INT 9+) with term DMs | Branch-specific entry requirements data structure |
| EDUC-04 | Pre-career education available terms 1-3 only, with increasing DM penalties | XState guard on education state; term tracking with DM-1 per previous attempt |
| EDUC-05 | University skills selection (level 0 and level 1 from specified list) and EDU +1 | Skill picker + characteristic increment |
| EDUC-06 | Military Academy basic training (all service skills of tied career at level 0) | Career service skills data needed (subset of Phase 3 data) |
| EDUC-07 | Graduation roll with honours possibility (11+), all graduation benefits | Roll check + conditional benefits application |
| EDUC-08 | Pre-career education events table (2D, 12 entries) fully implemented | Event data structure + narrative card UI + choice handling |
| EDUC-09 | Failed graduation: no benefits, but skills earned during term retained | State management: track skills-earned-this-term separately |
| EDUC-10 | Academy graduation without honours but failed 2-: auto-entry but no commission | Complex conditional logic in graduation resolution |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Already in project |
| XState | 5.28+ | Workflow state machine | Already in project; nested states for sub-flows |
| @xstate/react | 6.1+ | React bindings for XState | Already in project |
| Zustand | 5.x | Character data store | Already in project with Immer |
| Tailwind CSS | 4.x | Styling | Already in project with @theme block |
| Vitest | 4.x | Testing | Already in project |

### New Dependencies
| Library | Version | Purpose | Why This One |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.x | Drag-and-drop primitives | Mature, accessible, React-native, 12KB gzipped core, excellent TypeScript support |
| @dnd-kit/sortable | ^8.x | Sortable preset for ordered slots | Built-in `arrayMove`, `useSortable` hook combines draggable+droppable |
| @dnd-kit/utilities | ^3.x | CSS transform utilities | Required by sortable for smooth transforms |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit | pragmatic-drag-and-drop | Smaller bundle but less React-idiomatic; built on HTML5 DnD API which has quirks with custom drag previews. dnd-kit has better DX for the "pool to slots" pattern we need |
| @dnd-kit | react-dnd | Older, heavier, less maintained; dnd-kit is the modern replacement |
| motion (framer-motion) | CSS transitions | For ~200ms slide animations, CSS transitions are sufficient and add zero bundle weight. Motion would be overkill |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── wizard/
│   │   ├── WizardShell.tsx          # Top-level layout: progress + content + hash bar
│   │   ├── ProgressBar.tsx          # Horizontal step indicators
│   │   ├── StepContainer.tsx        # Slide-animated step wrapper
│   │   └── HashBar.tsx              # Bottom bar: hash + badge + roll log toggle
│   ├── character-panel/
│   │   └── CharacterPanel.tsx       # Right-side live summary
│   ├── characteristics/
│   │   ├── CharacteristicsStep.tsx  # Roll All + assign flow
│   │   ├── DicePool.tsx             # Draggable rolled values
│   │   ├── StatSlot.tsx             # Droppable characteristic slot
│   │   └── DiceChip.tsx             # Styled [4][3] = 7 display
│   ├── background-skills/
│   │   ├── BackgroundSkillsStep.tsx # Skill picker step
│   │   ├── SkillPool.tsx            # Available skills grouped by category
│   │   └── SkillSlot.tsx            # Numbered skill slot
│   ├── education/
│   │   ├── EducationStep.tsx        # Education choice + flow
│   │   ├── EducationCard.tsx        # University/Academy/Skip card
│   │   ├── EntryRollResult.tsx      # Inline roll result display
│   │   ├── EventCard.tsx            # Narrative event card
│   │   └── GraduationResult.tsx     # Graduation outcome display
│   ├── shared/
│   │   ├── DragPool.tsx             # Reusable drag-from-pool component
│   │   ├── DropSlot.tsx             # Reusable numbered drop slot
│   │   ├── DiceDisplay.tsx          # Individual die result chips
│   │   └── RollLogDrawer.tsx        # Collapsible roll log
│   └── ui/
│       ├── Button.tsx               # Styled button variants
│       ├── Card.tsx                 # Base card component
│       └── Tooltip.tsx              # Hover tooltip
├── data/
│   ├── background-skills.ts         # Adolescence skill list with categories
│   ├── education.ts                 # University/Academy rules, entry requirements, events table
│   └── education-events.ts          # Pre-career education events (2D, 12 entries)
├── engine/                          # (existing) dice, hash, roll-log
├── hooks/
│   ├── useCreationMachine.ts        # XState machine hook wrapper
│   └── useDragAssign.ts             # Reusable drag-to-slot logic
├── machines/
│   └── creation.ts                  # (existing, needs expansion with nested states)
├── stores/
│   └── character.ts                 # (existing, needs education state additions)
└── types/
    ├── education.ts                 # Education types (EducationType, AcademyBranch, etc.)
    └── skills.ts                    # Background skill types with categories
```

### Pattern 1: XState Nested States for Sub-Flows

**What:** Expand the flat `characteristics` and `education` states into hierarchical sub-states
**When to use:** Any multi-step process within a single wizard step

```typescript
// Expanded creation machine with nested states
states: {
  characteristics: {
    initial: 'rolling',
    states: {
      rolling: {
        // User clicks "Roll All" - rolls 6x 2D
        on: { ROLL_ALL: 'assigning' }
      },
      assigning: {
        // User drags values into stat slots
        on: {
          ASSIGN_COMPLETE: {
            target: 'review',
            guard: 'allCharacteristicsAssigned'
          }
        }
      },
      review: {
        // User sees final stats + DMs, clicks Continue
        on: { CONFIRM: '#creation.backgroundSkills' }
      }
    }
  },
  education: {
    initial: 'choosing',
    states: {
      choosing: {
        // Card selection: University / Academy / Skip
        on: {
          CHOOSE_UNIVERSITY: 'universityEntry',
          CHOOSE_ACADEMY: 'academyEntry',
          SKIP_EDUCATION: '#creation.career'
        }
      },
      universityEntry: {
        on: {
          ENTRY_SUCCESS: 'universityTerm',
          ENTRY_FAILURE: 'entryFailed'
        }
      },
      academyEntry: {
        on: {
          ENTRY_SUCCESS: 'academyTerm',
          ENTRY_FAILURE: 'entryFailed'
        }
      },
      entryFailed: {
        on: {
          RETRY: { target: 'choosing', guard: 'canRetryEducation' },
          SKIP: '#creation.career'
        }
      },
      universityTerm: {
        // Skill selection + events
        on: { TERM_COMPLETE: 'graduation' }
      },
      academyTerm: {
        // Basic training + events
        on: { TERM_COMPLETE: 'graduation' }
      },
      graduation: {
        on: {
          GRADUATED: 'graduated',
          GRADUATED_HONOURS: 'graduatedHonours',
          FAILED_GRADUATION: 'failedGraduation'
        }
      },
      graduated: {
        on: { CONTINUE: '#creation.career' }
      },
      graduatedHonours: {
        on: { CONTINUE: '#creation.career' }
      },
      failedGraduation: {
        // Skills retained, no benefits
        on: {
          RETRY: { target: 'choosing', guard: 'canRetryEducation' },
          CONTINUE: '#creation.career'
        }
      }
    }
  }
}
```

### Pattern 2: Drag-From-Pool-To-Slots (Reusable)

**What:** A shared interaction pattern where items are dragged from a source pool into numbered target slots
**When to use:** Characteristic assignment, background skill selection, and all future skill selections

```typescript
// Reusable hook for the drag-assign pattern
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

interface DragAssignConfig<T> {
  pool: T[];              // Available items
  slotCount: number;      // Number of target slots
  onAssign: (item: T, slotIndex: number) => void;
  onUnassign: (slotIndex: number) => void;
}

// The DndContext wraps the entire step
// Pool items use useDraggable()
// Slots use useDroppable()
// DragOverlay shows the item being dragged with live preview
```

### Pattern 3: Wizard Shell with Three Zones

**What:** Top-level layout establishing the three-zone pattern for all phases
**When to use:** Once -- the WizardShell is the root component replacing App.tsx placeholder

```typescript
// WizardShell layout
<div className="min-h-screen bg-terminal-bg flex flex-col">
  {/* Zone 1: Progress Bar */}
  <ProgressBar steps={steps} currentStep={currentStep} />

  {/* Zone 2: Content + Character Panel */}
  <div className="flex-1 flex">
    <main className="flex-1 p-6">
      <StepContainer direction={direction}>
        {currentStepComponent}
      </StepContainer>
    </main>
    <aside className="w-80 border-l border-terminal-surface p-4">
      <CharacterPanel />
    </aside>
  </div>

  {/* Zone 3: Hash Bar */}
  <HashBar hash={hash} isModified={isModified} />
</div>
```

### Anti-Patterns to Avoid
- **Duplicating state between XState and Zustand:** XState tracks workflow position only (which step, which sub-step). Zustand tracks character data only (stats, skills, rolls). Never store the same data in both.
- **Inline game rules in components:** All Traveller 2E rules (entry requirements, DMs, skill lists) belong in `src/data/` as typed constants. Components consume data, never define it.
- **Coupling drag-and-drop to a specific step:** The pool-to-slots pattern must be extracted into reusable shared components from the start. Do not build it inline in CharacteristicsStep and then refactor later.
- **Modal dialogs for roll results:** The decision is inline results on cards. Modals break flow.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop | Custom mouse/touch event handlers | @dnd-kit/core | Accessibility (keyboard, screen readers), touch support, collision detection, drag overlay are all complex to get right |
| Unique IDs | Manual counter or timestamp IDs | `crypto.randomUUID()` | Already used in roll-log; consistent pattern |
| Dice modifier lookup | Switch statement in components | `characteristicModifier()` from `src/types/common.ts` | Already exists, tested, canonical |
| Hash computation | Custom implementation | `computeHash()` from `src/engine/hash.ts` | Already exists with canonical serialization v1 |
| Roll logging | Manual array management | `createRollLogEntry()` + `appendToLog()` from `src/engine/roll-log.ts` | Already exists with full context tracking |

**Key insight:** Phase 1 built a solid engine layer. Phase 2 should NEVER duplicate engine logic -- always import and use existing functions.

## Common Pitfalls

### Pitfall 1: XState State ID Collisions
**What goes wrong:** Nested state targets like `'#creation.career'` fail silently if the machine ID doesn't match
**Why it happens:** XState v5 requires exact ID matching for cross-hierarchy transitions
**How to avoid:** Always use the machine's `id` property (e.g., `'creation'`) as prefix; test all transitions in unit tests
**Warning signs:** State machine stays stuck in a state after event is sent

### Pitfall 2: DnD Kit Sensor Configuration
**What goes wrong:** Drag starts immediately on click, preventing normal click interactions on draggable items
**Why it happens:** Default sensors have no activation delay
**How to avoid:** Configure `PointerSensor` with `activationConstraint: { distance: 8 }` to require 8px of movement before drag starts
**Warning signs:** Cannot click buttons on draggable items; drag starts on any mouse interaction

### Pitfall 3: Roll Log Consistency
**What goes wrong:** Legitimacy hash changes unexpectedly or doesn't update
**Why it happens:** Rolls are made but not logged, or logged in wrong order, or context string is inconsistent
**How to avoid:** Every `roll2D()` call MUST be immediately followed by `createRollLogEntry()` and `appendRoll()`. Use a wrapper function that does both atomically.
**Warning signs:** Hash doesn't match expected value; roll log entries missing

### Pitfall 4: Education Term Tracking
**What goes wrong:** User can attempt education more than 3 times, or DM penalties don't accumulate
**Why it happens:** Term counter not properly tracked across education retry attempts
**How to avoid:** Track `educationTermsUsed` in XState context; use guard `canRetryEducation` that checks `termsServed < 3`
**Warning signs:** User enters 4th education term; DM penalty is wrong

### Pitfall 5: Background Skill Count Edge Case
**What goes wrong:** EDU DM+3 produces negative slot count (EDU 0 -> DM -3 -> 0 slots) but UI shows empty state poorly
**Why it happens:** DM of -3 + 3 = 0 is valid but untested
**How to avoid:** Clamp minimum to 0 (it already is mathematically, but display "No background skills available" message); test with EDU values 0-15
**Warning signs:** Empty slot area with no explanation

### Pitfall 6: Failed Education Skill Retention
**What goes wrong:** Skills earned during a failed education term are lost
**Why it happens:** State rollback on failure removes all term changes including skills
**How to avoid:** Skills are added to Zustand store immediately when earned (during event resolution). Graduation failure only prevents graduation benefits (bonus skill levels, EDU+1). Skills already in store stay.
**Warning signs:** Character loses skills after failing graduation

## Code Examples

### Creating a Logged Roll (Wrapper Pattern)
```typescript
// src/hooks/useLoggedRoll.ts
import { rollDice } from '../engine/dice';
import { createRollLogEntry } from '../engine/roll-log';
import { computeHash } from '../engine/hash';
import { useCharacterStore } from '../stores/character';

export function useLoggedRoll() {
  const { appendRoll, rollLog, setLegitimacyHash } = useCharacterStore();

  const loggedRoll2D = async (
    context: string,
    modifier: number = 0,
    target?: number,
  ) => {
    const dice = rollDice(2, 6);
    const entry = createRollLogEntry(context, '2D', dice, modifier, target);
    appendRoll(entry);

    // Recompute hash with new entry
    const newLog = [...rollLog, entry];
    const hash = await computeHash(newLog);
    setLegitimacyHash(hash);

    return entry;
  };

  return { loggedRoll2D };
}
```

### Drag-From-Pool Droppable Slot
```typescript
// Droppable slot using @dnd-kit/core
import { useDroppable } from '@dnd-kit/core';

interface DropSlotProps {
  id: string;
  label: string;
  value: number | null;
  previewModifier?: number | null; // Live DM preview on hover
}

function DropSlot({ id, label, value, previewModifier }: DropSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 rounded-lg p-3 min-h-16 flex flex-col items-center justify-center
        transition-colors duration-150
        ${isOver ? 'border-scanner-blue bg-scanner-blue/10' : 'border-terminal-surface'}
        ${value !== null ? 'bg-terminal-surface' : 'bg-transparent'}
      `}
    >
      <span className="text-xs text-gray-400 uppercase">{label}</span>
      {value !== null && (
        <>
          <span className="text-2xl font-mono text-white">{value}</span>
          <span className="text-sm font-mono text-scanner-blue">
            DM {characteristicModifier(value) >= 0 ? '+' : ''}{characteristicModifier(value)}
          </span>
        </>
      )}
      {previewModifier !== null && value === null && (
        <span className="text-sm font-mono text-scanner-blue/50">
          DM {previewModifier >= 0 ? '+' : ''}{previewModifier}
        </span>
      )}
    </div>
  );
}
```

### Education Entry Requirements Data
```typescript
// src/data/education.ts
import type { CharacteristicId } from '../types/common';

export interface EducationPath {
  type: 'university' | 'academy';
  branch?: 'army' | 'marines' | 'navy';
  label: string;
  description: string;
  entryCharacteristic: CharacteristicId;
  entryTarget: number;
  socBonus: boolean; // SOC 9+ grants DM+1 for university
}

export const EDUCATION_PATHS: EducationPath[] = [
  {
    type: 'university',
    label: 'University',
    description: 'Academic education with skill training and EDU bonus',
    entryCharacteristic: 'EDU',
    entryTarget: 7,
    socBonus: true,
  },
  {
    type: 'academy',
    branch: 'army',
    label: 'Military Academy (Army)',
    description: 'Officer training for the Army',
    entryCharacteristic: 'END',
    entryTarget: 8,
    socBonus: false,
  },
  {
    type: 'academy',
    branch: 'marines',
    label: 'Military Academy (Marines)',
    description: 'Officer training for the Marines',
    entryCharacteristic: 'END',
    entryTarget: 9,
    socBonus: false,
  },
  {
    type: 'academy',
    branch: 'navy',
    label: 'Military Academy (Navy)',
    description: 'Officer training for the Navy',
    entryCharacteristic: 'INT',
    entryTarget: 9,
    socBonus: false,
  },
];

// DM penalty per previous education attempt
export const EDUCATION_TERM_DM = -1; // DM-1 per previous attempt

export const MAX_EDUCATION_TERMS = 3; // Available terms 1-3 only

// Graduation target: INT 7+ (varies by source, verify against rulebook)
export const GRADUATION_TARGET = 7;
export const HONOURS_THRESHOLD = 11; // 11+ on graduation roll = honours
```

### Step Transition Animation (CSS Only)
```typescript
// StepContainer with CSS slide animation
interface StepContainerProps {
  children: React.ReactNode;
  direction: 'left' | 'right';
  stepKey: string; // Unique key to trigger animation
}

function StepContainer({ children, direction, stepKey }: StepContainerProps) {
  return (
    <div
      key={stepKey}
      className={`
        animate-slide-in
        ${direction === 'right' ? 'slide-from-right' : 'slide-from-left'}
      `}
    >
      {children}
    </div>
  );
}

// In index.css, add to @theme or as utilities:
// @keyframes slide-in-right {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// }
// @keyframes slide-in-left {
//   from { transform: translateX(-100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// }
// .animate-slide-in { animation-duration: 200ms; animation-timing-function: ease-out; }
// .slide-from-right { animation-name: slide-in-right; }
// .slide-from-left { animation-name: slide-in-left; }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit or pragmatic-drag-and-drop | 2022+ | react-beautiful-dnd is deprecated by Atlassian |
| framer-motion package | motion package (motion.dev) | 2024 | Framer Motion rebranded; for this project CSS transitions suffice |
| XState v4 (interpret + createMachine) | XState v5 (setup + createMachine) | 2023 | Project already uses v5 patterns correctly |
| Class components for complex state | Hooks + XState actors | 2019+ | Already using hooks throughout |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Deprecated by Atlassian, replaced by pragmatic-drag-and-drop
- `react-dnd`: Still maintained but less active; dnd-kit is the modern choice
- `framer-motion` npm package: Still works but officially `motion` is the new package name

## Open Questions

1. **Exact pre-career education events table entries**
   - What we know: 2D roll (12 entries), events include narrative flavor + mechanical effects, some have player choices
   - What's unclear: Cannot extract exact table from PDF (no PDF tools available on this system); web sources only partially list entries
   - Recommendation: Transcribe directly from the Core Rulebook (Update 2022) p.16-18. Create a `src/data/education-events.ts` with all 12 entries. Each entry needs: roll range (2-12), description text, mechanical effects, and whether it requires player choice.

2. **University skill list specifics**
   - What we know: University grants choice of one Level 0 skill and one Level 1 skill from a specified list; on graduation both increase by 1
   - What's unclear: Exact skill list for university selection
   - Recommendation: Transcribe from Core Rulebook. Likely includes academic skills: Admin, Advocate, Animals, Art, Astrogation, Electronics, Engineer, Language, Medic, Navigation, Science, etc.

3. **Background skills (adolescence) list**
   - What we know: Skills available during adolescence, selected at Level 0, count = EDU DM + 3
   - What's unclear: Complete official list and whether it varies by homeworld type
   - Recommendation: Transcribe from Core Rulebook. The standard list typically includes: Admin, Animals, Art, Athletics, Carouse, Drive, Electronics, Flyer, Language, Mechanic, Medic, Profession, Science, Seafarer, Streetwise, Survival, Vacc Suit

4. **Starter Set vs Core Rulebook discrepancies**
   - What we know: Entry targets differ between editions (e.g., University entry EDU 6+ vs 7+)
   - What's unclear: Which values are canonical for the 2022 Update
   - Recommendation: Use Core Rulebook Update 2022 as the single source of truth. The REQUIREMENTS.md specifies EDU 7+ for university entry (EDUC-02), so follow that.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAR-01 | Roll 2D for 6 characteristics | unit | `npx vitest run tests/engine/characteristics.test.ts -t "roll" --reporter=verbose` | No - Wave 0 |
| CHAR-02 | Assign rolled values in any order | unit + integration | `npx vitest run tests/components/characteristics.test.ts --reporter=verbose` | No - Wave 0 |
| CHAR-03 | DM auto-calculation | unit | `npx vitest run tests/types/types.test.ts -t "modifier" --reporter=verbose` | Yes (partial) |
| CHAR-04 | Max unaugmented score at 15 | unit | `npx vitest run tests/stores/character.test.ts -t "max" --reporter=verbose` | No - Wave 0 |
| BGSK-01 | Select EDU DM+3 background skills | unit | `npx vitest run tests/data/background-skills.test.ts --reporter=verbose` | No - Wave 0 |
| BGSK-02 | Skills granted at level 0 | unit | `npx vitest run tests/stores/character.test.ts -t "background" --reporter=verbose` | No - Wave 0 |
| EDUC-01 | Choose University or Academy | unit | `npx vitest run tests/machines/creation.test.ts -t "education" --reporter=verbose` | No - Wave 0 |
| EDUC-02 | University entry roll EDU 7+ | unit | `npx vitest run tests/data/education.test.ts -t "university entry" --reporter=verbose` | No - Wave 0 |
| EDUC-03 | Academy entry rolls per branch | unit | `npx vitest run tests/data/education.test.ts -t "academy entry" --reporter=verbose` | No - Wave 0 |
| EDUC-04 | Education terms 1-3, DM penalties | unit | `npx vitest run tests/machines/creation.test.ts -t "term limit" --reporter=verbose` | No - Wave 0 |
| EDUC-05 | University skills + EDU +1 | unit | `npx vitest run tests/data/education.test.ts -t "university skills" --reporter=verbose` | No - Wave 0 |
| EDUC-06 | Academy basic training | unit | `npx vitest run tests/data/education.test.ts -t "academy training" --reporter=verbose` | No - Wave 0 |
| EDUC-07 | Graduation + honours | unit | `npx vitest run tests/data/education.test.ts -t "graduation" --reporter=verbose` | No - Wave 0 |
| EDUC-08 | Education events table | unit | `npx vitest run tests/data/education-events.test.ts --reporter=verbose` | No - Wave 0 |
| EDUC-09 | Failed graduation skill retention | integration | `npx vitest run tests/machines/creation.test.ts -t "failed graduation" --reporter=verbose` | No - Wave 0 |
| EDUC-10 | Academy grad no honours + failed 2- | unit | `npx vitest run tests/data/education.test.ts -t "no commission" --reporter=verbose` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/data/background-skills.test.ts` -- covers BGSK-01, BGSK-02
- [ ] `tests/data/education.test.ts` -- covers EDUC-02, EDUC-03, EDUC-05, EDUC-06, EDUC-07, EDUC-10
- [ ] `tests/data/education-events.test.ts` -- covers EDUC-08
- [ ] `tests/machines/creation.test.ts` -- expand for EDUC-01, EDUC-04, EDUC-09 (nested education states)
- [ ] `tests/components/characteristics.test.ts` -- covers CHAR-01, CHAR-02 (React Testing Library)
- [ ] `tests/stores/character.test.ts` -- expand for CHAR-04, BGSK-02 (max score, skill addition)
- [ ] Framework install: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` -- new dependency

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/machines/creation.ts`, `src/stores/character.ts`, `src/engine/*`, `src/types/*` -- direct code inspection
- REQUIREMENTS.md -- canonical requirement definitions including specific roll targets (EDUC-02: EDU 7+, EDUC-03: Army END 8+, Marines END 9+, Navy INT 9+)
- CONTEXT.md -- locked UI decisions from user discussion

### Secondary (MEDIUM confidence)
- [dnd-kit official docs](https://docs.dndkit.com/) -- API and patterns
- [XState v5 nested states](https://stately.ai/docs/states) -- hierarchical state configuration
- [Motion.dev docs](https://motion.dev/docs/react) -- animation library (evaluated, not recommended for this phase)
- [Mongoose Publishing forum threads](https://forum.mongoosepublishing.com/) -- Traveller 2E rule clarifications

### Tertiary (LOW confidence)
- Web search results on Traveller 2E education events table -- incomplete, needs verification against physical rulebook
- Web search on university/background skill lists -- partial, needs transcription from source material

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libraries already installed; dnd-kit is the clear modern choice
- Architecture: HIGH -- patterns follow established XState/Zustand separation; component structure is straightforward
- Pitfalls: HIGH -- well-known issues with dnd-kit sensor config, XState state IDs, and roll logging
- Game rules data: MEDIUM -- specific table contents (education events, skill lists) need transcription from Core Rulebook

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, no fast-moving dependencies)
