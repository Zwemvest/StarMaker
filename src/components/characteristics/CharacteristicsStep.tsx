import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { DicePool, type PoolItem } from './DicePool';
import { StatSlot } from './StatSlot';
import { DiceDisplay } from '../shared/DiceDisplay';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useDragAssign } from '../../hooks/useDragAssign';
import { useCharacterStore } from '../../stores/character';
import { CHARACTERISTIC_IDS } from '../../types/common';
import type { CreationEvent } from '../../machines/creation';

/** Number of characteristics to roll */
const ROLL_COUNT = 6;

interface CharacteristicsStepProps {
  subState: string | undefined;
  send: (event: CreationEvent) => void;
}

/**
 * Characteristics assignment step.
 *
 * Three sub-states matching XState nested states:
 * 1. Rolling: "Roll All" button to generate 6x 2D rolls
 * 2. Assigning: Drag values from pool to stat slots with DM preview
 * 3. Review: Read-only view of final assignments with Continue button
 */
export function CharacteristicsStep({ subState, send }: CharacteristicsStepProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const setCharacteristic = useCharacterStore((s) => s.setCharacteristic);
  const pool = useCharacterStore((s) => s.dicePool);
  const setDicePool = useCharacterStore((s) => s.setDicePool);

  // Active drag state for overlay and preview
  const [activeDragItem, setActiveDragItem] = useState<PoolItem | null>(null);
  const [hoverSlotIndex, setHoverSlotIndex] = useState<number | null>(null);

  // dnd-kit drag assignment hook
  const {
    assignments,
    unassignedPool,
    isComplete,
    handleDragEnd: baseHandleDragEnd,
  } = useDragAssign<PoolItem>({
    pool,
    slotCount: ROLL_COUNT,
    getId: (item) => item.id,
  });

  // Sensors with distance constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Roll All handler
  const handleRollAll = useCallback(async () => {
    const results: PoolItem[] = [];
    for (let i = 0; i < ROLL_COUNT; i++) {
      const entry = await loggedRoll2D(`characteristics.roll.${i + 1}`);
      results.push({
        id: entry.id,
        dice: entry.results,
        total: entry.total,
      });
    }
    setDicePool(results);
    send({ type: 'ROLL_ALL' });
  }, [loggedRoll2D, setDicePool, send]);

  // Drag start: track active item for overlay
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dragId = String(event.active.id);
      const item = pool.find((p) => p.id === dragId) ?? null;
      setActiveDragItem(item);
    },
    [pool],
  );

  // Drag over: track which slot is hovered for DM preview
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) {
      setHoverSlotIndex(null);
      return;
    }
    const overId = String(event.over.id);
    const match = overId.match(/^slot-(\d+)$/);
    setHoverSlotIndex(match ? parseInt(match[1], 10) : null);
  }, []);

  // Drag end: assign value to slot and persist to store
  const handleDragEnd = useCallback(
    (event: Parameters<typeof baseHandleDragEnd>[0]) => {
      baseHandleDragEnd(event);

      // Persist to character store if dropped on a valid slot
      if (event.over) {
        const overId = String(event.over.id);
        const match = overId.match(/^slot-(\d+)$/);
        if (match) {
          const slotIndex = parseInt(match[1], 10);
          const dragId = String(event.active.id);
          const item = pool.find((p) => p.id === dragId);
          if (item && slotIndex >= 0 && slotIndex < CHARACTERISTIC_IDS.length) {
            setCharacteristic(CHARACTERISTIC_IDS[slotIndex], item.total);
          }
        }
      }

      setActiveDragItem(null);
      setHoverSlotIndex(null);
    },
    [baseHandleDragEnd, pool, setCharacteristic],
  );

  // When all values assigned, auto-send ASSIGN_COMPLETE
  const handleAssignComplete = useCallback(() => {
    if (isComplete) {
      // Persist all assignments to store (in case drag-end missed any)
      assignments.forEach((item, i) => {
        if (item) {
          setCharacteristic(CHARACTERISTIC_IDS[i], item.total);
        }
      });
      send({ type: 'ASSIGN_COMPLETE' });
    }
  }, [isComplete, assignments, setCharacteristic, send]);

  // Confirm handler for review state
  const handleConfirm = useCallback(() => {
    send({ type: 'CONFIRM' });
  }, [send]);

  // Rolling sub-state: Show Roll All button
  if (subState === 'rolling') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
        <h2 className="text-2xl font-sans text-white">Characteristics</h2>
        <p className="text-gray-400 text-sm max-w-md text-center">
          Roll 2D for each of your six characteristics. Values will be assigned to STR, DEX, END, INT, EDU, and SOC.
        </p>
        <Button variant="primary" onClick={handleRollAll} data-testid="roll-all-btn">
          Roll All
        </Button>
      </div>
    );
  }

  // Assigning sub-state: DicePool + StatSlot grid with drag-and-drop
  if (subState === 'assigning') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-sans text-white">Assign Characteristics</h2>
        <p className="text-gray-400 text-sm">
          Drag rolled values from the pool into stat slots. Hover over a slot to preview the DM.
        </p>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Dice Pool */}
          <div className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Rolled Values</h3>
            <DicePool items={unassignedPool} disabled={isComplete} />
          </div>

          {/* Stat Slots: 2x3 grid — Physical left, Mental right */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm text-gray-400 uppercase tracking-wide">Physical</h3>
              {CHARACTERISTIC_IDS.slice(0, 3).map((charId, i) => {
                const item = assignments[i];
                const previewValue =
                  hoverSlotIndex === i && activeDragItem && !item
                    ? activeDragItem.total
                    : null;
                return (
                  <StatSlot
                    key={charId}
                    id={charId}
                    slotIndex={i}
                    value={item?.total ?? null}
                    dice={item?.dice ?? null}
                    previewValue={previewValue}
                  />
                );
              })}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm text-gray-400 uppercase tracking-wide">Mental</h3>
              {CHARACTERISTIC_IDS.slice(3, 6).map((charId, i) => {
                const slotIndex = i + 3;
                const item = assignments[slotIndex];
                const previewValue =
                  hoverSlotIndex === slotIndex && activeDragItem && !item
                    ? activeDragItem.total
                    : null;
                return (
                  <StatSlot
                    key={charId}
                    id={charId}
                    slotIndex={slotIndex}
                    value={item?.total ?? null}
                    dice={item?.dice ?? null}
                    previewValue={previewValue}
                  />
                );
              })}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDragItem ? (
              <div className="px-3 py-2 rounded-lg bg-terminal-surface border-2 border-scanner-blue shadow-lg shadow-scanner-blue/20">
                <DiceDisplay dice={activeDragItem.dice} total={activeDragItem.total} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Continue when all assigned */}
        {isComplete && (
          <div className="flex justify-center mt-4">
            <Button variant="primary" onClick={handleAssignComplete}>
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Review sub-state: Read-only grid + Continue button
  if (subState === 'review') {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-sans text-white">Review Characteristics</h2>
        <p className="text-gray-400 text-sm">
          Confirm your characteristic assignments before proceeding.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Physical</h3>
            {CHARACTERISTIC_IDS.slice(0, 3).map((charId, i) => {
              const item = assignments[i];
              return (
                <StatSlot
                  key={charId}
                  id={charId}
                  slotIndex={i}
                  value={item?.total ?? null}
                  dice={item?.dice ?? null}
                  previewValue={null}
                />
              );
            })}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Mental</h3>
            {CHARACTERISTIC_IDS.slice(3, 6).map((charId, i) => {
              const slotIndex = i + 3;
              const item = assignments[slotIndex];
              return (
                <StatSlot
                  key={charId}
                  id={charId}
                  slotIndex={slotIndex}
                  value={item?.total ?? null}
                  dice={item?.dice ?? null}
                  previewValue={null}
                />
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button variant="primary" onClick={handleConfirm}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
