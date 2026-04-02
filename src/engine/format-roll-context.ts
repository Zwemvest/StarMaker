/**
 * Map dot-path roll context strings to human-readable labels.
 * Used by the RollLogDrawer to display friendly names.
 */
const CONTEXT_LABELS: Record<string, string> = {
  'characteristics.roll.1': 'Characteristic Roll 1',
  'characteristics.roll.2': 'Characteristic Roll 2',
  'characteristics.roll.3': 'Characteristic Roll 3',
  'characteristics.roll.4': 'Characteristic Roll 4',
  'characteristics.roll.5': 'Characteristic Roll 5',
  'characteristics.roll.6': 'Characteristic Roll 6',
  'education.entry.university': 'University Entry',
  'education.entry.academy.army': 'Army Academy Entry',
  'education.entry.academy.marines': 'Marines Academy Entry',
  'education.entry.academy.navy': 'Navy Academy Entry',
  'education.event': 'Education Event',
  'education.graduation': 'Graduation Roll',
};

/**
 * Format a dot-path context string into a human-readable label.
 * Falls back to replacing dots with ' > ' for unlisted contexts.
 */
export function formatRollContext(context: string): string {
  return CONTEXT_LABELS[context] ?? context.replace(/\./g, ' > ');
}
