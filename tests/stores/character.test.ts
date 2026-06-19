import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../../src/stores/character';
import type { RollLogEntry } from '../../src/types/dice';
import type { CareerTerm } from '../../src/types/careers';
import type { Contact } from '../../src/types/character';
import type { AcquiredPsiTalent } from '../../src/types/psionics';
import type { GearItem } from '../../src/types/equipment';

describe('Character Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCharacterStore.getState().resetCharacter();
  });

  it('has initial characteristics all set to 0', () => {
    const { characteristics } = useCharacterStore.getState();
    expect(characteristics.STR).toBe(0);
    expect(characteristics.DEX).toBe(0);
    expect(characteristics.END).toBe(0);
    expect(characteristics.INT).toBe(0);
    expect(characteristics.EDU).toBe(0);
    expect(characteristics.SOC).toBe(0);
  });

  it('setCharacteristic updates a single characteristic', () => {
    useCharacterStore.getState().setCharacteristic('STR', 9);
    expect(useCharacterStore.getState().characteristics.STR).toBe(9);
    // Others remain unchanged
    expect(useCharacterStore.getState().characteristics.DEX).toBe(0);
  });

  it('setCharacteristic does not mutate previous state snapshot', () => {
    const before = useCharacterStore.getState().characteristics;
    useCharacterStore.getState().setCharacteristic('STR', 12);
    const after = useCharacterStore.getState().characteristics;

    // The reference should be different (immutability)
    expect(before).not.toBe(after);
    // Old snapshot unchanged
    expect(before.STR).toBe(0);
    // New snapshot updated
    expect(after.STR).toBe(12);
  });

  it('addSkill adds to skills array', () => {
    useCharacterStore.getState().addSkill('Pilot', 1);
    const { skills } = useCharacterStore.getState();
    expect(skills).toHaveLength(1);
    expect(skills[0]).toEqual({ name: 'Pilot', level: 1 });
  });

  it('addSkill is idempotent — duplicate calls do not create duplicates', () => {
    useCharacterStore.getState().addSkill('Admin', 0);
    useCharacterStore.getState().addSkill('Admin', 0);
    useCharacterStore.getState().addSkill('Admin', 0);
    const { skills } = useCharacterStore.getState();
    expect(skills).toHaveLength(1);
    expect(skills[0]).toEqual({ name: 'Admin', level: 0 });
  });

  it('addSkill upgrades level if new level is higher', () => {
    useCharacterStore.getState().addSkill('Medic', 0);
    useCharacterStore.getState().addSkill('Medic', 2);
    const { skills } = useCharacterStore.getState();
    expect(skills).toHaveLength(1);
    expect(skills[0]).toEqual({ name: 'Medic', level: 2 });
  });

  it('addSkill does not downgrade existing higher level', () => {
    useCharacterStore.getState().addSkill('Pilot', 3);
    useCharacterStore.getState().addSkill('Pilot', 1);
    const { skills } = useCharacterStore.getState();
    expect(skills).toHaveLength(1);
    expect(skills[0]).toEqual({ name: 'Pilot', level: 3 });
  });

  it('updateSkillLevel modifies an existing skill', () => {
    useCharacterStore.getState().addSkill('Medic', 0);
    useCharacterStore.getState().updateSkillLevel('Medic', 2);
    const { skills } = useCharacterStore.getState();
    expect(skills[0]).toEqual({ name: 'Medic', level: 2 });
  });

  it('appendRoll adds to roll log without mutating', () => {
    const entry: RollLogEntry = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      context: 'characteristics.STR',
      notation: '2D',
      results: [4, 3],
      total: 7,
      modifier: 0,
      target: null,
      success: null,
      overridden: false,
    };

    const beforeLog = useCharacterStore.getState().rollLog;
    useCharacterStore.getState().appendRoll(entry);
    const afterLog = useCharacterStore.getState().rollLog;

    expect(afterLog).toHaveLength(1);
    expect(afterLog[0]).toEqual(entry);
    // Old snapshot unchanged
    expect(beforeLog).toHaveLength(0);
    expect(beforeLog).not.toBe(afterLog);
  });

  it('resetCharacter returns to initial state', () => {
    // Mutate state
    useCharacterStore.getState().setCharacteristic('INT', 10);
    useCharacterStore.getState().addSkill('Gun Combat', 1);
    useCharacterStore.getState().setModified();

    // Reset
    useCharacterStore.getState().resetCharacter();

    const state = useCharacterStore.getState();
    expect(state.characteristics.INT).toBe(0);
    expect(state.skills).toHaveLength(0);
    expect(state.isModified).toBe(false);
    expect(state.rollLog).toHaveLength(0);
    expect(state.legitimacyHash).toBe('');
  });

  it('setModified sets isModified to true', () => {
    expect(useCharacterStore.getState().isModified).toBe(false);
    useCharacterStore.getState().setModified();
    expect(useCharacterStore.getState().isModified).toBe(true);
  });

  it('setLegitimacyHash sets the hash string', () => {
    expect(useCharacterStore.getState().legitimacyHash).toBe('');
    useCharacterStore.getState().setLegitimacyHash('a3f7c2b1');
    expect(useCharacterStore.getState().legitimacyHash).toBe('a3f7c2b1');
  });

  it('setCharacteristic caps values at 15 maximum (CHAR-04)', () => {
    useCharacterStore.getState().setCharacteristic('STR', 18);
    expect(useCharacterStore.getState().characteristics.STR).toBe(15);
  });

  it('setCharacteristic allows values at or below 15', () => {
    useCharacterStore.getState().setCharacteristic('DEX', 12);
    expect(useCharacterStore.getState().characteristics.DEX).toBe(12);

    useCharacterStore.getState().setCharacteristic('END', 15);
    expect(useCharacterStore.getState().characteristics.END).toBe(15);
  });

  describe('Career state and actions', () => {
    const sampleTerm: CareerTerm = {
      career: 'army',
      assignment: 'Infantry',
      term: 1,
      rank: 0,
      skills: [{ name: 'Gun Combat', level: 1 }],
      events: ['Assigned to a peacekeeping role'],
    };

    const sampleContact: Contact = {
      type: 'ally',
      name: 'Captain Vance',
      notes: 'Met during first tour',
    };

    it('has correct initial career state', () => {
      const state = useCharacterStore.getState();
      expect(state.careerHistory).toEqual([]);
      expect(state.contacts).toEqual([]);
      expect(state.age).toBe(18);
      expect(state.cashRollsUsed).toBe(0);
      expect(state.credits).toBe(0);
      expect(state.pension).toBe(0);
      expect(state.benefits).toEqual([]);
      expect(state.drafted).toBe(false);
      expect(state.previousCareers).toEqual([]);
      expect(state.lastCareer).toBeNull();
    });

    it('addCareerTerm adds to careerHistory', () => {
      useCharacterStore.getState().addCareerTerm(sampleTerm);
      const { careerHistory } = useCharacterStore.getState();
      expect(careerHistory).toHaveLength(1);
      expect(careerHistory[0]).toEqual(sampleTerm);
    });

    it('addContact pushes contact with correct type', () => {
      useCharacterStore.getState().addContact(sampleContact);
      const { contacts } = useCharacterStore.getState();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].type).toBe('ally');
      expect(contacts[0].name).toBe('Captain Vance');
    });

    it('addContact tracks all contact types (SOCL-01)', () => {
      useCharacterStore.getState().addContact({ type: 'contact', name: 'A', notes: '' });
      useCharacterStore.getState().addContact({ type: 'ally', name: 'B', notes: '' });
      useCharacterStore.getState().addContact({ type: 'rival', name: 'C', notes: '' });
      useCharacterStore.getState().addContact({ type: 'enemy', name: 'D', notes: '' });
      const { contacts } = useCharacterStore.getState();
      expect(contacts).toHaveLength(4);
      expect(contacts.map((c) => c.type)).toEqual(['contact', 'ally', 'rival', 'enemy']);
    });

    it('setAge updates age', () => {
      useCharacterStore.getState().setAge(22);
      expect(useCharacterStore.getState().age).toBe(22);
    });

    it('addCredits adds to existing credits total', () => {
      useCharacterStore.getState().addCredits(10000);
      useCharacterStore.getState().addCredits(5000);
      expect(useCharacterStore.getState().credits).toBe(15000);
    });

    it('setPension sets pension amount', () => {
      useCharacterStore.getState().setPension(10000);
      expect(useCharacterStore.getState().pension).toBe(10000);
    });

    it('addBenefit pushes benefit to array', () => {
      useCharacterStore.getState().addBenefit('Weapon');
      useCharacterStore.getState().addBenefit('Ship Share');
      expect(useCharacterStore.getState().benefits).toEqual(['Weapon', 'Ship Share']);
    });

    it('incrementCashRolls increments correctly', () => {
      useCharacterStore.getState().incrementCashRolls();
      expect(useCharacterStore.getState().cashRollsUsed).toBe(1);
      useCharacterStore.getState().incrementCashRolls();
      expect(useCharacterStore.getState().cashRollsUsed).toBe(2);
      useCharacterStore.getState().incrementCashRolls();
      expect(useCharacterStore.getState().cashRollsUsed).toBe(3);
    });

    it('setDrafted sets drafted to true', () => {
      useCharacterStore.getState().setDrafted();
      expect(useCharacterStore.getState().drafted).toBe(true);
    });

    it('addPreviousCareer tracks previous careers', () => {
      useCharacterStore.getState().addPreviousCareer('army');
      useCharacterStore.getState().addPreviousCareer('scout');
      expect(useCharacterStore.getState().previousCareers).toEqual(['army', 'scout']);
    });

    it('setLastCareer updates last career', () => {
      useCharacterStore.getState().setLastCareer('navy');
      expect(useCharacterStore.getState().lastCareer).toBe('navy');
      useCharacterStore.getState().setLastCareer(null);
      expect(useCharacterStore.getState().lastCareer).toBeNull();
    });

    it('reduceCharacteristic reduces by amount', () => {
      useCharacterStore.getState().setCharacteristic('STR', 8);
      useCharacterStore.getState().reduceCharacteristic('STR', 3);
      expect(useCharacterStore.getState().characteristics.STR).toBe(5);
    });

    it('reduceCharacteristic clamps to 0 (never goes negative)', () => {
      useCharacterStore.getState().setCharacteristic('END', 2);
      useCharacterStore.getState().reduceCharacteristic('END', 5);
      expect(useCharacterStore.getState().characteristics.END).toBe(0);
    });

    it('resetCharacter resets all career fields to defaults', () => {
      // Set some career state
      useCharacterStore.getState().addCareerTerm(sampleTerm);
      useCharacterStore.getState().addContact(sampleContact);
      useCharacterStore.getState().setAge(34);
      useCharacterStore.getState().addCredits(50000);
      useCharacterStore.getState().setPension(10000);
      useCharacterStore.getState().addBenefit('Weapon');
      useCharacterStore.getState().incrementCashRolls();
      useCharacterStore.getState().setDrafted();
      useCharacterStore.getState().addPreviousCareer('army');
      useCharacterStore.getState().setLastCareer('army');

      // Reset
      useCharacterStore.getState().resetCharacter();

      const state = useCharacterStore.getState();
      expect(state.careerHistory).toEqual([]);
      expect(state.contacts).toEqual([]);
      expect(state.age).toBe(18);
      expect(state.cashRollsUsed).toBe(0);
      expect(state.credits).toBe(0);
      expect(state.pension).toBe(0);
      expect(state.benefits).toEqual([]);
      expect(state.drafted).toBe(false);
      expect(state.previousCareers).toEqual([]);
      expect(state.lastCareer).toBeNull();
    });
  });

  describe('post-career: psionics + equipment', () => {
    const sampleTalent: AcquiredPsiTalent = {
      talent: 'telepathy',
      level: 0,
      powers: [],
    };

    const sampleGear: GearItem = {
      name: 'Binoculars',
      category: 'tools',
      tl: 5,
      cost: 50,
      mass: 1,
      traits: [],
      description: '',
    };

    it('has correct psionics + equipment defaults', () => {
      const state = useCharacterStore.getState();
      expect(state.psionicsUnlocked).toBe(false);
      expect(state.psiStrength).toBeNull();
      expect(state.psiTalents).toHaveLength(0);
      expect(state.ownedEquipment).toHaveLength(0);
    });

    it('setPsionicsUnlocked sets the flag without touching isModified (D-2)', () => {
      expect(useCharacterStore.getState().isModified).toBe(false);
      useCharacterStore.getState().setPsionicsUnlocked();
      expect(useCharacterStore.getState().psionicsUnlocked).toBe(true);
      // Legitimate path: must NOT flip Modified
      expect(useCharacterStore.getState().isModified).toBe(false);
    });

    it('forcePsionicsUnlock sets flag, flips isModified, logs a marker, and recomputes the hash (SHEE-05, I-1)', async () => {
      const beforeLogLength = useCharacterStore.getState().rollLog.length;
      const beforeHash = useCharacterStore.getState().legitimacyHash;
      await useCharacterStore.getState().forcePsionicsUnlock();
      const state = useCharacterStore.getState();
      expect(state.psionicsUnlocked).toBe(true);
      expect(state.isModified).toBe(true);
      expect(state.rollLog).toHaveLength(beforeLogLength + 1);
      expect(state.rollLog[state.rollLog.length - 1].context).toBe('psionics.forceUnlock');
      // The certified hash must reflect the new marker entry immediately, not
      // remain stale until the next logged roll.
      expect(state.legitimacyHash).not.toBe(beforeHash);
      expect(state.legitimacyHash).not.toBe('');
    });

    it('setPsiStrength stores the value (including 0)', () => {
      useCharacterStore.getState().setPsiStrength(0);
      expect(useCharacterStore.getState().psiStrength).toBe(0);
      useCharacterStore.getState().setPsiStrength(7);
      expect(useCharacterStore.getState().psiStrength).toBe(7);
    });

    it('addPsiTalent pushes an acquired talent', () => {
      useCharacterStore.getState().addPsiTalent(sampleTalent);
      const { psiTalents } = useCharacterStore.getState();
      expect(psiTalents).toHaveLength(1);
      expect(psiTalents[0]).toEqual(sampleTalent);
    });

    it('addEquipment pushes new item at quantity 1 and increments same-name item', () => {
      useCharacterStore.getState().addEquipment(sampleGear);
      let owned = useCharacterStore.getState().ownedEquipment;
      expect(owned).toHaveLength(1);
      expect(owned[0].quantity).toBe(1);
      expect(owned[0].item.name).toBe('Binoculars');

      // Same name -> increment, length stays 1
      useCharacterStore.getState().addEquipment(sampleGear);
      owned = useCharacterStore.getState().ownedEquipment;
      expect(owned).toHaveLength(1);
      expect(owned[0].quantity).toBe(2);
    });

    it('removeEquipment decrements quantity and prunes at zero', () => {
      useCharacterStore.getState().addEquipment(sampleGear);
      useCharacterStore.getState().addEquipment(sampleGear);
      expect(useCharacterStore.getState().ownedEquipment[0].quantity).toBe(2);

      useCharacterStore.getState().removeEquipment('Binoculars');
      expect(useCharacterStore.getState().ownedEquipment[0].quantity).toBe(1);

      useCharacterStore.getState().removeEquipment('Binoculars');
      expect(useCharacterStore.getState().ownedEquipment).toHaveLength(0);
    });

    it('removeEquipment is a no-op for an unowned name', () => {
      useCharacterStore.getState().addEquipment(sampleGear);
      useCharacterStore.getState().removeEquipment('Nonexistent');
      expect(useCharacterStore.getState().ownedEquipment).toHaveLength(1);
      expect(useCharacterStore.getState().ownedEquipment[0].quantity).toBe(1);
    });

    it('spendCredits subtracts and clamps at zero (EQUP-03)', () => {
      useCharacterStore.getState().addCredits(100);
      useCharacterStore.getState().spendCredits(30);
      expect(useCharacterStore.getState().credits).toBe(70);

      useCharacterStore.getState().spendCredits(1000);
      expect(useCharacterStore.getState().credits).toBe(0);
    });

    it('resetCharacter clears all post-career fields back to defaults', () => {
      useCharacterStore.getState().forcePsionicsUnlock();
      useCharacterStore.getState().setPsiStrength(9);
      useCharacterStore.getState().addPsiTalent(sampleTalent);
      useCharacterStore.getState().addEquipment(sampleGear);

      useCharacterStore.getState().resetCharacter();

      const state = useCharacterStore.getState();
      expect(state.psionicsUnlocked).toBe(false);
      expect(state.psiStrength).toBeNull();
      expect(state.psiTalents).toHaveLength(0);
      expect(state.ownedEquipment).toHaveLength(0);
    });
  });
});
