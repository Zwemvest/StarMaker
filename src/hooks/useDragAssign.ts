import { useState, useCallback, useMemo } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

interface DragAssignConfig<T> {
  pool: T[];
  slotCount: number;
  getId: (item: T) => string;
}

interface DragAssignResult<T> {
  assignments: (T | null)[];
  assignToSlot: (item: T, slotIndex: number) => void;
  unassignSlot: (slotIndex: number) => void;
  unassignedPool: T[];
  isComplete: boolean;
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Reusable drag-to-slot logic hook.
 *
 * Manages state for assigning items from a source pool into numbered target slots.
 * Used for characteristic assignment, background skill selection, and all future
 * skill selections throughout creation.
 *
 * handleDragEnd parses dnd-kit's over.id to determine target slot index.
 * Slot droppable IDs should follow the pattern "slot-{index}".
 */
export function useDragAssign<T>(config: DragAssignConfig<T>): DragAssignResult<T> {
  const { pool, slotCount, getId } = config;
  const [assignments, setAssignments] = useState<(T | null)[]>(
    () => Array.from({ length: slotCount }, () => null),
  );

  const assignToSlot = useCallback(
    (item: T, slotIndex: number) => {
      setAssignments((prev) => {
        const next = [...prev];
        // If item is already in another slot, remove it first
        const existingIndex = next.findIndex(
          (a) => a !== null && getId(a) === getId(item),
        );
        if (existingIndex !== -1) {
          next[existingIndex] = null;
        }
        next[slotIndex] = item;
        return next;
      });
    },
    [getId],
  );

  const unassignSlot = useCallback((slotIndex: number) => {
    setAssignments((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }, []);

  const unassignedPool = useMemo(() => {
    const assignedIds = new Set(
      assignments.filter((a): a is T => a !== null).map(getId),
    );
    return pool.filter((item) => !assignedIds.has(getId(item)));
  }, [pool, assignments, getId]);

  const isComplete = useMemo(
    () => assignments.every((a) => a !== null),
    [assignments],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      // Parse slot index from droppable ID (e.g., "slot-0" -> 0)
      const overId = String(over.id);
      const slotMatch = overId.match(/^slot-(\d+)$/);
      if (!slotMatch) return;

      const slotIndex = parseInt(slotMatch[1], 10);
      if (slotIndex < 0 || slotIndex >= slotCount) return;

      // Find the dragged item in the pool
      const dragId = String(active.id);
      const item = pool.find((p) => getId(p) === dragId);
      if (!item) return;

      assignToSlot(item, slotIndex);
    },
    [pool, slotCount, getId, assignToSlot],
  );

  return {
    assignments,
    assignToSlot,
    unassignSlot,
    unassignedPool,
    isComplete,
    handleDragEnd,
  };
}
