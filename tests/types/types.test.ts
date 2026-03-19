import { describe, it, expectTypeOf } from 'vitest';
import type { CharacteristicId, SkillLevel } from '../../src/types/common';
import type { DiceNotation, RollResult, RollLogEntry } from '../../src/types/dice';
import type { Character, Characteristics, Skill, CharacterInfo, Contact } from '../../src/types/character';
import type { CareerName, Assignment, Rank, CareerTerm, CareerHistory } from '../../src/types/careers';
import type { EquipmentCategory, Equipment } from '../../src/types/equipment';

describe('Type definitions compile correctly', () => {
  it('CharacteristicId is a union of 6 stats', () => {
    expectTypeOf<CharacteristicId>().toEqualTypeOf<'STR' | 'DEX' | 'END' | 'INT' | 'EDU' | 'SOC'>();
  });

  it('SkillLevel is a number', () => {
    expectTypeOf<SkillLevel>().toEqualTypeOf<number>();
  });

  it('DiceNotation includes expected values', () => {
    const notation: DiceNotation = '2D';
    expectTypeOf(notation).toMatchTypeOf<DiceNotation>();
  });

  it('RollResult has required fields', () => {
    expectTypeOf<RollResult>().toHaveProperty('notation');
    expectTypeOf<RollResult>().toHaveProperty('dice');
    expectTypeOf<RollResult>().toHaveProperty('total');
  });

  it('RollLogEntry has all required fields', () => {
    expectTypeOf<RollLogEntry>().toHaveProperty('id');
    expectTypeOf<RollLogEntry>().toHaveProperty('context');
    expectTypeOf<RollLogEntry>().toHaveProperty('notation');
    expectTypeOf<RollLogEntry>().toHaveProperty('results');
    expectTypeOf<RollLogEntry>().toHaveProperty('total');
    expectTypeOf<RollLogEntry>().toHaveProperty('modifier');
    expectTypeOf<RollLogEntry>().toHaveProperty('target');
    expectTypeOf<RollLogEntry>().toHaveProperty('success');
    expectTypeOf<RollLogEntry>().toHaveProperty('overridden');
  });

  it('Characteristics is a record of all 6 stats', () => {
    expectTypeOf<Characteristics>().toEqualTypeOf<Record<CharacteristicId, number>>();
  });

  it('Character has full structure', () => {
    expectTypeOf<Character>().toHaveProperty('id');
    expectTypeOf<Character>().toHaveProperty('info');
    expectTypeOf<Character>().toHaveProperty('characteristics');
    expectTypeOf<Character>().toHaveProperty('skills');
    expectTypeOf<Character>().toHaveProperty('careers');
    expectTypeOf<Character>().toHaveProperty('contacts');
    expectTypeOf<Character>().toHaveProperty('rollLog');
    expectTypeOf<Character>().toHaveProperty('legitimacyHash');
    expectTypeOf<Character>().toHaveProperty('isModified');
    expectTypeOf<Character>().toHaveProperty('createdAt');
  });

  it('Skill has name and level', () => {
    expectTypeOf<Skill>().toHaveProperty('name');
    expectTypeOf<Skill>().toHaveProperty('level');
  });

  it('CharacterInfo has expected fields', () => {
    expectTypeOf<CharacterInfo>().toHaveProperty('name');
    expectTypeOf<CharacterInfo>().toHaveProperty('age');
    expectTypeOf<CharacterInfo>().toHaveProperty('title');
    expectTypeOf<CharacterInfo>().toHaveProperty('credits');
    expectTypeOf<CharacterInfo>().toHaveProperty('pension');
  });

  it('Contact has type, name, notes', () => {
    expectTypeOf<Contact>().toHaveProperty('type');
    expectTypeOf<Contact>().toHaveProperty('name');
    expectTypeOf<Contact>().toHaveProperty('notes');
  });

  it('CareerName includes all 12 careers', () => {
    const careers: CareerName[] = [
      'agent', 'army', 'citizen', 'drifter', 'entertainer', 'marine',
      'merchant', 'navy', 'noble', 'rogue', 'scholar', 'scout',
    ];
    expectTypeOf(careers).toMatchTypeOf<CareerName[]>();
  });

  it('Assignment has career, name, description', () => {
    expectTypeOf<Assignment>().toHaveProperty('career');
    expectTypeOf<Assignment>().toHaveProperty('name');
    expectTypeOf<Assignment>().toHaveProperty('description');
  });

  it('Rank has level, title, bonusSkill', () => {
    expectTypeOf<Rank>().toHaveProperty('level');
    expectTypeOf<Rank>().toHaveProperty('title');
    expectTypeOf<Rank>().toHaveProperty('bonusSkill');
  });

  it('CareerTerm has expected fields', () => {
    expectTypeOf<CareerTerm>().toHaveProperty('career');
    expectTypeOf<CareerTerm>().toHaveProperty('assignment');
    expectTypeOf<CareerTerm>().toHaveProperty('term');
    expectTypeOf<CareerTerm>().toHaveProperty('rank');
    expectTypeOf<CareerTerm>().toHaveProperty('skills');
    expectTypeOf<CareerTerm>().toHaveProperty('events');
  });

  it('CareerHistory is an array of CareerTerm', () => {
    expectTypeOf<CareerHistory>().toEqualTypeOf<CareerTerm[]>();
  });

  it('EquipmentCategory is a valid union', () => {
    const cat: EquipmentCategory = 'weapons';
    expectTypeOf(cat).toMatchTypeOf<EquipmentCategory>();
  });

  it('Equipment has expected fields', () => {
    expectTypeOf<Equipment>().toHaveProperty('name');
    expectTypeOf<Equipment>().toHaveProperty('category');
    expectTypeOf<Equipment>().toHaveProperty('cost');
    expectTypeOf<Equipment>().toHaveProperty('tl');
    expectTypeOf<Equipment>().toHaveProperty('traits');
  });
});
