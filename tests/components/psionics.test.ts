import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { RollLogEntry } from '../../src/types/dice';

// Controllable logged-roll mock so DiceRollButton rolls are deterministic.
const mockLoggedRoll2D = vi.fn();
vi.mock('../../src/hooks/useLoggedRoll', () => ({
  useLoggedRoll: () => ({
    loggedRoll2D: mockLoggedRoll2D,
    loggedRoll1D: vi.fn(),
  }),
}));

import { PsiGate } from '../../src/components/psionics/PsiGate';
import { PsionicsStep } from '../../src/components/psionics/PsionicsStep';
import { TalentLearnCard } from '../../src/components/psionics/TalentLearnCard';
import { useCharacterStore } from '../../src/stores/character';
import { PSI_TALENTS } from '../../src/data/psionics';

function fakeEntry(dice: number[], context = 'test.context'): RollLogEntry {
  return {
    id: 'test-id',
    context,
    notation: '2D',
    results: dice,
    total: dice.reduce((a, b) => a + b, 0),
    modifier: 0,
    target: null,
    success: null,
    overridden: false,
  };
}

describe('PsiGate — locked gate (D-2)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
    mockLoggedRoll2D.mockReset();
  });

  it('renders both Skip and Test anyway controls', () => {
    render(
      createElement(PsiGate, { onSkip: vi.fn(), onForce: vi.fn() }),
    );
    expect(screen.getByText('Skip Psionic Testing')).toBeTruthy();
    expect(screen.getByText(/Test anyway/)).toBeTruthy();
  });

  it('Skip calls onSkip and never onForce', () => {
    const onSkip = vi.fn();
    const onForce = vi.fn();
    render(createElement(PsiGate, { onSkip, onForce }));

    fireEvent.click(screen.getByText('Skip Psionic Testing'));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onForce).not.toHaveBeenCalled();
  });

  it('Test anyway alone does not call onForce until confirmed', () => {
    const onForce = vi.fn();
    render(createElement(PsiGate, { onSkip: vi.fn(), onForce }));

    fireEvent.click(screen.getByText(/Test anyway/));
    expect(onForce).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Yes, test anyway'));
    expect(onForce).toHaveBeenCalledTimes(1);
  });
});

describe('PsionicsStep — force-unlock via store', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
    mockLoggedRoll2D.mockReset();
  });

  it('confirming Test anyway flips the store to unlocked + modified', () => {
    const send = vi.fn();
    render(createElement(PsionicsStep, { send }));

    // Locked store → gate shown.
    fireEvent.click(screen.getByText(/Test anyway/));
    fireEvent.click(screen.getByText('Yes, test anyway'));

    const state = useCharacterStore.getState();
    expect(state.psionicsUnlocked).toBe(true);
    expect(state.isModified).toBe(true);
    // Force-unlock advances past the gate to the test flow, no completion yet.
    expect(send).not.toHaveBeenCalled();
  });

  it('Skip from the gate sends PSIONICS_COMPLETE once', () => {
    const send = vi.fn();
    render(createElement(PsionicsStep, { send }));

    fireEvent.click(screen.getByText('Skip Psionic Testing'));
    expect(send).toHaveBeenCalledWith({ type: 'PSIONICS_COMPLETE' });
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('TalentLearnCard — powers display (PSIN-06)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
    mockLoggedRoll2D.mockReset();
  });

  it('lists at least one power with its PSI cost and range', () => {
    const telepathy = PSI_TALENTS[0];
    render(
      createElement(TalentLearnCard, {
        talent: telepathy,
        psiDM: 0,
        priorAttempts: 0,
        autoGranted: true,
        onLearned: vi.fn(),
        onSkip: vi.fn(),
      }),
    );

    const firstPower = telepathy.powers[0];
    expect(screen.getByText(firstPower.name)).toBeTruthy();
    // PSI cost and range labels appear.
    expect(screen.getAllByText(new RegExp(`PSI\\s*${firstPower.psiCost}`)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(firstPower.range)).length).toBeGreaterThan(0);
  });

  it('auto-granted telepathy learns with no roll', () => {
    const telepathy = PSI_TALENTS[0];
    const onLearned = vi.fn();
    render(
      createElement(TalentLearnCard, {
        talent: telepathy,
        psiDM: 0,
        priorAttempts: 0,
        autoGranted: true,
        onLearned,
        onSkip: vi.fn(),
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Learn telepathy/i }));
    expect(onLearned).toHaveBeenCalledTimes(1);
    expect(mockLoggedRoll2D).not.toHaveBeenCalled();
  });

  it('non-auto talent rolls and reports success', async () => {
    mockLoggedRoll2D.mockResolvedValue(fakeEntry([6, 6])); // total 12, easily passes
    const clairvoyance = PSI_TALENTS[1];
    const onLearned = vi.fn();
    render(
      createElement(TalentLearnCard, {
        talent: clairvoyance,
        psiDM: 0,
        priorAttempts: 1,
        autoGranted: false,
        onLearned,
        onSkip: vi.fn(),
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Roll to Learn/i }));
    await waitFor(() => expect(onLearned).toHaveBeenCalledTimes(1));
  });
});
