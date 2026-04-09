import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { BasicTrainingCard } from '../../src/components/career/BasicTrainingCard';
import { useCharacterStore } from '../../src/stores/character';
import type { CareerData, RankTables, SkillTables } from '../../src/types/careers';

/**
 * Minimal CareerData fixture for BasicTrainingCard tests.
 * Mirrors the shape used in tests/engine/career.test.ts but kept local so
 * these component tests are self-contained.
 */
function makeCareerData(overrides: Partial<CareerData> = {}): CareerData {
  const defaultRanks: RankTables = {
    enlisted: Array.from({ length: 7 }, (_, i) => ({
      level: i,
      title: i === 0 ? '' : `Rank ${i}`,
      bonusSkill: null,
    })),
    officer: null,
  };

  const defaultSkillTables: SkillTables = {
    personalDevelopment: ['STR', 'DEX', 'END', 'Gun Combat', 'Melee', 'Athletics'],
    serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
    advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
    officer: null,
  };

  return {
    name: 'agent',
    description: 'Test career',
    qualification: { characteristic: 'INT', target: 6 },
    assignments: [
      {
        name: 'Law Enforcement',
        description: 'Test',
        survival: { characteristic: 'END', target: 6 },
        advancement: { characteristic: 'INT', target: 7 },
        specialistSkills: ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
      },
      {
        name: 'Intelligence',
        description: 'Test',
        survival: { characteristic: 'INT', target: 7 },
        advancement: { characteristic: 'INT', target: 5 },
        specialistSkills: ['Investigate', 'Recon', 'Comms', 'Stealth', 'Persuade', 'Deception'],
      },
      {
        name: 'Corporate',
        description: 'Test',
        survival: { characteristic: 'INT', target: 5 },
        advancement: { characteristic: 'INT', target: 7 },
        specialistSkills: ['Admin', 'Advocate', 'Diplomat', 'Broker', 'Stealth', 'Gun Combat'],
      },
    ],
    isMilitary: false,
    commission: null,
    ranks: defaultRanks,
    skillTables: defaultSkillTables,
    events: [],
    mishaps: [],
    musteringOut: {
      cash: [1000, 2000, 5000, 7500, 10000, 25000, 50000],
      benefits: ['Eq', 'INT +1', 'Ship', 'Weapon', 'Implant', 'SOC +1', 'TAS'],
    },
    basicTrainingException: false,
    ...overrides,
  };
}

describe('BasicTrainingCard', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
    vi.restoreAllMocks();
  });

  describe('first career — grant-all', () => {
    it('renders all 6 service skill badges and Accept Basic Training button', () => {
      const career = makeCareerData();
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: true,
          onComplete,
        }),
      );

      // Each service skill renders as a badge with "<name> 0" text
      expect(screen.getByText('Streetwise 0')).toBeTruthy();
      expect(screen.getByText('Drive 0')).toBeTruthy();
      expect(screen.getByText('Investigate 0')).toBeTruthy();
      expect(screen.getByText('Flyer 0')).toBeTruthy();
      expect(screen.getByText('Recon 0')).toBeTruthy();
      expect(screen.getByText('Gun Combat 0')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Accept Basic Training' })).toBeTruthy();
    });

    it('clicking Accept Basic Training grants all skills and fires onComplete', () => {
      const career = makeCareerData();
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: true,
          onComplete,
        }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Accept Basic Training' }));

      const skills = useCharacterStore.getState().skills;
      expect(skills).toHaveLength(6);
      const names = skills.map((s) => s.name).sort();
      expect(names).toEqual(
        ['Drive', 'Flyer', 'Gun Combat', 'Investigate', 'Recon', 'Streetwise'].sort(),
      );
      expect(skills.every((s) => s.level === 0)).toBe(true);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('subsequent career — pick-one (the regression under test)', () => {
    it('renders 6 clickable pick-one buttons, NOT a dead screen', () => {
      const career = makeCareerData();
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: false,
          onComplete,
        }),
      );

      // The pick-one grid must be present and populated
      const grid = screen.getByTestId('basic-training-pick-grid');
      expect(grid).toBeTruthy();
      const buttons = grid.querySelectorAll('button');
      expect(buttons.length).toBe(6);

      // Every service skill rendered as a clickable button
      expect(screen.getByRole('button', { name: 'Streetwise 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Drive 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Investigate 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Flyer 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Recon 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Gun Combat 0' })).toBeTruthy();

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('clicking one pick-one button adds ONE skill and fires onComplete', () => {
      const career = makeCareerData();
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: false,
          onComplete,
        }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Streetwise 0' }));

      const skills = useCharacterStore.getState().skills;
      expect(skills).toHaveLength(1);
      expect(skills[0]).toEqual({ name: 'Streetwise', level: 0 });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Citizen/Drifter exception', () => {
    it('first career + exception renders assignment specialist skills as badges', () => {
      const career = makeCareerData({ basicTrainingException: true });
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: true,
          onComplete,
        }),
      );

      // Assignment 0 specialist skills: Investigate, Recon, Streetwise, Stealth, Melee, Advocate
      expect(screen.getByText('Investigate 0')).toBeTruthy();
      expect(screen.getByText('Recon 0')).toBeTruthy();
      expect(screen.getByText('Streetwise 0')).toBeTruthy();
      expect(screen.getByText('Stealth 0')).toBeTruthy();
      expect(screen.getByText('Melee 0')).toBeTruthy();
      expect(screen.getByText('Advocate 0')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Accept Basic Training' })).toBeTruthy();
    });

    it('subsequent career + exception renders assignment 1 specialist skills as pick-one buttons', () => {
      const career = makeCareerData({ basicTrainingException: true });
      const onComplete = vi.fn();

      render(
        createElement(BasicTrainingCard, {
          career,
          assignmentIndex: 1,
          isFirstCareer: false,
          onComplete,
        }),
      );

      // Assignment 1 specialist skills: Investigate, Recon, Comms, Stealth, Persuade, Deception
      const grid = screen.getByTestId('basic-training-pick-grid');
      expect(grid).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Investigate 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Recon 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Comms 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Stealth 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Persuade 0' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Deception 0' })).toBeTruthy();

      // Click one — only that skill is added
      fireEvent.click(screen.getByRole('button', { name: 'Comms 0' }));
      const skills = useCharacterStore.getState().skills;
      expect(skills).toHaveLength(1);
      expect(skills[0]).toEqual({ name: 'Comms', level: 0 });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('defensive empty-pool fallback', () => {
    it('subsequent career with empty skill pool renders Continue fallback, no addSkill', async () => {
      // Force getBasicTrainingSkills to return [] to exercise the defensive branch.
      vi.resetModules();
      vi.doMock('../../src/engine/career', async (importOriginal) => {
        const actual = await importOriginal<typeof import('../../src/engine/career')>();
        return {
          ...actual,
          getBasicTrainingSkills: () => [],
        };
      });

      // Dynamic import so the mock takes effect for the component under test
      const { BasicTrainingCard: MockedCard } = await import(
        '../../src/components/career/BasicTrainingCard'
      );

      const career = makeCareerData();
      const onComplete = vi.fn();

      render(
        createElement(MockedCard, {
          career,
          assignmentIndex: 0,
          isFirstCareer: false,
          onComplete,
        }),
      );

      // Pick-one grid must NOT render
      expect(screen.queryByTestId('basic-training-pick-grid')).toBeNull();

      // Fallback IS present with a Continue button
      const fallback = screen.getByTestId('basic-training-empty-fallback');
      expect(fallback).toBeTruthy();
      expect(
        screen.getByText('No basic training skills available for this career.'),
      ).toBeTruthy();

      const continueBtn = screen.getByRole('button', { name: 'Continue' });
      fireEvent.click(continueBtn);

      // No skills were added
      expect(useCharacterStore.getState().skills).toHaveLength(0);
      // onComplete fired directly
      expect(onComplete).toHaveBeenCalledTimes(1);

      vi.doUnmock('../../src/engine/career');
    });
  });
});
