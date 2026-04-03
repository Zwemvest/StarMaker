# Phase 3: Career Lifecycle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 03-career-lifecycle
**Areas discussed:** Career term flow UX, Career data strategy, Multi-career transitions, Mustering out & aging

---

## Career Term Flow UX

| Option | Description | Selected |
|--------|-------------|----------|
| Step-by-step cards | Each phase of the term is a card that resolves inline. Matches Phase 2 education pattern. | ✓ |
| All-at-once term summary | Roll everything then show summary. Faster but less dramatic. | |
| Hybrid: auto-resolve + pause on choices | Auto-resolve rolls, pause for choices. | |

**User's choice:** Step-by-step cards
**Notes:** Consistent with established Phase 2 patterns.

| Option | Description | Selected |
|--------|-------------|----------|
| Vertical timeline | Terms stack vertically. Completed terms collapse. | ✓ |
| Horizontal carousel | Terms as horizontal cards. | |
| Tabbed terms | Each term gets a tab. | |

**User's choice:** Vertical timeline

| Option | Description | Selected |
|--------|-------------|----------|
| Narrative event cards | Same pattern as education events. | ✓ |
| Compact event rows | Single highlighted row. | |
| You decide | | |

**User's choice:** Narrative event cards

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed skill tables | Show tables as tabs, user picks table then selects. | ✓ |
| Combined pool with table labels | All skills in one pool, tagged by table. | |
| You decide | | |

**User's choice:** Tabbed skill tables

| Option | Description | Selected |
|--------|-------------|----------|
| Dramatic reveal | Target, DM, Roll button. Animate. Pass/fail with effects. | ✓ |
| Inline auto-roll | Auto-roll when term starts. | |
| You decide | | |

**User's choice:** Dramatic reveal for survival rolls

| Option | Description | Selected |
|--------|-------------|----------|
| Career summary section | Collapsible career history in character panel. | ✓ |
| Minimal — stats only | Keep panel focused on characteristics. | |
| You decide | | |

**User's choice:** Career summary section in character panel

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential cards | Commission card then advancement card, each with roll buttons. | ✓ |
| Combined military progress card | Both rolls on one card. | |
| You decide | | |

**User's choice:** Sequential commission + advancement cards

| Option | Description | Selected |
|--------|-------------|----------|
| Decision card with context | Shows rank, terms, age, warnings, pension eligibility. | ✓ |
| Simple prompt | Clean modal Yes/No. | |
| You decide | | |

**User's choice:** Decision card with context for continue/leave

---

## Career Data Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Typed TS constants | Same pattern as Phase 2 education data. | |
| JSON data files | Raw JSON files with Zod validation. | ✓ |
| You decide | | |

**User's choice:** JSON data files
**Notes:** Departure from Phase 2 pattern — user prefers JSON for easier editing/diffing of large data sets.

| Option | Description | Selected |
|--------|-------------|----------|
| Golden-path test characters | 3-5 pre-rolled characters verified against expected output. | |
| Structural tests only | Test data shapes, not values. | |
| Both structural + golden-path | Most thorough. | ✓ |

**User's choice:** Both structural + golden-path testing

| Option | Description | Selected |
|--------|-------------|----------|
| One JSON per career + Zod | 12 JSON files in src/data/careers/. | ✓ |
| Single careers.json + Zod | All in one file. | |
| You decide | | |

**User's choice:** One JSON per career + Zod

---

## Multi-Career Transitions

| Option | Description | Selected |
|--------|-------------|----------|
| Choice card | "Qualification Failed" with Draft or Drifter options. | ✓ |
| Auto-route to Drifter | Default Drifter, option for Draft. | |
| You decide | | |

**User's choice:** Choice card for qualification failure

| Option | Description | Selected |
|--------|-------------|----------|
| Career grid with info cards | 12 cards showing qualification info and DM. | ✓ |
| Dropdown with details panel | Compact dropdown + detail panel. | |
| You decide | | |

**User's choice:** Career grid with info cards

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-cards under career | 3 assignment cards expand after career selection. | ✓ |
| Inline radio selection | Simple radio buttons. | |
| You decide | | |

**User's choice:** Sub-cards for assignment selection

| Option | Description | Selected |
|--------|-------------|----------|
| Always accessible | Career history in character panel, collapsible, live updates. | ✓ |
| End-of-creation summary only | Only shown at end. | |
| You decide | | |

**User's choice:** Always accessible career history

---

## Mustering Out & Aging

| Option | Description | Selected |
|--------|-------------|----------|
| Roll-by-roll card sequence | User picks table per roll, clicks Roll, result inline. | ✓ |
| Batch roll summary | Roll all at once, show summary. | |
| You decide | | |

**User's choice:** Roll-by-roll mustering out

| Option | Description | Selected |
|--------|-------------|----------|
| Warning card at term end | Aging card after term resolves with characteristic decreases. | ✓ |
| Passive stat updates | Silent stat changes. | |
| You decide | | |

**User's choice:** Warning card for aging

| Option | Description | Selected |
|--------|-------------|----------|
| Highlight in continue/leave card | "One more term = pension!" teaser. | ✓ |
| Only show at muster out | Pension info only at end. | |
| You decide | | |

**User's choice:** Pension highlighted in continue/leave card

| Option | Description | Selected |
|--------|-------------|----------|
| List in character panel | Collapsible contacts section. | ✓ |
| End-of-creation summary | Only on final sheet. | |
| You decide | | |

**User's choice:** Contacts/Allies/Rivals/Enemies in character panel

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-display in panel | Title shown next to SOC when 10+. | ✓ |
| Final sheet only | Title only on completed sheet. | |
| You decide | | |

**User's choice:** Noble titles auto-displayed in panel

---

## Claude's Discretion

- JSON schema structure for career data
- Career card visual treatment and grid layout
- Timeline collapse/expand animation
- Mishap card visual treatment
- Skill table tab styling
- Citizen/Drifter basic training exception handling
- Skill limit enforcement (warnings vs hard blocks)

## Deferred Ideas

None — discussion stayed within phase scope
