# Phase 1: Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold, dice engine with roll log, SHA-256 legitimacy hash system, XState creation workflow skeleton, Zustand character data store, TypeScript type system, and CI/CD deployment to GitHub Pages. This is pure infrastructure — no UI beyond a minimal shell to verify the scaffold works.

</domain>

<decisions>
## Implementation Decisions

### Hash Display Format
- 8-character truncated hex display (e.g., `a3f7c2b1`)
- Full SHA-256 computed internally, first 8 hex chars shown on character sheet
- Click-to-copy on the hash for sharing via Discord/chat
- Two-state badge: "Legitimate" (green) vs "Modified" (amber)
- Verification page at `/verify` where users can paste character JSON to recompute and compare hash
- Hash computed from canonical serialization of roll log (roll ID + context + results only, no timestamps, sorted keys)

### Dice Rolling Feel
- Instant results with brief visual pop/highlight animation (~200ms)
- Individual die results shown as styled number chips (e.g., [4] [3] = 7)
- Full context displayed for every roll: what you're rolling for, target number, modifiers applied, result, pass/fail
- Optional sound effects (subtle click/roll sound, off by default, toggle in settings)

### App Visual Identity
- **Theme:** Sci-fi terminal — dark background, monospace accents, glowing borders, starfield feel (like a ship computer)
- **Dark/Light:** Both modes with toggle. Dark is default (fits theme), light available for readability
- **Typography:** Monospace for numbers/stats/dice results, clean sans-serif (Inter or system font) for body text and labels
- **Primary accent:** Scanner blue (electric/cyan) — classic sci-fi terminal, high readability on dark backgrounds
- **Overall feel:** Functional computer terminal, not flashy — data-forward with glowing highlights

### Stack (from research — locked)
- React 19 + TypeScript 5.9 + Vite 8
- XState 5 for creation workflow FSM
- Zustand + Immer for character data store
- Tailwind CSS v4 for styling
- Zod for runtime validation
- Vitest for testing
- Web Crypto API for dice (getRandomValues) and hash (SHA-256)
- GitHub Pages deployment via GitHub Actions

### Claude's Discretion
- Exact Tailwind config and theme token setup
- XState machine state naming conventions
- Zustand store slice structure
- CI/CD pipeline configuration details
- Zod schema organization
- Project folder structure (guided by ARCHITECTURE.md research)

</decisions>

<specifics>
## Specific Ideas

- Hash should feel like a starship serial number — compact, authoritative, verifiable
- Dice chips should have a brief "pop" animation, not a roll animation — speed over drama
- Full roll context is educational: helps users learn Traveller rules while creating
- The sci-fi terminal vibe should be subtle and functional, not cosplay — think ship's computer, not movie prop

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — this phase establishes the patterns

### Integration Points
- GitHub Pages deployment target
- PDF from Core Rulebook in repo root for reference during data encoding phases

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-19*
