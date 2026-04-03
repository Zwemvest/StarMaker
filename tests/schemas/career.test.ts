import { describe, it, expect } from 'vitest';
import { careerSchema } from '../../src/schemas/career';
import type {
  CareerData,
  SkillEntry,
  AssignmentData,
  RankEntry,
  CareerEventEntry,
  MishapEntry,
  EventEffect,
} from '../../src/types/careers';

/** Minimal valid career data fixture matching the CareerData type */
function makeValidCareer(): CareerData {
  const skillEntry: SkillEntry = 'Gun Combat';
  const objectSkillEntry: SkillEntry = { name: 'Gun Combat', specialty: 'Slug' };

  const assignment: AssignmentData = {
    name: 'Law Enforcement',
    description: 'You are a police officer or detective.',
    survival: { characteristic: 'END', target: 6 },
    advancement: { characteristic: 'INT', target: 7 },
    specialistSkills: ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
  };

  const effect: EventEffect = {
    type: 'skill',
    detail: 'Gain Investigate 1',
  };

  const event: CareerEventEntry = {
    rollValue: 2,
    description: 'Disaster! Roll on the mishap table.',
    effectDescription: 'Roll on mishap table',
    effects: [effect],
    hasChoice: false,
  };

  const mishap: MishapEntry = {
    rollValue: 1,
    description: 'Severely injured in action.',
    effectDescription: 'Roll on the injury table twice.',
    effects: [{ type: 'injury', detail: 'Roll on injury table twice' }],
  };

  const rank: RankEntry = {
    level: 0,
    title: '',
    bonusSkill: null,
  };

  // Build 11 events (rolls 2-12)
  const events: CareerEventEntry[] = Array.from({ length: 11 }, (_, i) => ({
    ...event,
    rollValue: i + 2,
  }));

  // Build 6 mishaps (rolls 1-6)
  const mishaps: MishapEntry[] = Array.from({ length: 6 }, (_, i) => ({
    ...mishap,
    rollValue: i + 1,
  }));

  // Build 6 ranks for enlisted
  const enlistedRanks: RankEntry[] = Array.from({ length: 7 }, (_, i) => ({
    level: i,
    title: i === 0 ? '' : `Rank ${i}`,
    bonusSkill: i === 1 ? 'Gun Combat' : null,
  }));

  return {
    name: 'agent',
    description: 'Law enforcement and intelligence agencies.',
    qualification: { characteristic: 'INT', target: 6 },
    assignments: [
      assignment,
      { ...assignment, name: 'Intelligence' },
      { ...assignment, name: 'Corporate' },
    ],
    isMilitary: false,
    commission: null,
    ranks: {
      enlisted: enlistedRanks,
      officer: null,
    },
    skillTables: {
      personalDevelopment: ['STR', 'DEX', 'END', 'Gun Combat', 'Melee', 'Athletics'],
      serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
      advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
      officer: null,
    },
    events,
    mishaps,
    musteringOut: {
      cash: [1000, 2000, 5000, 7500, 10000, 25000, 50000],
      benefits: ['Scientific Equipment', 'INT +1', 'Ship Share', 'Weapon', 'Combat Implant', 'SOC +1', 'TAS Membership'],
    },
    basicTrainingException: false,
  };
}

describe('careerSchema', () => {
  it('accepts valid career data', () => {
    const data = makeValidCareer();
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('rejects career with wrong number of assignments', () => {
    const data = makeValidCareer();
    data.assignments = [data.assignments[0]]; // Only 1 instead of 3
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('accepts null qualification (Drifter)', () => {
    const data = makeValidCareer();
    data.name = 'drifter';
    data.qualification = null;
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('rejects career with wrong number of events', () => {
    const data = makeValidCareer();
    data.events = data.events.slice(0, 5); // Only 5 instead of 11
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('rejects career with wrong number of mishaps', () => {
    const data = makeValidCareer();
    data.mishaps = data.mishaps.slice(0, 3); // Only 3 instead of 6
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('rejects career with wrong number of cash entries', () => {
    const data = makeValidCareer();
    data.musteringOut.cash = [1000, 2000, 5000]; // Only 3 instead of 7
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('rejects career with wrong number of benefit entries', () => {
    const data = makeValidCareer();
    data.musteringOut.benefits = ['Item1']; // Only 1 instead of 7
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('accepts specialist skills with 6 entries', () => {
    const data = makeValidCareer();
    expect(data.assignments[0].specialistSkills).toHaveLength(6);
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('rejects specialist skills with wrong count', () => {
    const data = makeValidCareer();
    data.assignments[0].specialistSkills = ['a', 'b']; // Only 2 instead of 6
    expect(() => careerSchema.parse(data)).toThrow();
  });

  it('accepts military career with commission and officer data', () => {
    const data = makeValidCareer();
    data.name = 'army';
    data.isMilitary = true;
    data.commission = { characteristic: 'SOC', target: 8 };
    data.ranks.officer = Array.from({ length: 7 }, (_, i) => ({
      level: i,
      title: i === 0 ? '' : `Officer ${i}`,
      bonusSkill: null,
    }));
    data.skillTables.officer = ['Tactics', 'Leadership', 'Advocate', 'Diplomat', 'Electronics', 'Admin'];
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('accepts SkillEntry as string or object with specialty', () => {
    const data = makeValidCareer();
    // Mix of string and object skill entries
    data.skillTables.personalDevelopment = [
      'STR',
      { name: 'Gun Combat', specialty: 'Slug' },
      'END',
      'Melee',
      'Athletics',
      'Carouse',
    ];
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('accepts EventEffect with all valid types', () => {
    const data = makeValidCareer();
    const effectTypes: EventEffect['type'][] = [
      'skill', 'characteristic', 'contact', 'ally', 'rival',
      'enemy', 'choice', 'special', 'benefit', 'injury',
    ];

    data.events[0].effects = effectTypes.map((type) => ({
      type,
      detail: `Test ${type}`,
    }));
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('accepts EventEffect with optional options array', () => {
    const data = makeValidCareer();
    data.events[0].effects = [{
      type: 'choice',
      detail: 'Pick one',
      options: ['Option A', 'Option B'],
    }];
    expect(() => careerSchema.parse(data)).not.toThrow();
  });

  it('accepts RankEntry with optional bonusSkillLevel', () => {
    const data = makeValidCareer();
    data.ranks.enlisted[1] = {
      level: 1,
      title: 'Agent',
      bonusSkill: 'Deception',
      bonusSkillLevel: 1,
    };
    expect(() => careerSchema.parse(data)).not.toThrow();
  });
});
