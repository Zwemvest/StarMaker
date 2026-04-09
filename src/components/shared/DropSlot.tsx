import type { ReactNode, MouseEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropSlotProps {
  id: string;
  label: string;
  children: ReactNode;
  isEmpty: boolean;
  onRemove?: () => void;
}

export function DropSlot({ id, label, children, isEmpty, onRemove }: DropSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const showRemove = Boolean(onRemove) && !isEmpty;

  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove?.();
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        relative border-2 rounded-lg p-3 min-h-16 flex flex-col items-center justify-center
        transition-colors duration-150
        ${isOver ? 'border-scanner-blue bg-scanner-blue/10' : 'border-gray-600'}
        ${isEmpty ? 'border-dashed' : 'border-solid bg-terminal-surface'}
      `}
    >
      {showRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={handleRemoveClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-terminal-surface border border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-500 flex items-center justify-center text-xs leading-none"
        >
          ×
        </button>
      )}
      <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </span>
      {children}
    </div>
  );
}
