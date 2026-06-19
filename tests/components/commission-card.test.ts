import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { RollLogEntry } from '../../src/types/dice';

const mockLoggedRoll2D = vi.fn();
vi.mock('../../src/hooks/useLoggedRoll', () => ({
  useLoggedRoll: () => ({ loggedRoll2D: mockLoggedRoll2D }),
}));

import { CommissionCard } from '../../src/components/career/CommissionCard';
import { useCharacterStore } from '../../src/stores/character';
import { getCareer } from '../../src/data/careers/index';

function fakeEntry(dice: number[]): RollLogEntry {
  return {
    id: 'x',
    context: 'career.commission',
    notation: '2D',
    results: dice,
    total: dice.reduce((a, b) => a + b, 0),
    modifier: 0,
    target: null,
    success: null,
    overridden: false,
  };
}

const army = getCareer('army');

describe('CommissionCard — event DM (CRER-11)', () => {
  beforeEach(() => {
    mockLoggedRoll2D.mockReset();
    useCharacterStore.getState().resetCharacter();
  });

  it('shows an Event DM column with the bonus when bonusDM > 0', () => {
    render(
      createElement(CommissionCard, {
        career: army,
        commissionTarget: army.commission!,
        characteristicValue: 9, // +1
        termsInCareer: 1,
        bonusDM: 2,
        onResult: vi.fn(),
      }),
    );
    expect(screen.getByText('Event DM')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('omits the Event DM column when bonusDM is 0', () => {
    render(
      createElement(CommissionCard, {
        career: army,
        commissionTarget: army.commission!,
        characteristicValue: 9,
        termsInCareer: 1,
        bonusDM: 0,
        onResult: vi.fn(),
      }),
    );
    expect(screen.queryByText('Event DM')).toBeNull();
  });

  it('commission succeeds via the event DM that a charDM alone would miss', async () => {
    // SOC 9 → +1, bonusDM +2 → effectiveDM 3, dice 5, target 8 → 5+3 = 8 → success
    mockLoggedRoll2D.mockResolvedValue(fakeEntry([2, 3]));
    const onResult = vi.fn();
    render(
      createElement(CommissionCard, {
        career: army,
        commissionTarget: army.commission!,
        characteristicValue: 9,
        termsInCareer: 1,
        bonusDM: 2,
        onResult,
      }),
    );

    fireEvent.click(screen.getByText('Roll for Commission'));
    await waitFor(() => expect(screen.getByText(/Commissioned!/)).toBeTruthy());
    // engine was called with the effective DM (3), not just charDM (1)
    expect(mockLoggedRoll2D).toHaveBeenCalledWith('Commission Roll', 3, army.commission!.target);

    fireEvent.click(screen.getByText('Continue'));
    expect(onResult).toHaveBeenCalledWith(true);
  });
});
