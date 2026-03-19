import type { ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
  direction: 'left' | 'right';
  stepKey: string;
}

/**
 * Animated step wrapper that triggers slide animation on step change.
 * Uses key={stepKey} to force re-mount and re-trigger CSS animation.
 */
export function StepContainer({ children, direction, stepKey }: StepContainerProps) {
  return (
    <div
      key={stepKey}
      className={`
        animate-slide-in
        ${direction === 'right' ? 'slide-from-right' : 'slide-from-left'}
      `}
    >
      {children}
    </div>
  );
}
