import type { ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
  direction: 'left' | 'right';
  stepKey: string;
  suppressAnimation?: boolean;
}

/**
 * Animated step wrapper that triggers slide animation on step change.
 * Uses key={stepKey} to force re-mount and re-trigger CSS animation.
 *
 * When suppressAnimation is true (e.g., restoring from persisted state),
 * the animation classes are omitted to prevent a flash of animation.
 */
export function StepContainer({ children, direction, stepKey, suppressAnimation = false }: StepContainerProps) {
  if (suppressAnimation) {
    return (
      <div key={stepKey}>
        {children}
      </div>
    );
  }

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
