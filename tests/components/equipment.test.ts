import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { createElement } from 'react';
import { EquipmentCard } from '../../src/components/equipment/EquipmentCard';
import { EquipmentStep } from '../../src/components/equipment/EquipmentStep';
import { useCharacterStore } from '../../src/stores/character';
import { EQUIPMENT_CATALOG } from '../../src/data/equipment';
import type { WeaponItem, ArmourItem } from '../../src/types/equipment';

const firstWeapon = EQUIPMENT_CATALOG.find(
  (i): i is WeaponItem => i.category === 'weapons' && i.cost > 0,
)!;
const firstArmour = EQUIPMENT_CATALOG.find(
  (i): i is ArmourItem => i.category === 'armour',
)!;
const someCostlyItem = EQUIPMENT_CATALOG.find((i) => i.cost > 0)!;

describe('EquipmentCard — budgeted buy (EQUP-03)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('disables Buy and does not fire onBuy when unaffordable', () => {
    const onBuy = vi.fn();
    render(
      createElement(EquipmentCard, { item: someCostlyItem, credits: 0, onBuy }),
    );
    const buy = screen.getByRole('button', { name: 'Buy' }) as HTMLButtonElement;
    expect(buy.disabled).toBe(true);
    fireEvent.click(buy);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('enables Buy and fires onBuy when affordable', () => {
    const onBuy = vi.fn();
    render(
      createElement(EquipmentCard, {
        item: someCostlyItem,
        credits: someCostlyItem.cost,
        onBuy,
      }),
    );
    const buy = screen.getByRole('button', { name: 'Buy' }) as HTMLButtonElement;
    expect(buy.disabled).toBe(false);
    fireEvent.click(buy);
    expect(onBuy).toHaveBeenCalledTimes(1);
  });
});

describe('EquipmentCard — category stats (EQUP-04)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('shows range and damage for a weapon', () => {
    render(
      createElement(EquipmentCard, { item: firstWeapon, credits: 0, onBuy: vi.fn() }),
    );
    expect(screen.getByText(new RegExp(firstWeapon.range))).toBeTruthy();
    expect(screen.getByText(new RegExp(firstWeapon.damage))).toBeTruthy();
  });

  it('shows protection for armour', () => {
    render(
      createElement(EquipmentCard, { item: firstArmour, credits: 0, onBuy: vi.fn() }),
    );
    expect(
      screen.getByText(new RegExp(`Protection\\s*${firstArmour.protection}`)),
    ).toBeTruthy();
  });
});

describe('EquipmentStep — purchase flow (EQUP-02/03)', () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it('buying reduces the running balance and adds to ownedEquipment', () => {
    useCharacterStore.setState({ credits: 1000000 });
    const send = vi.fn();
    render(createElement(EquipmentStep, { send }));

    const before = useCharacterStore.getState().credits;
    // Find the catalog card for someCostlyItem by its name, then its Buy button.
    const nameNode = screen.getAllByText(someCostlyItem.name)[0];
    const card = nameNode.closest('[data-equipment-card]') as HTMLElement;
    const buy = within(card).getByRole('button', { name: 'Buy' });
    fireEvent.click(buy);

    const state = useCharacterStore.getState();
    expect(state.credits).toBe(before - someCostlyItem.cost);
    expect(state.ownedEquipment.some((o) => o.item.name === someCostlyItem.name)).toBe(true);
  });

  it('Finish sends EQUIPMENT_COMPLETE', () => {
    useCharacterStore.setState({ credits: 1000000 });
    const send = vi.fn();
    render(createElement(EquipmentStep, { send }));

    fireEvent.click(screen.getByText(/Finish/));
    expect(send).toHaveBeenCalledWith({ type: 'EQUIPMENT_COMPLETE' });
  });
});
