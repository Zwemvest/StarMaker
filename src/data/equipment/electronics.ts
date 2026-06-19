import type { GearItem } from '../../types/equipment';

/**
 * Communications, computers and sensor gear from the Mongoose Traveller 2E
 * Core Rulebook (Printer Friendly) Equipment chapter.
 *
 * Sources:
 *   - Communications: Radio / Laser Transceiver tables (p.102), and the
 *     Mobile Comm, Transceiver, Bug and Commdot write-ups (p.103).
 *   - Computers & Software: Computer Terminal, Portable Computer, Data
 *     Display/Recorder, Data Wafer (p.105).
 *   - Sensors table (p.110) with descriptions (p.111).
 *
 * Conventions:
 *   - "Cr" prefix and thousands commas stripped from cost; "-" mass -> 0.
 *   - Transceivers, comms, bugs, computers and goggles that the book lists at
 *     several Tech Levels become one item per row, disambiguated in the name so
 *     catalog names stay unique.
 */
export const ELECTRONICS: readonly GearItem[] = [
  // --- Mobile Comm (p.103) ---
  { category: 'electronics', name: 'Mobile Comm (TL6)', tl: 6, cost: 50, mass: 0, traits: [], description: 'A portable telecommunications device/computer/camera. Audio only.' }, // p.103
  { category: 'electronics', name: 'Mobile Comm (TL8)', tl: 8, cost: 150, mass: 0, traits: [], description: 'A portable comm with audio and visual capability and an onboard Computer/0.' }, // p.103
  { category: 'electronics', name: 'Mobile Comm (TL10)', tl: 10, cost: 500, mass: 0, traits: [], description: 'A portable comm handling multiple forms of data, with an onboard Computer/1.' }, // p.103

  // --- Radio Transceivers (p.102) ---
  { category: 'electronics', name: 'Radio Transceiver (TL5, 5km)', tl: 5, cost: 225, mass: 20, traits: [], description: 'A stand-alone two-way radio with a range of 5 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL5, 50km)', tl: 5, cost: 750, mass: 70, traits: [], description: 'A stand-alone two-way radio with a range of 50 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL5, 500km)', tl: 5, cost: 1500, mass: 150, traits: [], description: 'A stand-alone two-way radio with a range of 500 km, enough to reach orbital ranges reliably.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL5, 5,000km)', tl: 5, cost: 15000, mass: 300, traits: [], description: 'A stand-alone two-way radio with a range of 5,000 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL8, 50km)', tl: 8, cost: 75, mass: 0, traits: [], description: 'A compact stand-alone two-way radio with a range of 50 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL9, 500km)', tl: 9, cost: 500, mass: 0, traits: [], description: 'A compact stand-alone two-way radio with a range of 500 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL9, 2,500km)', tl: 9, cost: 5000, mass: 0, traits: [], description: 'A stand-alone two-way radio with an onboard Computer/0 and a range of 2,500 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL10, 500km)', tl: 10, cost: 250, mass: 0, traits: [], description: 'A compact stand-alone two-way radio with an onboard Computer/0 and a range of 500 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL12, 10,000km)', tl: 12, cost: 1000, mass: 1, traits: [], description: 'A stand-alone two-way radio with an onboard Computer/0 and a range of 10,000 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL13, 1,000km)', tl: 13, cost: 250, mass: 0, traits: [], description: 'A compact stand-alone two-way radio with an onboard Computer/1 and a range of 1,000 km.' }, // p.102
  { category: 'electronics', name: 'Radio Transceiver (TL14, 3,000km)', tl: 14, cost: 500, mass: 0, traits: [], description: 'A compact stand-alone two-way radio with an onboard Computer/1 and a range of 3,000 km.' }, // p.102

  // --- Laser Transceivers (p.102) ---
  { category: 'electronics', name: 'Laser Transceiver (TL9, 500km)', tl: 9, cost: 2500, mass: 1.5, traits: [], description: 'A directional laser-based transceiver with an onboard Computer/0 and a range of 500 km.' }, // p.102
  { category: 'electronics', name: 'Laser Transceiver (TL11, 500km)', tl: 11, cost: 1500, mass: 0.5, traits: [], description: 'A directional laser-based transceiver with an onboard Computer/0 and a range of 500 km.' }, // p.102
  { category: 'electronics', name: 'Laser Transceiver (TL13, 500km)', tl: 13, cost: 500, mass: 0, traits: [], description: 'A directional laser-based transceiver with an onboard Computer/1 and a range of 500 km.' }, // p.102

  // --- Bug (p.103) ---
  { category: 'electronics', name: 'Bug (TL5)', tl: 5, cost: 50, mass: 0, traits: [], description: 'A hidden surveillance device. Audio only - records anything it hears.' }, // p.103
  { category: 'electronics', name: 'Bug (TL7)', tl: 7, cost: 100, mass: 0, traits: [], description: 'A hidden surveillance device that records audio or visual.' }, // p.103
  { category: 'electronics', name: 'Bug (TL9)', tl: 9, cost: 200, mass: 0, traits: [], description: 'A hidden surveillance device that records audio, visual or data.' }, // p.103
  { category: 'electronics', name: 'Bug (TL11)', tl: 11, cost: 300, mass: 0, traits: [], description: 'A miniaturised surveillance device combining audio, visual and data capture.' }, // p.103
  { category: 'electronics', name: 'Bug (TL13)', tl: 13, cost: 400, mass: 0, traits: [], description: 'A surveillance device combining audio, visual, data capture and a basic biological scanner.' }, // p.103
  { category: 'electronics', name: 'Bug (TL15)', tl: 15, cost: 500, mass: 0, traits: [], description: 'A dust-mote-sized surveillance device with audio, visual, data, bioscan and an onboard Computer/1.' }, // p.103
  { category: 'electronics', name: 'Commdot', tl: 10, cost: 10, mass: 0, traits: [], description: 'A tiny microphone/speaker and transmitter that interfaces with another comm device to relay messages over a range of a few metres.' }, // p.103

  // --- Computers (p.105) ---
  { category: 'electronics', name: 'Computer Terminal', tl: 7, cost: 200, mass: 0, traits: [], description: 'A "dumb terminal" with Computer/0 that serves as an interface to a more powerful computer such as a ship\'s computer or planetary network.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL7)', tl: 7, cost: 500, mass: 5, traits: [], description: 'A carryable computer system with Computer/0 processing, usable without access to a network.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL8)', tl: 8, cost: 250, mass: 2, traits: [], description: 'A carryable computer system with Computer/1 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL9)', tl: 9, cost: 100, mass: 1, traits: [], description: 'A lightweight carryable computer system with Computer/1 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL10)', tl: 10, cost: 500, mass: 0.5, traits: [], description: 'A carryable computer system with Computer/2 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL11)', tl: 11, cost: 300, mass: 0.5, traits: [], description: 'A carryable computer system with Computer/2 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL12)', tl: 12, cost: 1000, mass: 0.5, traits: [], description: 'A carryable computer system with Computer/3 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL13)', tl: 13, cost: 1500, mass: 0.5, traits: [], description: 'A carryable computer system with Computer/4 processing.' }, // p.105
  { category: 'electronics', name: 'Portable Computer (TL14)', tl: 14, cost: 5000, mass: 0.5, traits: [], description: 'A carryable computer system with Computer/5 processing.' }, // p.105
  { category: 'electronics', name: 'Data Display/Recorder', tl: 13, cost: 5000, mass: 0, traits: [], description: 'A headpiece providing a continuous heads-up display of computer data from any linked system, commonly used by starship crews.' }, // p.105
  { category: 'electronics', name: 'Data Wafer', tl: 10, cost: 5, mass: 0, traits: [], description: 'The standard storage medium - a hardened plastic rectangle about the size of a credit card holding memory-diamond data.' }, // p.105

  // --- Sensors (p.110-111) ---
  { category: 'electronics', name: 'Binoculars (TL3)', tl: 3, cost: 75, mass: 1, traits: [], description: 'Optics that allow the user to see further.' }, // p.110-111
  { category: 'electronics', name: 'Binoculars (TL8)', tl: 8, cost: 750, mass: 1, traits: [], description: 'Electronically enhanced binoculars that can capture images and use light-intensification to see in the dark.' }, // p.110-111
  { category: 'electronics', name: 'Binoculars (TL12)', tl: 12, cost: 3500, mass: 1, traits: [], description: 'PRIS binoculars that let the user observe a large section of the EM spectrum, from infrared to gamma rays.' }, // p.110-111
  { category: 'electronics', name: 'Bioscanner', tl: 15, cost: 350000, mass: 3.5, traits: [], description: 'Sniffs for organic molecules and tests chemical samples; detects poisons or bacteria, analyses organic matter and classifies unfamiliar organisms.' }, // p.110-111
  { category: 'electronics', name: 'Densitometer', tl: 14, cost: 20000, mass: 5, traits: [], description: 'Uses an object\'s natural gravity to measure its density, building a 3D image of the inside and outside of an object.' }, // p.110-111
  { category: 'electronics', name: 'EM Probe', tl: 10, cost: 1000, mass: 1, traits: [], description: 'Detects the electro-magnetic emissions of technological devices; useful for diagnostics or searching for hidden bugs.' }, // p.110-111
  { category: 'electronics', name: 'Geiger Counter', tl: 5, cost: 250, mass: 2, traits: [], description: 'Detects radiation.' }, // p.110-111
  { category: 'electronics', name: 'IR Goggles', tl: 6, cost: 500, mass: 0, traits: [], description: 'Permits the user to see exothermic (heat-emitting) sources in the dark.' }, // p.110-111
  { category: 'electronics', name: 'Light Intensifier Goggles (TL7)', tl: 7, cost: 500, mass: 1, traits: [], description: 'Permits the user to see normally in anything less than total darkness by electronically intensifying available light.' }, // p.110-111
  { category: 'electronics', name: 'Light Intensifier Goggles (TL9)', tl: 9, cost: 1250, mass: 0, traits: [], description: 'Light-intensifying goggles combined with IR goggles into a single unit.' }, // p.110-111
  { category: 'electronics', name: 'Neural Activity Sensor', tl: 15, cost: 35000, mass: 10, traits: [], description: 'A backpack and detachable handheld unit that detects neural activity up to 500 metres away and estimates the intelligence level of organisms from brainwave patterns.' }, // p.110-111
] as const;
