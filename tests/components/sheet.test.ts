import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { CharacterPanel } from '../../src/components/character-panel/CharacterPanel';
import { LegitimacyBadge } from '../../src/components/sheet/LegitimacyBadge';
import { CharacterSheet } from '../../src/components/sheet/CharacterSheet';
import { useCharacterStore } from '../../src/stores/character';
import type { AcquiredPsiTalent } from '../../src/types/psionics';
import type { OwnedEquipment } from '../../src/types/equipment';

const telepathy: AcquiredPsiTalent = {
  talent: 'telepathy',
  level: 1,
  powers: [
    { name: 'Read Surface Thoughts', talent: 'telepathy', psiCost: 1, range: 'Close', description: '' },
  ],
};

const blade: OwnedEquipment = {
  item: { category: 'weapons', name: 'Blade', tl: 2, cost: 100, mass: 1, traits: [], range: 'Melee', damage: '2D', magazine: null, magazineCost: null },
  quantity: 2,
};

describe('Dossier — Psionics + Equipment sections', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('renders the Psionics section with PSI strength and a talent power when present', () => {
    useCharacterStore.setState({ psiStrength: 8, psiTalents: [telepathy] });
    render(createElement(CharacterPanel));
    expect(screen.getByText(/PSI 8/)).toBeTruthy();
    expect(screen.getByText(/Telepathy/i)).toBeTruthy();
    expect(screen.getByText(/Read Surface Thoughts/)).toBeTruthy();
    expect(screen.getByText(/PSI 1/)).toBeTruthy();
  });

  it('renders the Equipment section with quantity and a key stat', () => {
    useCharacterStore.setState({ ownedEquipment: [blade] });
    render(createElement(CharacterPanel));
    expect(screen.getByText(/Blade/)).toBeTruthy();
    expect(screen.getByText(/×2/)).toBeTruthy();
    expect(screen.getByText(/2D/)).toBeTruthy();
  });

  it('omits both sections when no psionics or equipment data exists', () => {
    render(createElement(CharacterPanel));
    expect(screen.queryByText(/^Psionics$/)).toBeNull();
    expect(screen.queryByText(/^Equipment$/)).toBeNull();
  });
});

describe('LegitimacyBadge', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('shows "Legitimate" when isModified is false', () => {
    useCharacterStore.setState({ isModified: false, legitimacyHash: 'abc123def456' });
    render(createElement(LegitimacyBadge));
    expect(screen.getByText(/Legitimate/)).toBeTruthy();
    expect(screen.queryByText(/Modified/)).toBeNull();
    expect(screen.getByText(/abc123def456/)).toBeTruthy();
  });

  it('shows "Modified" when isModified is true', () => {
    useCharacterStore.setState({ isModified: true, legitimacyHash: 'deadbeef' });
    render(createElement(LegitimacyBadge));
    expect(screen.getByText(/Modified/)).toBeTruthy();
    expect(screen.queryByText(/Legitimate/)).toBeNull();
    expect(screen.getByText(/deadbeef/)).toBeTruthy();
  });
});

describe('CharacterSheet', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('renders psionics and equipment sections when present', () => {
    useCharacterStore.setState({ psiStrength: 7, psiTalents: [telepathy], ownedEquipment: [blade] });
    render(createElement(CharacterSheet));
    expect(screen.getByText(/Telepathy/i)).toBeTruthy();
    expect(screen.getByText(/Blade/)).toBeTruthy();
  });

  it('shows the legitimacy state and hash', () => {
    useCharacterStore.setState({ isModified: false, legitimacyHash: 'feedface00' });
    render(createElement(CharacterSheet));
    expect(screen.getByText(/Legitimate/)).toBeTruthy();
    expect(screen.getByText(/feedface00/)).toBeTruthy();
  });

  it('calls window.print when the print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(createElement(CharacterSheet));
    screen.getByRole('button', { name: /print/i }).click();
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('calls onDone when the Done button is clicked', () => {
    const onDone = vi.fn();
    render(createElement(CharacterSheet, { onDone }));
    screen.getByRole('button', { name: /done/i }).click();
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
