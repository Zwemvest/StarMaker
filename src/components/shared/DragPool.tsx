import type { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';

/**
 * Configure @dnd-kit PointerSensor with `activationConstraint: { distance: 8 }`
 * in the parent DndContext to prevent accidental drags (per research pitfall #2).
 * The DndContext provider should use:
 *   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
 */

interface DragItemProps<T> {
  item: T;
  id: string;
  renderItem: (item: T, isDragging: boolean) => ReactNode;
}

function DragItem<T>({ item, id, renderItem }: DragItemProps<T>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none ${isDragging ? 'opacity-30' : ''}`}
    >
      {renderItem(item, isDragging)}
    </div>
  );
}

interface DragPoolProps<T> {
  items: T[];
  renderItem: (item: T, isDragging: boolean) => ReactNode;
  getId: (item: T) => string;
  disabled?: boolean;
  className?: string;
}

export function DragPool<T>({
  items,
  renderItem,
  getId,
  disabled = false,
  className = '',
}: DragPoolProps<T>) {
  return (
    <div
      className={`
        flex flex-wrap gap-2 transition-opacity duration-150
        ${disabled ? 'opacity-30 pointer-events-none' : ''}
        ${className}
      `}
    >
      {items.map((item) => (
        <DragItem
          key={getId(item)}
          item={item}
          id={getId(item)}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}
