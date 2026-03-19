import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function Card({ children, className = '', glowColor }: CardProps) {
  return (
    <div
      className={`
        bg-terminal-surface rounded-lg border border-gray-700 p-4
        ${className}
      `}
      style={
        glowColor
          ? { boxShadow: `0 0 12px 0 ${glowColor}33, 0 0 4px 0 ${glowColor}22` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
