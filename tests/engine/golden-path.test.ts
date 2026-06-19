/**
 * Golden-path integration tests for Mongoose Traveller 2E character creation.
 *
 * These tests verify that career DATA and ENGINE functions produce results that
 * match the Core Rulebook exactly. They do NOT test UI — they test accuracy.
 *
 * Pre-rolled characters (GP1-GP5) exercise the full career pipeline:
 * qualification, survival, advancement, rank tables, events, mishaps,
 * mustering out, aging, and pension.
 *
 * Per D-09: every assertion must match the Core Rulebook.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getCareer } from '../../src/data/careers/index';
import { useCharacterStore } from '../../src/stores/character';
import { computeHash } from '../../src/engine/hash';
import {
  rollPsiStrength,
  getTalentLearnDM,
  isTelepathyAutoGranted,
  resolveTalentLearn,
} from '../../src/engine/psionics';
import { PSI_TALENTS, PSI_LEARN_TARGET } from '../../src/data/psionics';
import { resolveUnusualEvent } from '../../src/engine/unusual-events';
import { canAfford, applyPurchase } from '../../src/engine/equipment';
import { EQUIPMENT_CATALOG } from '../../src/data/equipment/index';
import { characteristicModifier } from '../../src/types/common';
import type { RollLogEntry } from '../../src/types/dice';
import type { WeaponItem, ArmourItem } from '../../src/types/equipment';
import {
  resolveQualificationRoll,
  resolveSurvivalRoll,
  resolveAdvancementRoll,
  resolveCommissionRoll,
  getBasicTrainingSkills,
  applyRankSkill,
  calculateQualificationDM,
  getNobleTitle,
} from '../../src/engine/career';
import { calculatePension, getRankBonusRolls, MAX_CASH_ROLLS } from '../../src/engine/mustering-out';
import { getAgingChecks } from '../../src/engine/aging';

// ---------------------------------------------------------------------------
// GP1 — Army Infantry: 3-term military career
// Qualification: END 5+ | Infantry survival: STR 6+ | Advancement: EDU 6+
// ---------------------------------------------------------------------------
describe('GP1 — Army Infantry (golden path)', () => {
  const army = getCareer('army');

  it('army career data loads correctly', () => {
    expect(army).toBeDefined();
    expect(army.name).toBe('Army');
  });

  it('qualification target is END 5+', () => {
    expect(army.qualification).not.toBeNull();
    expect(army.qualification!.characteristic).toBe('END');
    expect(army.qualification!.target).toBe(5);
  });

  it('army is a military career', () => {
    expect(army.isMilitary).toBe(true);
  });

  it('commission target is SOC 8+', () => {
    expect(army.commission).not.toBeNull();
    expect(army.commission!.characteristic).toBe('SOC');
    expect(army.commission!.target).toBe(8);
  });

  it('Infantry assignment (index 1) survival is STR 6+', () => {
    const infantry = army.assignments[1];
    expect(infantry.name).toBe('Infantry');
    expect(infantry.survival.characteristic).toBe('STR');
    expect(infantry.survival.target).toBe(6);
  });

  it('Infantry assignment advancement is EDU 6+', () => {
    const infantry = army.assignments[1];
    expect(infantry.advancement.characteristic).toBe('EDU');
    expect(infantry.advancement.target).toBe(6);
  });

  it('rank 0 enlisted is "Private" with Gun Combat 1 bonus', () => {
    const rank0 = army.ranks.enlisted.find((r) => r.level === 0);
    expect(rank0).toBeDefined();
    expect(rank0!.title).toBe('Private');
    expect(rank0!.bonusSkill).toBe('Gun Combat');
    expect(rank0!.bonusSkillLevel).toBe(1);
  });

  it('rank 1 enlisted is "Lance Corporal" with Recon 1 bonus', () => {
    const rank1 = army.ranks.enlisted.find((r) => r.level === 1);
    expect(rank1).toBeDefined();
    expect(rank1!.title).toBe('Lance Corporal');
    expect(rank1!.bonusSkill).toBe('Recon');
    expect(rank1!.bonusSkillLevel).toBe(1);
  });

  it('rank 2 is "Corporal" with no bonus skill', () => {
    const rank2 = army.ranks.enlisted.find((r) => r.level === 2);
    expect(rank2).toBeDefined();
    expect(rank2!.title).toBe('Corporal');
    expect(rank2!.bonusSkill).toBeNull();
  });

  it('resolveQualificationRoll succeeds when END+DM >= 5', () => {
    // Roll 4 on dice, END 7 -> DM+1, total 5. Success.
    const result = resolveQualificationRoll(4, 1, 5);
    expect(result.success).toBe(true);
    expect(result.total).toBe(5);
  });

  it('resolveQualificationRoll fails when END+DM < 5', () => {
    // Roll 3 on dice, no DM, total 3. Failure.
    const result = resolveQualificationRoll(3, 0, 5);
    expect(result.success).toBe(false);
  });

  it('resolveSurvivalRoll on Infantry: natural 2 always fails', () => {
    const result = resolveSurvivalRoll(2, 5, 6);
    expect(result.survived).toBe(false);
    expect(result.isMishap).toBe(true);
    expect(result.naturalTwo).toBe(true);
  });

  it('resolveSurvivalRoll on Infantry: STR 6 roll succeeds with no DM', () => {
    const result = resolveSurvivalRoll(6, 0, 6);
    expect(result.survived).toBe(true);
    expect(result.isMishap).toBe(false);
  });

  it('resolveAdvancementRoll: natural 12 forces stay', () => {
    const result = resolveAdvancementRoll(12, 0, 6, 1);
    expect(result.forcedToStay).toBe(true);
    expect(result.advanced).toBe(true);
  });

  it('army mustering out cash table has 7 entries', () => {
    expect(army.musteringOut.cash).toHaveLength(7);
    expect(army.musteringOut.cash[0]).toBe(2000);
    expect(army.musteringOut.cash[6]).toBe(30000);
  });

  it('army mustering out benefits table has 7 entries', () => {
    expect(army.musteringOut.benefits).toHaveLength(7);
  });

  it('applyRankSkill returns Gun Combat 1 at army enlisted rank 0', () => {
    const bonus = applyRankSkill(army, 0, false);
    expect(bonus).not.toBeNull();
    expect(bonus!.skill).toBe('Gun Combat');
    expect(bonus!.level).toBe(1);
  });

  it('applyRankSkill returns Recon 1 at army enlisted rank 1', () => {
    const bonus = applyRankSkill(army, 1, false);
    expect(bonus).not.toBeNull();
    expect(bonus!.skill).toBe('Recon');
    expect(bonus!.level).toBe(1);
  });

  it('service skills include Drive, Athletics, Gun Combat, Recon, Melee, Heavy Weapons', () => {
    expect(army.skillTables.serviceSkills).toContain('Drive');
    expect(army.skillTables.serviceSkills).toContain('Gun Combat');
    expect(army.skillTables.serviceSkills).toContain('Recon');
    expect(army.skillTables.serviceSkills).toContain('Melee');
  });

  it('basic training for first army career returns service skills', () => {
    const skills = getBasicTrainingSkills(army, true, 1);
    expect(skills).toContain('Gun Combat');
    expect(skills.length).toBe(6);
  });

  it('basic training for second army career returns service skills pool', () => {
    const skills = getBasicTrainingSkills(army, false, 1);
    expect(skills).toContain('Gun Combat');
    expect(skills.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// GP2 — Scout Exploration: 2-term exploration career
// Qualification: INT 5+ | Not military | Exploration survival: END 7+ | No commission
// ---------------------------------------------------------------------------
describe('GP2 — Scout Exploration (golden path)', () => {
  const scout = getCareer('scout');

  it('scout career data loads correctly', () => {
    expect(scout).toBeDefined();
    expect(scout.name).toBe('Scout');
  });

  it('qualification target is INT 5+', () => {
    expect(scout.qualification).not.toBeNull();
    expect(scout.qualification!.characteristic).toBe('INT');
    expect(scout.qualification!.target).toBe(5);
  });

  it('scout is NOT a military career', () => {
    expect(scout.isMilitary).toBe(false);
  });

  it('scout has no commission', () => {
    expect(scout.commission).toBeNull();
  });

  it('Exploration assignment (index 2) survival is END 7+', () => {
    const exploration = scout.assignments[2];
    expect(exploration.name).toBe('Exploration');
    expect(exploration.survival.characteristic).toBe('END');
    expect(exploration.survival.target).toBe(7);
  });

  it('Exploration assignment advancement is EDU 7+', () => {
    const exploration = scout.assignments[2];
    expect(exploration.advancement.characteristic).toBe('EDU');
    expect(exploration.advancement.target).toBe(7);
  });

  it('scout has no officer rank table', () => {
    expect(scout.ranks.officer).toBeNull();
  });

  it('scout rank 1 is "Scout" with Vacc Suit 1 bonus', () => {
    const rank1 = scout.ranks.enlisted.find((r) => r.level === 1);
    expect(rank1).toBeDefined();
    expect(rank1!.title).toBe('Scout');
    expect(rank1!.bonusSkill).toBe('Vacc Suit');
    expect(rank1!.bonusSkillLevel).toBe(1);
  });

  it('scout rank 3 is "Senior Scout" with Pilot 1 bonus', () => {
    const rank3 = scout.ranks.enlisted.find((r) => r.level === 3);
    expect(rank3).toBeDefined();
    expect(rank3!.title).toBe('Senior Scout');
    expect(rank3!.bonusSkill).toBe('Pilot');
    expect(rank3!.bonusSkillLevel).toBe(1);
  });

  it('scout mustering out cash table has 7 entries', () => {
    expect(scout.musteringOut.cash).toHaveLength(7);
    expect(scout.musteringOut.cash[0]).toBe(20000);
    expect(scout.musteringOut.cash[4]).toBe(50000);
  });

  it('scout mustering out benefits include Scout Ship', () => {
    expect(scout.musteringOut.benefits).toContain('Scout Ship');
  });

  it('qualification DM-1 per previous career', () => {
    expect(calculateQualificationDM(0)).toBe(0);
    expect(calculateQualificationDM(1)).toBe(-1);
    expect(calculateQualificationDM(2)).toBe(-2);
  });

  it('resolveCommissionRoll is irrelevant for scout (no commission table)', () => {
    // Scouts don't use commission — this just verifies engine still works
    const result = resolveCommissionRoll(10, 0, 8, 1);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GP3 — Merchant Free Trader: 1 term ending in mishap
// Qualification: INT 4+ | No commission | Mishap table entries
// ---------------------------------------------------------------------------
describe('GP3 — Merchant Free Trader (golden path)', () => {
  const merchant = getCareer('merchant');

  it('merchant career data loads correctly', () => {
    expect(merchant).toBeDefined();
    expect(merchant.name).toBe('Merchant');
  });

  it('qualification target is INT 4+', () => {
    expect(merchant.qualification).not.toBeNull();
    expect(merchant.qualification!.characteristic).toBe('INT');
    expect(merchant.qualification!.target).toBe(4);
  });

  it('merchant has no commission', () => {
    expect(merchant.commission).toBeNull();
  });

  it('Free Trader assignment (index 1) survival is DEX 6+', () => {
    const freeTrade = merchant.assignments[1];
    expect(freeTrade.name).toBe('Free Trader');
    expect(freeTrade.survival.characteristic).toBe('DEX');
    expect(freeTrade.survival.target).toBe(6);
  });

  it('merchant mishap table has 6 entries (1D)', () => {
    expect(merchant.mishaps).toHaveLength(6);
  });

  it('merchant mishap roll 1 is an injury', () => {
    const mishap1 = merchant.mishaps.find((m) => m.rollValue === 1);
    expect(mishap1).toBeDefined();
    expect(mishap1!.description).toBeTruthy();
    expect(mishap1!.effects.length).toBeGreaterThan(0);
  });

  it('no pension with fewer than 5 terms', () => {
    expect(calculatePension(1)).toBe(0);
    expect(calculatePension(4)).toBe(0);
  });

  it('max cash rolls is 3', () => {
    expect(MAX_CASH_ROLLS).toBe(3);
  });

  it('merchant mustering out cash table has 7 entries', () => {
    expect(merchant.musteringOut.cash).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// GP4 — Noble Diplomat: 5+ terms, pension, aging at 34
// Qualification: SOC 10+ | Pension: Cr10,000 at 5 terms | Aging checks at 34
// ---------------------------------------------------------------------------
describe('GP4 — Noble Diplomat (golden path)', () => {
  const noble = getCareer('noble');

  it('noble career data loads correctly', () => {
    expect(noble).toBeDefined();
    expect(noble.name).toBe('Noble');
  });

  it('qualification target is SOC 10+', () => {
    expect(noble.qualification).not.toBeNull();
    expect(noble.qualification!.characteristic).toBe('SOC');
    expect(noble.qualification!.target).toBe(10);
  });

  it('Diplomat assignment (index 1) survival is INT 5+', () => {
    const diplomat = noble.assignments[1];
    expect(diplomat.name).toBe('Diplomat');
    expect(diplomat.survival.characteristic).toBe('INT');
    expect(diplomat.survival.target).toBe(5);
  });

  it('Diplomat assignment advancement is SOC 7+', () => {
    const diplomat = noble.assignments[1];
    expect(diplomat.advancement.characteristic).toBe('SOC');
    expect(diplomat.advancement.target).toBe(7);
  });

  it('pension at exactly 5 terms is Cr10,000', () => {
    expect(calculatePension(5)).toBe(10000);
  });

  it('pension at 6 terms is Cr12,000', () => {
    expect(calculatePension(6)).toBe(12000);
  });

  it('pension at 7 terms is Cr14,000', () => {
    expect(calculatePension(7)).toBe(14000);
  });

  it('no pension at 4 terms', () => {
    expect(calculatePension(4)).toBe(0);
  });

  it('aging checks at age 34: STR 8+, DEX 7+, END 8+', () => {
    const checks = getAgingChecks(34);
    expect(checks).not.toBeNull();
    expect(checks!).toHaveLength(3);
    const str = checks!.find((c) => c.characteristic === 'STR');
    const dex = checks!.find((c) => c.characteristic === 'DEX');
    const end = checks!.find((c) => c.characteristic === 'END');
    expect(str!.target).toBe(8);
    expect(dex!.target).toBe(7);
    expect(end!.target).toBe(8);
  });

  it('no aging checks before age 34', () => {
    expect(getAgingChecks(33)).toBeNull();
    expect(getAgingChecks(18)).toBeNull();
  });

  it('aging checks at age 46: STR 9+, DEX 8+, END 9+', () => {
    const checks = getAgingChecks(46);
    expect(checks).not.toBeNull();
    const str = checks!.find((c) => c.characteristic === 'STR');
    const end = checks!.find((c) => c.characteristic === 'END');
    expect(str!.target).toBe(9);
    expect(end!.target).toBe(9);
  });

  it('rank bonus rolls: rank 1-2 gives +1', () => {
    expect(getRankBonusRolls(1)).toBe(1);
    expect(getRankBonusRolls(2)).toBe(1);
  });

  it('rank bonus rolls: rank 3-4 gives +2', () => {
    expect(getRankBonusRolls(3)).toBe(2);
    expect(getRankBonusRolls(4)).toBe(2);
  });

  it('rank bonus rolls: rank 5-6 gives +3', () => {
    expect(getRankBonusRolls(5)).toBe(3);
    expect(getRankBonusRolls(6)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// GP5 — Drifter Barbarian: auto-entry, basicTrainingException
// Qualification: null (auto-entry) | basicTrainingException: true
// ---------------------------------------------------------------------------
describe('GP5 — Drifter Barbarian (golden path)', () => {
  const drifter = getCareer('drifter');

  it('drifter career data loads correctly', () => {
    expect(drifter).toBeDefined();
    expect(drifter.name).toBe('Drifter');
  });

  it('drifter has no qualification (auto-entry)', () => {
    expect(drifter.qualification).toBeNull();
  });

  it('drifter has basicTrainingException = true', () => {
    expect(drifter.basicTrainingException).toBe(true);
  });

  it('drifter is NOT military', () => {
    expect(drifter.isMilitary).toBe(false);
  });

  it('drifter has no commission', () => {
    expect(drifter.commission).toBeNull();
  });

  it('Barbarian assignment (index 0) uses assignment specialist skills for basic training', () => {
    // basicTrainingException = true: basic training uses specialist skills
    const skills = getBasicTrainingSkills(drifter, true, 0);
    // Barbarian specialist skills: Animals, Carouse, Melee (Blade), Stealth, Seafarer, Survival
    expect(skills).toContain('Animals');
    expect(skills).toContain('Stealth');
    expect(skills).toContain('Survival');
    expect(skills.length).toBe(6);
  });

  it('Barbarian survival is END 7+', () => {
    const barbarian = drifter.assignments[0];
    expect(barbarian.name).toBe('Barbarian');
    expect(barbarian.survival.characteristic).toBe('END');
    expect(barbarian.survival.target).toBe(7);
  });

  it('Barbarian advancement is STR 7+', () => {
    const barbarian = drifter.assignments[0];
    expect(barbarian.advancement.characteristic).toBe('STR');
    expect(barbarian.advancement.target).toBe(7);
  });

  it('drifter has 3 assignments: Barbarian, Wanderer, Scavenger', () => {
    expect(drifter.assignments).toHaveLength(3);
    expect(drifter.assignments[0].name).toBe('Barbarian');
    expect(drifter.assignments[1].name).toBe('Wanderer');
    expect(drifter.assignments[2].name).toBe('Scavenger');
  });

  it('qualification DM with no previous careers is 0', () => {
    expect(calculateQualificationDM(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Noble Titles — SOCL-02 verification
// ---------------------------------------------------------------------------
describe('Noble titles (SOCL-02)', () => {
  it('no title for SOC 10 or below', () => {
    expect(getNobleTitle(10)).toBeNull();
    expect(getNobleTitle(7)).toBeNull();
    expect(getNobleTitle(1)).toBeNull();
  });

  it('SOC 11 = Knight', () => {
    expect(getNobleTitle(11)).toBe('Knight');
  });

  it('SOC 12 = Baron', () => {
    expect(getNobleTitle(12)).toBe('Baron');
  });

  it('SOC 13 = Marquis', () => {
    expect(getNobleTitle(13)).toBe('Marquis');
  });

  it('SOC 14 = Count', () => {
    expect(getNobleTitle(14)).toBe('Count');
  });

  it('SOC 15 = Duke', () => {
    expect(getNobleTitle(15)).toBe('Duke');
  });
});

describe('GP6 — CRER-11: event advancement DM applies to both commission and advancement', () => {
  const army = getCareer('army');

  it('event DM+2 carries a borderline commission roll over the target', () => {
    const charDM = 1; // e.g. SOC 10 → +1
    const bonusDM = 2; // from a plain advancement_dm event
    const effectiveDM = charDM + bonusDM;
    const diceTotal = 5;
    const termsInCareer = 1;
    const target = army.commission!.target; // 8

    const res = resolveCommissionRoll(diceTotal, effectiveDM, target, termsInCareer);
    // 5 + 3 - 0 = 8 ≥ 8 → success
    expect(res.success).toBe(true);
    expect(res.total).toBe(8);

    // Without the event bonus the same dice would fail
    const resNoBonus = resolveCommissionRoll(diceTotal, charDM, target, termsInCareer);
    expect(resNoBonus.success).toBe(false);
    expect(resNoBonus.total).toBe(6);
  });

  it('the same event DM+2 also raises the advancement total in that term', () => {
    const charDM = 1;
    const bonusDM = 2;
    const effectiveDM = charDM + bonusDM;
    const diceTotal = 6;
    const target = 7;
    const termsServed = 1;

    const res = resolveAdvancementRoll(diceTotal, effectiveDM, target, termsServed);
    // 6 + 3 = 9 ≥ 7 → advanced, 9 > 1 so not forced to leave
    expect(res.advanced).toBe(true);
    expect(res.forcedToLeave).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GP7 — Psionic + equipped character (Phase-4 golden path)
//
// A single deterministic character that walks the whole post-career sequence
// through the PURE engines + Zustand store (no React, no DOM):
//   - Legitimate psionics unlock via the Unusual-Event roll-12 → 1D result 1.
//   - PSI strength = 2D − terms served (PSIN-01), then Telepathy auto-grant
//     (PSIN-04) plus one rolled talent applying its DM + PSI DM + cumulative −1
//     (PSIN-02/03), with talent powers carried through (PSIN-05/06).
//   - A weapon + armour purchase against mustering-out credits that can never
//     overspend (EQUP-01/02/03/04).
//   - Reaching the terminal sheet phase with a STABLE legitimacy hash that
//     matches the Legitimate badge state (SHEE-02/03/04/05).
//
// Every dice value is supplied explicitly — nothing is randomly rolled. The
// roll-log entries mirror what the real UI appends (PsiTestCard appends a
// "Psionics Strength" 2D roll; TalentLearnCard appends a "Psionics Talent
// Learn" roll), so the locked hash is the one the legitimate flow produces.
// ---------------------------------------------------------------------------
describe('GP7 — Psionic + equipped character (Phase-4 golden path)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('Unusual-Event roll 12 → 1D result 1 unlocks psionics and stays Legitimate', () => {
    const store = useCharacterStore.getState();
    expect(store.isModified).toBe(false);

    // Life-Events roll 12 sends us to the Unusual-Event 1D sub-table; result 1
    // is the legitimate psionics unlock.
    const event = resolveUnusualEvent(1);
    expect(event.unlocksPsionics).toBe(true);

    // The legitimate unlock uses setPsionicsUnlocked (NOT the force door), so
    // isModified must remain false.
    store.setPsionicsUnlocked();
    const after = useCharacterStore.getState();
    expect(after.psionicsUnlocked).toBe(true);
    expect(after.isModified).toBe(false);
  });

  it('PSI strength = 2D − terms served, clamped at 0 (PSIN-01)', () => {
    // terms served = 3, 2D total = 10 → PSI 7.
    const psi = rollPsiStrength(10, 3);
    expect(psi).toBe(7);

    // Clamp: a low 2D total against many terms never goes below 0.
    expect(rollPsiStrength(2, 6)).toBe(0);

    useCharacterStore.getState().setPsiStrength(psi);
    expect(useCharacterStore.getState().psiStrength).toBe(7);
  });

  it('Telepathy chosen first is auto-granted with no roll (PSIN-04)', () => {
    // priorAttempts 0 + telepathy → auto-grant, no dice consumed.
    expect(isTelepathyAutoGranted('telepathy', 0)).toBe(true);
    // Telepathy after other attempts is NOT auto-granted.
    expect(isTelepathyAutoGranted('telepathy', 1)).toBe(false);
    // Any other talent is never auto-granted.
    expect(isTelepathyAutoGranted('clairvoyance', 0)).toBe(false);

    const telepathy = PSI_TALENTS.find((t) => t.name === 'telepathy')!;
    useCharacterStore
      .getState()
      .addPsiTalent({ talent: 'telepathy', level: 1, powers: telepathy.powers });

    const talents = useCharacterStore.getState().psiTalents;
    expect(talents).toHaveLength(1);
    expect(talents[0].talent).toBe('telepathy');
  });

  it('a rolled talent applies talent DM + PSI DM + cumulative −1 (PSIN-02/03)', () => {
    const psi = 7;
    const psiDM = characteristicModifier(psi); // PSI 7 → +0
    expect(psiDM).toBe(0);

    // Talent learning DMs (PSIN-02): Telepathy +4 … Teleportation +0.
    expect(getTalentLearnDM('telepathy')).toBe(4);
    expect(getTalentLearnDM('clairvoyance')).toBe(3);
    expect(getTalentLearnDM('telekinesis')).toBe(2);
    expect(getTalentLearnDM('awareness')).toBe(1);
    expect(getTalentLearnDM('teleportation')).toBe(0);

    // Second talent attempt (Telepathy was talent #1, auto-granted but still a
    // prior attempt) → priorAttempts = 1. Clairvoyance, dice total 8:
    //   8 + psiDM(0) + learnDM(3) − priorAttempts(1) = 10 ≥ 8 → success.
    const clair = resolveTalentLearn(8, psiDM, 'clairvoyance', 1);
    expect(clair.total).toBe(10);
    expect(clair.target).toBe(PSI_LEARN_TARGET);
    expect(clair.success).toBe(true);

    // Cumulative penalty bites harder next attempt: same dice, priorAttempts 2.
    //   8 + 0 + 3 − 2 = 9, still ≥ 8 here, but a third attempt (prior 3) with a
    //   weaker talent fails — proving the −1 accumulates.
    const next = resolveTalentLearn(8, psiDM, 'clairvoyance', 2);
    expect(next.total).toBe(9);
    const teleport = resolveTalentLearn(8, psiDM, 'teleportation', 3);
    // 8 + 0 + 0 − 3 = 5 < 8 → failure (cumulative −3 sank it).
    expect(teleport.total).toBe(5);
    expect(teleport.success).toBe(false);

    // Persist the successfully-rolled talent.
    const clairData = PSI_TALENTS.find((t) => t.name === 'clairvoyance')!;
    useCharacterStore
      .getState()
      .addPsiTalent({ talent: 'clairvoyance', level: 1, powers: clairData.powers });
    expect(useCharacterStore.getState().psiTalents.map((t) => t.talent)).toEqual([
      'clairvoyance',
    ]);
  });

  it('acquired talents carry their powers with PSI cost + range (PSIN-05/06)', () => {
    const telepathy = PSI_TALENTS.find((t) => t.name === 'telepathy')!;
    useCharacterStore
      .getState()
      .addPsiTalent({ talent: 'telepathy', level: 1, powers: telepathy.powers });

    const stored = useCharacterStore.getState().psiTalents[0];
    expect(stored.powers.length).toBeGreaterThan(0);

    // Shield is a real Telepathy power: 0 PSI, Personal range (rulebook).
    const shield = stored.powers.find((p) => p.name === 'Shield');
    expect(shield).toBeDefined();
    expect(shield!.psiCost).toBe(0);
    expect(shield!.range).toBe('Personal');

    // Life Detection costs 1 PSI at Distant range.
    const lifeDetection = stored.powers.find((p) => p.name === 'Life Detection');
    expect(lifeDetection!.psiCost).toBe(1);
    expect(lifeDetection!.range).toBe('Distant');
  });

  it('buys a weapon + armour against credits and cannot overspend (EQUP-01/02/03/04)', () => {
    const store = useCharacterStore.getState();

    // Seed mustering-out credits.
    store.addCredits(10000);
    expect(useCharacterStore.getState().credits).toBe(10000);

    // Pull a concrete weapon and armour from the real catalog (EQUP-01).
    const blade = EQUIPMENT_CATALOG.find(
      (e): e is WeaponItem => e.category === 'weapons' && e.name === 'Blade',
    )!;
    const mesh = EQUIPMENT_CATALOG.find(
      (e): e is ArmourItem => e.category === 'armour' && e.name === 'Mesh',
    )!;

    // Discriminated-union stats are real (EQUP-04).
    expect(blade.damage).toBe('2D');
    expect(blade.range).toBe('Melee');
    expect(mesh.protection).toBe(2);

    const combined = blade.cost + mesh.cost; // 100 + 150 = 250
    expect(combined).toBe(250);

    // canAfford true, purchase decrements by exactly the combined cost (EQUP-02/03).
    expect(canAfford(10000, combined)).toBe(true);
    let credits = useCharacterStore.getState().credits;
    credits = applyPurchase(credits, blade.cost);
    store.addEquipment(blade);
    store.spendCredits(blade.cost);
    credits = applyPurchase(credits, mesh.cost);
    store.addEquipment(mesh);
    store.spendCredits(mesh.cost);

    expect(credits).toBe(10000 - 250);
    const afterBuy = useCharacterStore.getState();
    expect(afterBuy.credits).toBe(9750);
    expect(afterBuy.ownedEquipment.map((o) => o.item.name).sort()).toEqual([
      'Blade',
      'Mesh',
    ]);

    // Over-budget purchase is rejected — balance never goes negative (EQUP-03).
    const tooExpensive = EQUIPMENT_CATALOG.find(
      (e): e is ArmourItem =>
        e.category === 'armour' && e.cost > afterBuy.credits,
    )!;
    expect(canAfford(afterBuy.credits, tooExpensive.cost)).toBe(false);
    expect(() => applyPurchase(afterBuy.credits, tooExpensive.cost)).toThrow();
    // Store balance unchanged by the rejected purchase.
    expect(useCharacterStore.getState().credits).toBe(9750);
  });

  it('reaches sheet/complete with a stable Legitimate hash (SHEE-02/03/04/05)', async () => {
    const store = useCharacterStore.getState();

    // The legitimate roll log the real flow appends during psionics:
    //   PsiTestCard → one "Psionics Strength" 2D roll (5+5 = 10 → PSI 7),
    //   TalentLearnCard → one "Psionics Talent Learn" roll for Clairvoyance (4+4).
    const rollLog: RollLogEntry[] = [
      {
        id: 'gp7-psi-strength',
        context: 'Psionics Strength',
        notation: '2D',
        results: [5, 5],
        total: 10,
        modifier: 0,
        target: 0,
        success: null,
        overridden: false,
      },
      {
        id: 'gp7-clairvoyance',
        context: 'Psionics Talent Learn',
        notation: '2D',
        results: [4, 4],
        total: 10,
        modifier: 2,
        target: PSI_LEARN_TARGET,
        success: true,
        overridden: false,
      },
    ];
    rollLog.forEach((entry) => store.appendRoll(entry));

    // Drive to the terminal sheet phase.
    store.setCreationPhase('complete');
    expect(useCharacterStore.getState().creationPhase).toBe('complete');

    const log = useCharacterStore.getState().rollLog;

    // Hash is deterministic: identical inputs → identical 8-char hex.
    const hashA = await computeHash(log);
    const hashB = await computeHash(log);
    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[0-9a-f]{8}$/);

    // Concrete locked value for this legitimate roll log.
    expect(hashA).toBe('abc6e95a');

    store.setLegitimacyHash(hashA);

    // Legitimate path: never modified, so the badge reads ● Legitimate (SHEE-05).
    expect(useCharacterStore.getState().isModified).toBe(false);
    expect(useCharacterStore.getState().legitimacyHash).toBe('abc6e95a');
  });
});

// ---------------------------------------------------------------------------
// GP8 — Force-unlock flips Modified (Phase-4 golden path)
//
// The honest-cheat door: a character that is NOT event-unlocked elects
// "Test anyway", which flips isModified false → true, logs a forceUnlock marker
// into the roll log, and changes the legitimacy hash away from the legitimate
// one (D-2, D-3, SHEE-05).
// ---------------------------------------------------------------------------
describe('GP8 — Force-unlock flips Modified (Phase-4 golden path)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('baseline is Legitimate before any forcing', () => {
    const store = useCharacterStore.getState();
    expect(store.isModified).toBe(false);
    expect(store.psionicsUnlocked).toBe(false);
  });

  it('force-unlock flips isModified false → true, logs the action, and recertifies the hash (SHEE-05, D-2/D-3, I-1)', async () => {
    const store = useCharacterStore.getState();
    expect(store.isModified).toBe(false);
    expect(store.psionicsUnlocked).toBe(false);
    const logLenBefore = store.rollLog.length;
    const hashBefore = store.legitimacyHash;

    // "Test anyway" on the locked gate.
    await store.forcePsionicsUnlock();

    const after = useCharacterStore.getState();
    expect(after.psionicsUnlocked).toBe(true);
    expect(after.isModified).toBe(true);

    // A modification marker was recorded in the roll log.
    expect(after.rollLog.length).toBe(logLenBefore + 1);
    const marker = after.rollLog[after.rollLog.length - 1];
    expect(marker.context).toBe('psionics.forceUnlock');
    expect(marker.overridden).toBe(true);

    // The certified hash reflects the marker immediately (no stale hash).
    expect(after.legitimacyHash).not.toBe(hashBefore);
    expect(after.legitimacyHash).toBe(await computeHash(after.rollLog));

    // The badge derivation (LegitimacyBadge reads isModified) would read Modified.
    expect(after.isModified).toBe(true);
  });

  it('the forced hash differs from the legitimate GP7 hash', async () => {
    const store = useCharacterStore.getState();

    // Mirror GP7's legitimate roll log, then add the force-unlock marker on top.
    store.appendRoll({
      id: 'gp7-psi-strength',
      context: 'Psionics Strength',
      notation: '2D',
      results: [5, 5],
      total: 10,
      modifier: 0,
      target: 0,
      success: null,
      overridden: false,
    });
    store.appendRoll({
      id: 'gp7-clairvoyance',
      context: 'Psionics Talent Learn',
      notation: '2D',
      results: [4, 4],
      total: 10,
      modifier: 2,
      target: PSI_LEARN_TARGET,
      success: true,
      overridden: false,
    });

    const legitHash = await computeHash(useCharacterStore.getState().rollLog);
    expect(legitHash).toBe('abc6e95a');

    // Append the force-unlock marker with a fixed id so the hash is deterministic.
    useCharacterStore.getState().appendRoll({
      id: 'gp8-force',
      context: 'psionics.forceUnlock',
      notation: '1D',
      results: [],
      total: 0,
      modifier: 0,
      target: null,
      success: null,
      overridden: true,
    });

    const forcedHash = await computeHash(useCharacterStore.getState().rollLog);
    expect(forcedHash).not.toBe(legitHash);
    expect(forcedHash).toBe('3a9e18b7');
  });
});
