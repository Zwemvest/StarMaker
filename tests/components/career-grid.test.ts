import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { CareerGrid } from '../../src/components/career/CareerGrid';
import { useCharacterStore } from '../../src/stores/character';
import { probability2DAtLeast } from '../../src/engine/dice';
import { characteristicModifier } from '../../src/types/common';

describe('CareerGrid', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('renders all 12 careers', () => {
    render(createElement(CareerGrid, { onChoose: vi.fn() }));
    // Spot check a few career names
    expect(screen.getByText(/Army/i)).toBeTruthy();
    expect(screen.getByText(/Navy/i)).toBeTruthy();
    expect(screen.getByText(/Drifter/i)).toBeTruthy();
    expect(screen.getByText(/Scholar/i)).toBeTruthy();
  });

  it('displays an odds pill for Army using probability2DAtLeast', () => {
    // Set characteristics so END is 10 (DM+1) → Army's END 5+ with DM+1 should be very high
    useCharacterStore.getState().setCharacteristic('END', 10);
    render(createElement(CareerGrid, { onChoose: vi.fn() }));

    const expectedOdds = probability2DAtLeast(5, characteristicModifier(10));
    // The odds pill should display this percentage
    const pills = screen.getAllByText(new RegExp(`${expectedOdds}%`));
    expect(pills.length).toBeGreaterThanOrEqual(1);
  });

  it('shows green color for odds >= 50 on easy qualifications', () => {
    // END 12 → DM+2, Army target 5 → effective target 3 → 97%
    useCharacterStore.getState().setCharacteristic('END', 12);
    render(createElement(CareerGrid, { onChoose: vi.fn() }));

    // At least one pill should be green
    const greenPills = document.querySelectorAll('.text-green-400');
    expect(greenPills.length).toBeGreaterThan(0);
  });

  it('shows amber color for odds < 50 on hard qualifications', () => {
    // Low characteristics → low odds
    useCharacterStore.getState().setCharacteristic('END', 2); // DM-2
    useCharacterStore.getState().setCharacteristic('INT', 2);
    useCharacterStore.getState().setCharacteristic('DEX', 2);
    useCharacterStore.getState().setCharacteristic('EDU', 2);
    useCharacterStore.getState().setCharacteristic('SOC', 2);
    useCharacterStore.getState().setCharacteristic('STR', 2);
    render(createElement(CareerGrid, { onChoose: vi.fn() }));

    // At least one career should show amber odds
    const amberPills = document.querySelectorAll('.text-amber-400');
    expect(amberPills.length).toBeGreaterThan(0);
  });

  it('shows no odds pill for Drifter (no qualification)', () => {
    useCharacterStore.getState().setCharacteristic('END', 8);
    render(createElement(CareerGrid, { onChoose: vi.fn() }));

    // Find the Drifter card (buttons are not links; use getAllByRole('button'))
    const drifterButton = screen
      .getAllByRole('button')
      .find((b) => /drifter/i.test(b.textContent || ''));
    expect(drifterButton).toBeTruthy();
    // Drifter card should not contain a percentage pill
    const pillInDrifter = within(drifterButton!).queryByText(/\d+%/);
    expect(pillInDrifter).toBeNull();
  });

  it('applies previous career DM-1 penalty to odds', () => {
    // Add one previous career, set END 8 (DM 0)
    useCharacterStore.getState().setCharacteristic('END', 8);
    useCharacterStore.getState().addPreviousCareer('Navy');
    render(createElement(CareerGrid, { onChoose: vi.fn() }));

    // Army END 5+ with DM-1 (prev career) → effective target 6 → 72%
    const expected = probability2DAtLeast(5, -1);
    const matches = screen.getAllByText(new RegExp(`${expected}%`));
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
