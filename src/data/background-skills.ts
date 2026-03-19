import type { BackgroundSkill } from '../types/skills';

/**
 * Traveller 2E adolescence background skills.
 * Selected during character creation at Level 0.
 * Number of picks = EDU DM + 3 (minimum 0).
 */
export const BACKGROUND_SKILLS: BackgroundSkill[] = [
  // Physical
  {
    name: 'Athletics',
    category: 'Physical',
    description: 'Physical fitness, coordination, and endurance activities',
  },
  {
    name: 'Drive',
    category: 'Physical',
    description: 'Operating ground vehicles of all types',
  },
  {
    name: 'Flyer',
    category: 'Physical',
    description: 'Piloting grav vehicles and aircraft',
  },
  {
    name: 'Seafarer',
    category: 'Physical',
    description: 'Operating watercraft and submarines',
  },
  {
    name: 'Vacc Suit',
    category: 'Physical',
    description: 'Using and maintaining vacuum suits and hostile environment gear',
  },

  // Mental
  {
    name: 'Admin',
    category: 'Mental',
    description: 'Bureaucracy, paperwork, and organisational management',
  },
  {
    name: 'Electronics',
    category: 'Mental',
    description: 'Using and repairing electronic devices and computer systems',
  },
  {
    name: 'Mechanic',
    category: 'Mental',
    description: 'Maintaining and repairing mechanical devices and engines',
  },
  {
    name: 'Medic',
    category: 'Mental',
    description: 'First aid, diagnosis, and medical treatment',
  },
  {
    name: 'Science',
    category: 'Mental',
    description: 'Scientific knowledge across various disciplines',
  },

  // Social
  {
    name: 'Art',
    category: 'Social',
    description: 'Creative expression through visual, performing, or literary arts',
  },
  {
    name: 'Carouse',
    category: 'Social',
    description: 'Socialising, drinking, and making contacts in social settings',
  },
  {
    name: 'Language',
    category: 'Social',
    description: 'Speaking and understanding additional languages',
  },
  {
    name: 'Streetwise',
    category: 'Social',
    description: 'Navigating the criminal underworld and urban environments',
  },

  // Technical
  {
    name: 'Animals',
    category: 'Technical',
    description: 'Handling, training, and caring for animals',
  },
  {
    name: 'Profession',
    category: 'Technical',
    description: 'Practicing a specific trade or civilian occupation',
  },
  {
    name: 'Survival',
    category: 'Technical',
    description: 'Living off the land in hostile environments',
  },
];
