# Pitfalls Research: StarMaker

**Researched:** 2026-03-19
**Domain:** TTRPG Character Builder (Mongoose Traveller 2E)
**Confidence:** HIGH

## Critical Pitfalls

### P1: Data Transcription Errors

**Severity:** CRITICAL
**When it hits:** Career data encoding phase
**Warning signs:** Tests fail against known character builds; players report "that's not what the book says"

The Core Rulebook contains ~1,200 structured data entries across 12 careers. Each career has:
- Qualification roll (characteristic + target)
- Survival roll per assignment (3 assignments × characteristic + target)
- Advancement roll per assignment
- Commission roll (military careers only)
- Rank table (6 ranks, some with bonus skills)
- 4-5 skill tables × 6 entries each
- Events table (12 entries with complex effects)
- Mishap table (6 entries with complex effects)
- Cash table (7 entries)
- Benefits table (7 entries)

**Prevention strategy:**
1. Type-safe career data schema — TypeScript interfaces that enforce structure
2. Automated validation: every career must have exactly the right number of entries per table
3. Test suite with known character builds from the book/community — "Archetype Alice joined the Marines, rolled X on event table, should get Y"
4. Cross-reference tests: every skill mentioned in career tables must exist in the skill list
5. Peer review: a second pass through every career table against the PDF

**Phase mapping:** Career data encoding phase — this IS the phase where this pitfall lives

---

### P2: State Machine / Undo Complexity

**Severity:** CRITICAL
**When it hits:** When override mode is added, or when trying to implement undo
**Warning signs:** "Just one more useState"; state bugs where going back breaks going forward; undo produces impossible states

Traveller creation is not a simple linear wizard. It has:
- Conditional branching (pre-career education is optional, available only terms 1-3)
- Loops (career terms repeat until leaving)
- Nested decisions (within a term: survival → event → commission → advancement → skills)
- Forced exits (failed survival, advancement ≤ terms, career changes)
- Forced stays (natural 12 on advancement)
- Cross-term dependencies (DM-1 per previous career on qualification; max 3 cash rolls lifetime)

**Prevention strategy:**
1. **Event sourcing from day one.** The character state is derived from a sequence of events (rolls, choices). Undo = remove events and replay. Override = replace event and replay.
2. **XState for workflow, not character data.** XState manages "where are you in creation" — Zustand holds "what does the character look like." Don't try to put all state in XState.
3. **Design the roll log format before writing any dice code.** The hash depends on it. The undo system depends on it. Getting this wrong means rewriting everything.
4. **Snapshot at every decision point.** Even if event sourcing is the primary mechanism, snapshots provide fast restoration without full replay.

**Phase mapping:** Foundation phase — state architecture must be right from the start

---

### P3: Traveller Rules Edge Cases

**Severity:** HIGH
**When it hits:** Throughout development, but especially during career term implementation
**Warning signs:** Players say "your tool doesn't handle X" where X is an obscure but real rule

**The "Looks Done But Isn't" Checklist:**

1. **Citizen/Drifter basic training exception** — These careers use assignment skill tables for basic training, NOT service skills like everyone else
2. **Skill level 4 cap during creation** — Skills can't exceed 4 during creation (can exceed later in play)
3. **Total skill levels ≤ 3 × (INT + EDU)** — This is a hard cap most generators ignore
4. **Commission + Advancement interaction** — Can't advance in the same term you gain commission; commission DMs from events apply
5. **Natural 12 on advancement = forced to stay** — Player has no choice
6. **Advancement roll ≤ terms served = forced to leave** — Even if player wants to stay
7. **Draft is once per lifetime** — Can't be drafted twice
8. **DM-1 per previous career on qualification** — Cumulative, applies to every new career attempt
9. **Cash table max 3 rolls lifetime** — Across ALL careers, not per career
10. **Pre-career education timing** — Available terms 1-3 only, DM-1 in term 2, DM-2 in term 3
11. **Military academy failed graduation but not 2-** — Can still auto-enter the career but no commission roll
12. **Changing assignments varies by career** — Some are same-career (Army, Navy, etc.), some are treated as new careers (Agent, Citizen, etc.)
13. **Benefits from rank** — Rank 1-2 = +1 benefit roll, rank 3-4 = +2, rank 5-6 = +3 AND DM+1 on tables

**Prevention strategy:**
1. Encode every rule in the checklist as a specific test case
2. Create "golden path" test characters that exercise each edge case
3. Keep the rulebook PDF as reference and cite page numbers in code comments
4. Handle each rule as a guard/constraint in the state machine, not as UI-level validation

**Phase mapping:** Career engine phase and testing

---

### P4: Hash System Design Flaws

**Severity:** HIGH
**When it hits:** When implementing the legitimacy verification system
**Warning signs:** Hash changes when it shouldn't (non-deterministic); hash is too long to type; can't distinguish legitimate from modified; hash can be spoofed

**Common mistakes:**
1. **Non-deterministic serialization** — JSON.stringify doesn't guarantee key order. Roll log must use a canonical serialization.
2. **Hash too long** — Full SHA-256 is 64 hex chars. Too long for a character sheet. Need truncation strategy (first 8-12 chars with collision analysis).
3. **No way to verify** — If only the client generates and checks hashes, what stops someone from just manually setting "legitimate = true"? The hash must be self-verifying: given the roll log, anyone can recompute and check.
4. **Override detection ambiguity** — Must be crystal clear: was ANY roll overridden? Not "how many" or "which ones" — just "all legit" vs "some modified."
5. **Timestamp sensitivity** — Don't include timestamps in the hash input. Only roll results and choices matter.

**Prevention strategy:**
1. Canonical serialization: sort keys, use a deterministic format (not JSON.stringify)
2. Hash = SHA-256 of ordered roll log entries (roll ID, context, results only — no timestamps)
3. Two-state system: "Legitimate" (green, hash displayed) vs "Modified" (amber, different hash)
4. Include a verification page: paste roll log JSON → recompute hash → compare
5. Truncate to 8 characters for display, full hash available on hover/click

**Phase mapping:** Foundation phase — must be designed alongside dice engine

---

### P5: Scope Creep via Supplements

**Severity:** MEDIUM
**When it hits:** After core is working, when users request Central Supply Catalogue, High Guard, Traveller Companion support
**Warning signs:** "Just add one more career from this book"; career data format doesn't accommodate new fields; hardcoded assumptions about 12 careers

**Prevention strategy:**
1. **Data-driven architecture from the start.** Career definitions are data, not code. Adding a career = adding a data file, not changing logic.
2. **Explicit Core Rulebook boundary.** Tag all data as `source: "core-rulebook"`. Future supplements add data with different source tags.
3. **Don't accommodate unknown future data.** Design for Core Rulebook data shape. If supplements need different shapes, handle that WHEN adding supplements.
4. **Hard "no" on supplements for v1.** The scope is the Core Rulebook. Period. Track supplement requests in a backlog but don't design for them beyond the data-driven architecture.

**Phase mapping:** Data layer design — ensure extensibility without over-engineering

---

### P6: UX Overwhelm

**Severity:** MEDIUM
**When it hits:** When all features are implemented but the UI is a wall of options
**Warning signs:** Users don't know what to click next; career term feels like 15 separate forms; new users bounce

Traveller creation involves dozens of decisions per character. A term alone has: survival roll, event resolution, optional commission, advancement, skill selection, aging, continue/leave. With 3-5 terms, that's 30-50 individual interactions.

**Prevention strategy:**
1. **One thing at a time.** Each step shows only the current decision with context. Don't show the advancement roll while the player is still resolving their event.
2. **Progressive disclosure.** Show the character sheet building up on one side, current decision on the other. The sheet is read-only context; the decision panel is the focus.
3. **Smart defaults.** Pre-select the most common/obvious choice. Player can change it, but the default reduces cognitive load.
4. **Narrative framing.** "Your second term in the Marines begins..." feels better than "Term 2, Step 1: Survival Roll."
5. **Progress indicator.** Show where they are in the creation flow and how far they've come.

**Phase mapping:** UI/UX phase — but the wizard pattern should be established in the foundation

---

## Technical Debt Patterns

| Pattern | Risk | Mitigation |
|---------|------|------------|
| "We'll add types later" | Any → runtime errors in career resolution | TypeScript strict mode from day one |
| "Tests can wait" | Data errors ship to users | Test career data as it's encoded, not after |
| "Quick prototype UI" | Prototype becomes production | Component architecture from the start |
| Inline magic numbers | DM calculations scattered everywhere | Constants file for all Traveller numeric rules |

## Performance Traps

| Trap | When | Fix |
|------|------|-----|
| Re-computing hash on every keystroke | Equipment selection, skill naming | Debounce hash computation; only recompute on roll/choice events |
| Loading all career data upfront | Initial page load | Career data is small (~100KB total); lazy loading adds complexity for no gain. Just load it all. |
| PDF generation blocking UI | Export button | Web Worker or async generation with loading indicator |
| Re-rendering entire character sheet on every state change | Every interaction | Zustand selectors for granular subscriptions |

## Security Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage tampering | Users modify saved characters | The hash system catches this — tampered data won't match hash |
| Hash collision exploitation | Forge a "legitimate" hash for a modified character | SHA-256 with 8-char truncation has ~4 billion possibilities — sufficient for a game tool |
| XSS via character names | If names are rendered as HTML | React's default escaping handles this; avoid dangerouslySetInnerHTML |

## Recovery Strategies

If you're already deep in a pitfall:

| Pitfall | Recovery |
|---------|----------|
| P1 (data errors) | Add a "report data error" button; crowdsource corrections |
| P2 (state mess) | Introduce event sourcing layer between existing state and UI; migrate incrementally |
| P3 (rules wrong) | Fix-and-test: each bug report becomes a test case, then a fix |
| P4 (hash broken) | Version the hash algorithm; v2 hash coexists with v1 |
| P5 (scope creep) | Feature freeze; finish Core Rulebook before any supplements |
| P6 (UX overwhelm) | User testing with 3 people; fix the top 3 confusion points |

---
*Researched: 2026-03-19*
