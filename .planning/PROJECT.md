# StarMaker — Mongoose Traveller 2E Character Builder

## What This Is

A web-based character builder for Mongoose Traveller 2nd Edition, hosted on GitHub Pages. It implements the full character creation process from the Core Rulebook — characteristics, background skills, pre-career education (university/military academy), all 12 careers with their assignments, events, mishaps, benefits, aging, and mustering out. It also includes psionics and equipment selection. An "override mode" lets players revert/reroll any step for experimentation, while a cryptographic hash displayed on the character sheet indicates whether the character was generated legitimately (all dice as-rolled) or modified.

## Core Value

Faithful implementation of the Mongoose Traveller 2E character creation rules — every career, every table, every modifier — so players can trust the output matches the book.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] Characteristic generation (roll 2D for STR, DEX, END, INT, EDU, SOC with assignment) — Validated in Phase 2: Pre-Career Creation
- [x] Characteristic modifier calculation (DM table from 0/-3 to 15+/+3) — Validated in Phase 2: Pre-Career Creation
- [x] Background skills selection (EDU DM+3 skills from adolescence list) — Validated in Phase 2: Pre-Career Creation
- [x] Pre-career education: University (entry, skills, graduation, honours, benefits) — Validated in Phase 2: Pre-Career Creation
- [x] Pre-career education: Military Academy (Army/Marines/Navy, entry, skills, graduation, honours, benefits) — Validated in Phase 2: Pre-Career Creation
- [x] Pre-career education events table — Validated in Phase 2: Pre-Career Creation

### Active

<!-- Current scope. Building toward these. -->

- [ ] All 12 careers: Agent, Army, Citizen, Drifter, Entertainer, Marine, Merchant, Navy, Noble, Rogue, Scholar, Scout
- [ ] Career qualification rolls with DM-1 per previous career
- [ ] 3 assignments per career with specialist skill tables
- [ ] Basic training (service skills at level 0 for first career; one skill for subsequent)
- [ ] Survival rolls with mishap tables
- [ ] Event tables per career (2D, 36 entries each)
- [ ] Commission system (Army, Navy, Marines — with SOC 9+ extended eligibility)
- [ ] Advancement rolls with forced-leave mechanic and natural 12 lock-in
- [ ] Rank tables with bonus skills per rank
- [ ] Skills and training tables (Personal Development, Service Skills, Specialist, Officer, Advanced Education)
- [ ] Skill limits (max level 4, total ≤ 3 × (INT + EDU))
- [ ] Draft table (1D → career assignment)
- [ ] Changing careers and changing assignments rules
- [ ] Connections rule between characters (group creation support)
- [ ] Aging rolls (effects starting at age 34+)
- [ ] Mustering out: Cash table (max 3 rolls lifetime) and Benefits table
- [ ] Pension calculation for 5+ terms
- [ ] Psionics: PSI characteristic (2D minus terms served)
- [ ] Psionics: Institute testing and training (Cr100,000, 4 months)
- [ ] Psionics: All 5 talents — Telepathy, Clairvoyance, Telekinesis, Awareness, Teleportation
- [ ] Psionics: Psionic training table with learning DMs and -1 per previous attempt
- [ ] Psionics: Powers within each talent (Life Detection, Mind Link, Telekinetic Punch, etc.)
- [ ] Psionics: PSI cost, reach, and range band system
- [ ] Equipment catalog from Core Rulebook (weapons, armour, gear, tools)
- [ ] Equipment purchasing with credits from mustering out
- [ ] Life Events table (shared across careers)
- [ ] Contacts, Allies, Rivals, Enemies tracking
- [ ] Noble titles from Social Standing
- [ ] Skill package selection (post-creation group fill)
- [ ] Override mode: revert/reroll any dice roll at any step
- [ ] Legitimacy hash: cryptographic validation displayed on character sheet
- [ ] Hash visual indicator: clearly shows "legitimate" vs "modified" status
- [ ] Character sheet export (printable/saveable format)
- [ ] GitHub Pages hosting (static site, no backend)

### Out of Scope

- Vehicles/spacecraft construction — not part of character creation
- Space combat rules — combat system, not creation
- Trade rules — gameplay, not character building
- World/universe creation — separate subsystem
- Central Supply Catalogue equipment — Core Rulebook only
- High Guard expanded spacecraft — Core Rulebook only
- Traveller Companion alternate creation methods — Core Rulebook RAW only
- Multiplayer real-time collaboration — single-user tool (connections rule handled locally)
- User accounts/cloud save — GitHub Pages static site, local storage only

## Context

- **Source material:** Mongoose Traveller 2nd Edition Core Rulebook (Printer Friendly PDF in repo)
- **The creation process is deeply sequential:** characteristics → background → optional pre-career education → career terms (qualification → basic training → survival → events → commission → advancement → skills → aging → continue/leave) → mustering out → skill packages
- **Dice mechanics:** 2D (two six-sided dice added) is the fundamental roll. D66 (tens + units) used for event tables. 1D for skill tables and draft.
- **Override mode rationale:** Traveller RAW is notoriously unforgiving — characters can die during creation, get stuck in careers they didn't want, or end up with poor stats. Override mode lets players experiment while the hash system preserves integrity for GMs who want RAW characters.
- **The hash system:** Must be deterministic — same sequence of rolls → same hash. Override mode changes are trackable. Hash should be compact enough to include on a printed character sheet.
- **Career data is table-heavy:** Each of the 12 careers has qualification, survival, advancement, commission (military), 6 rank entries, 4-5 skill tables × 6 entries each, events table (12 entries), mishap table (6 entries), cash table (7 entries), benefits table (7 entries). This is a LOT of structured data to encode.
- **Equipment catalog** covers personal weapons (melee + ranged), armour, survival gear, electronics, medical supplies, and more — all with TL requirements, costs, and stats.

## Constraints

- **Hosting:** GitHub Pages — must be a static site (HTML/CSS/JS), no server-side processing
- **Source material:** Core Rulebook only — no supplements or expansions
- **Rules fidelity:** Must match published rules exactly in "legitimate" mode; override mode clearly marked
- **Accessibility:** Should work on desktop browsers; mobile is nice-to-have
- **Data extraction:** All career tables, event tables, equipment stats must be manually encoded from the PDF

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static site on GitHub Pages | No backend needed; character creation is client-side logic + data | — Pending |
| Hash-based legitimacy system | Allows GMs to verify RAW compliance without trust issues | — Pending |
| Core Rulebook only | Scope control; supplements can be added as future milestones | — Pending |
| Override mode as toggle, not default | Preserves the Traveller creation experience while allowing experimentation | — Pending |

---
*Last updated: 2026-04-03 after Phase 2 re-verification — Pre-Career Creation verified (18/18 must-haves, all UAT gaps closed)*
