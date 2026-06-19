import type { PsiTalentData } from '../types/psionics';

/**
 * Flat target a psionic-talent learning roll must meet or exceed.
 *
 * Learning a talent is an Average (8+) PSI check (Core Rulebook, Psionics,
 * "Psionic Training"). Confirmed by the worked example: a roll totalling 6
 * fails and a roll totalling 10 succeeds.
 */
export const PSI_LEARN_TARGET = 8;

/**
 * The five common psionic talents and their powers, transcribed from the
 * Mongoose Traveller 2E Core Rulebook (Psionics chapter, pp. 196-202).
 *
 * Learning DMs (Psionic Training table): Telepathy +4, Clairvoyance +3,
 * Telekinesis +2, Awareness +1, Teleportation +0.
 *
 * Awareness powers have no Reach (they are used only on the Traveller
 * himself); they are recorded with range "Personal". Powers with a variable
 * PSI cost record the base cost and note the scaling in the description.
 */
export const PSI_TALENTS: readonly PsiTalentData[] = [
  {
    name: 'telepathy',
    learnDM: 4,
    powers: [
      {
        name: 'Life Detection',
        talent: 'telepathy',
        psiCost: 1,
        range: 'Distant',
        description:
          'Sense the presence of other minds, their number, general type (animal, human, etc.) and approximate location. Shielded minds are undetectable. Easy (4+) Telepathy check.',
      },
      {
        name: 'Mind Link',
        talent: 'telepathy',
        psiCost: 1,
        range: 'Distant',
        description:
          'Create a lasting telepathic link with another telepath. Both must use this power; they may then communicate silently for minutes equal to the combined Effects of their checks. Easy (4+) Telepathy check.',
      },
      {
        name: 'Telempathy',
        talent: 'telepathy',
        psiCost: 1,
        range: 'Long',
        description:
          'Read or project emotions and basic feelings. Useful for handling animals and as a psychological weapon. The Effect judges the strength of the emotion projected. Routine (6+) Telepathy check.',
      },
      {
        name: 'Read Surface Thoughts',
        talent: 'telepathy',
        psiCost: 2,
        range: 'Long',
        description:
          "Read the active, current thoughts of another individual, who (if not a telepath) is unaware. Telepaths cannot be read unless they lower their shields. The Effect determines clarity. Average (8+) Telepathy check.",
      },
      {
        name: 'Send Thoughts',
        talent: 'telepathy',
        psiCost: 2,
        range: 'Distant',
        description:
          'Send thoughts to others, who need not be telepathic to receive them. Telepaths may close their shields against unwanted transmissions. Difficult (10+) Telepathy check.',
      },
      {
        name: 'Suggestion',
        talent: 'telepathy',
        psiCost: 3,
        range: 'Short',
        description:
          'Implant a thought, idea or command into another mind, interpreted as their own. Unless plainly harmful it is followed; on Effect 6+ even suicidal suggestions are obeyed. Very Difficult (12+) Telepathy check.',
      },
      {
        name: 'Probe',
        talent: 'telepathy',
        psiCost: 4,
        range: 'Close',
        description:
          "Delve deep into a subject's mind to read innermost thoughts and force them to divulge specific information; deliberate untruths are detected. Cannot be used against a shielded mind. Very Difficult (12+) Telepathy check.",
      },
      {
        name: 'Assault',
        talent: 'telepathy',
        psiCost: 8,
        range: 'Short',
        description:
          'A telepathic attack. Against an unshielded mind the target is rendered unconscious and suffers Effect x 3 damage; against a shielded mind, opposed Telepathy checks determine the outcome. Formidable (14+) Telepathy check.',
      },
      {
        name: 'Shield',
        talent: 'telepathy',
        psiCost: 0,
        range: 'Personal',
        description:
          'A mental shield protecting against unwanted telepathic interference, automatically in force at all times and requiring no PSI to maintain. May be lowered to allow telepathic contact or use of telepathic powers.',
      },
    ],
  },
  {
    name: 'clairvoyance',
    learnDM: 3,
    powers: [
      {
        name: 'Sense',
        talent: 'clairvoyance',
        psiCost: 1,
        range: 'Very Distant',
        description:
          'Sense the most rudimentary characteristics of a distant location (e.g. "a room containing four dogs"). The Traveller states the range; the Effect determines accuracy and clarity. Routine (6+) Clairvoyance check.',
      },
      {
        name: 'Tactical Awareness',
        talent: 'clairvoyance',
        psiCost: 2,
        range: 'Long',
        description:
          'Perceive dangers and foes around the Traveller, ignoring darkness, smoke, fog and similar effects, and detect hidden foes within range. The Effect determines how many combat rounds it lasts. Average (8+) Clairvoyance check.',
      },
      {
        name: 'Clairvoyance',
        talent: 'clairvoyance',
        psiCost: 1,
        range: 'Very Distant',
        description:
          'View a situation at a displaced point. The Traveller states the range; the Effect determines the level of detail perceived. Average (8+) Clairvoyance check.',
      },
      {
        name: 'Clairaudience',
        talent: 'clairvoyance',
        psiCost: 1,
        range: 'Very Distant',
        description:
          'Identical to clairvoyance, except that it allows hearing instead of seeing. Average (8+) Clairvoyance check.',
      },
      {
        name: 'Clairsentience',
        talent: 'clairvoyance',
        psiCost: 1,
        range: 'Very Distant',
        description:
          'Both see and hear a specific displaced situation. Difficult (10+) Clairvoyance check.',
      },
    ],
  },
  {
    name: 'telekinesis',
    learnDM: 2,
    powers: [
      {
        name: 'Microkinesis',
        talent: 'telekinesis',
        psiCost: 3,
        range: 'Close',
        description:
          'Fine manipulation of very small or microscopic objects: picking locks, microsurgery, sabotaging a computer system and so forth. Difficult (10+) Telekinesis check.',
      },
      {
        name: 'Telekinesis',
        talent: 'telekinesis',
        psiCost: 1,
        range: 'Short',
        description:
          'Move objects at range as if physically handling them. The Effect determines duration in combat rounds; PSI spent determines the mass moved (1 PSI per 100kg). Average (8+) Telekinesis check.',
      },
      {
        name: 'Flight',
        talent: 'telekinesis',
        psiCost: 5,
        range: 'Personal',
        description:
          'Apply telekinesis to one’s own body to fly or levitate, for a number of rounds equal to the Effect at fifteen metres per round. Difficult (10+) Telekinesis check.',
      },
      {
        name: 'Telekinetic Punch',
        talent: 'telekinesis',
        psiCost: 1,
        range: 'Short',
        description:
          'A direct telekinetic attack; damage inflicted equals the Effect, with armour protection applied as normal. Average (8+) Telekinesis check.',
      },
      {
        name: 'Pyrokinesis',
        talent: 'telekinesis',
        psiCost: 3,
        range: 'Short',
        description:
          'Excite the substance of an object to raise its temperature. By Effect: 0-4 warmer but undamaged; 5-8 burnt, 1D damage; 9+ 2D damage and may burst into flame if flammable. Routine (6+) Telekinesis check.',
      },
    ],
  },
  {
    name: 'awareness',
    learnDM: 1,
    powers: [
      {
        name: 'Suspended Animation',
        talent: 'awareness',
        psiCost: 3,
        range: 'Personal',
        description:
          'Enter a suspended-animation state (like cold sleep but without its danger) for 7 days without food or water and with minimal air. May be stopped at any time given external stimulus. Average (8+) Awareness check.',
      },
      {
        name: 'Enhanced Strength',
        talent: 'awareness',
        psiCost: 1,
        range: 'Personal',
        description:
          'Convert PSI points to STR on a temporary basis (PSI Cost = STR increase). STR peaks immediately, holds for Effect x 10 minutes, then declines 1 point per minute to normal. Average (8+) Awareness check.',
      },
      {
        name: 'Enhanced Endurance',
        talent: 'awareness',
        psiCost: 1,
        range: 'Personal',
        description:
          'Convert PSI points to END on a temporary basis (PSI Cost = END increase). END peaks immediately, holds for Effect x 10 minutes, then declines 1 point per minute to normal. Average (8+) Awareness check.',
      },
      {
        name: 'Fortitude',
        talent: 'awareness',
        psiCost: 1,
        range: 'Personal',
        description:
          'Channel psychic energy to absorb damage (PSI Cost = amount of Armour). Lasts a number of rounds equal to the Effect and provides Armour equal to the PSI expended, stacking with worn armour. Difficult (10+) Awareness check.',
      },
      {
        name: 'Inspiration',
        talent: 'awareness',
        psiCost: 1,
        range: 'Personal',
        description:
          'Psionic enhancement adds a Boon to any one check the Traveller attempts within the next minute. Average (8+) Awareness check.',
      },
      {
        name: 'Regeneration',
        talent: 'awareness',
        psiCost: 1,
        range: 'Personal',
        description:
          'Heal wounds, exchanging one PSI point to regenerate one lost characteristic point (PSI Cost = amount healed). May grow new limbs or organs and heal old wounds, but not counteract ageing or restore SOC. Difficult (10+) Awareness check.',
      },
    ],
  },
  {
    name: 'teleportation',
    learnDM: 0,
    powers: [
      {
        name: 'Teleportation',
        talent: 'teleportation',
        psiCost: 2,
        range: 'Distant',
        description:
          'Instantaneous movement of one’s body from one point to another, regardless of intervening matter. Carrying clothing and up to 10kg raises the check to Difficult (10+) and +2 PSI; up to 500kg raises it to Very Difficult (12+) and +4 PSI. Requires pre-knowledge of the destination. Average (8+) Teleportation check.',
      },
    ],
  },
] as const;
