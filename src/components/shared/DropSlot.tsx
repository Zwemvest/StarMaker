import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropSlotProps {
  id: string;
  label: string;
  children: ReactNode;
  isEmpty: boolean;
}

export function DropSlot({ id, label, children, isEmpty }: DropSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 rounded-lg p-3 min-h-16 flex flex-col items-center justify-center
        transition-colors duration-150
        ${isOver ? 'border-scanner-blue bg-scanner-blue/10' : 'border-gray-600'}
        ${isEmpty ? 'border-dashed' : 'border-solid bg-terminal-surface'}
      `}
    >
      <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </span>
      {children}
    </div>
  );
}
