import type { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="relative group inline-block">
      {children}
      <span
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          whitespace-pre-line max-w-xs rounded bg-gray-800 px-2 py-1 text-xs text-gray-200
          opacity-0 transition-opacity duration-150 group-hover:opacity-100
          border border-gray-600 z-50
        "
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}
