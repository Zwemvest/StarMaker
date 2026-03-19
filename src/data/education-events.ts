// TODO: Verify against Core Rulebook 2022 p.16-18
import type { EducationEvent } from '../types/education';

/**
 * Pre-career education events table.
 * Roll 2D during each education term to determine what happens.
 * 11 entries covering roll values 2-12.
 */
export const EDUCATION_EVENTS: EducationEvent[] = [
  {
    rollValue: 2,
    description:
      'You are caught cheating on an important exam. You may be expelled or try to cover it up.',
    effectDescription: 'Risk of expulsion or gain a rival',
    effects: [
      { type: 'choice', detail: 'Accept expulsion or make a Deception check to cover it up' },
      { type: 'enemy', detail: 'Gain an enemy if you stay (the instructor who suspects you)' },
    ],
    hasChoice: true,
  },
  {
    rollValue: 3,
    description:
      'A harsh instructor pushes you beyond your limits, but you learn a great deal from the experience.',
    effectDescription: 'Gain a skill level but also a rival',
    effects: [
      { type: 'skill', detail: 'Gain any skill available in your education at level 0' },
      { type: 'enemy', detail: 'Gain a rival (the harsh instructor)' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 4,
    description:
      'You form a clique of like-minded students who help each other through coursework and exams.',
    effectDescription: 'Gain an ally',
    effects: [
      { type: 'ally', detail: 'Gain an ally (fellow student)' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 5,
    description:
      'Your time in education is largely uneventful, giving you time for personal development.',
    effectDescription: 'Gain a skill from your education',
    effects: [
      { type: 'skill', detail: 'Gain any skill available in your education at level 0' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 6,
    description:
      'You take on a part-time job or extra duties to support yourself during your studies.',
    effectDescription: 'Gain a practical skill',
    effects: [
      { type: 'choice', detail: 'Choose one: Admin 0, Profession 0, or Streetwise 0' },
    ],
    hasChoice: true,
  },
  {
    rollValue: 7,
    description:
      'Life event. Something happens to you during your time in education.',
    effectDescription: 'Roll on the Life Events table',
    effects: [
      { type: 'special', detail: 'Roll on the Life Events table' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 8,
    description:
      'You get involved in student politics or military hierarchy, learning to navigate organisations.',
    effectDescription: 'Gain a social or leadership skill',
    effects: [
      { type: 'choice', detail: 'Choose one: Admin 0, Advocate 0, or Carouse 0' },
    ],
    hasChoice: true,
  },
  {
    rollValue: 9,
    description:
      'You excel in your studies, impressing your tutors with your aptitude.',
    effectDescription: 'Gain DM+2 on your graduation roll',
    effects: [
      { type: 'special', detail: 'DM+2 to graduation roll' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 10,
    description:
      'You gain a patron or mentor who takes a special interest in your career.',
    effectDescription: 'Gain an ally and a contact',
    effects: [
      { type: 'ally', detail: 'Gain a patron (ally)' },
      { type: 'ally', detail: 'Gain a contact in your field of study' },
    ],
    hasChoice: false,
  },
  {
    rollValue: 11,
    description:
      'War or crisis breaks out, testing you in ways your education could not prepare you for.',
    effectDescription: 'Gain a military or survival skill',
    effects: [
      { type: 'choice', detail: 'Choose one: Gun Combat 0, Survival 0, or Medic 0' },
      { type: 'characteristic', detail: 'If you choose to serve, gain END +1' },
    ],
    hasChoice: true,
  },
  {
    rollValue: 12,
    description:
      'You achieve something truly exceptional during your education, earning recognition and honours.',
    effectDescription: 'Gain an extra skill level and DM+2 to graduation',
    effects: [
      { type: 'skill', detail: 'Gain any one skill available in your education at level 1' },
      { type: 'special', detail: 'DM+2 to graduation roll' },
    ],
    hasChoice: false,
  },
];
