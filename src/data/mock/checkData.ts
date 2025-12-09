// src/data/mock/checkData.ts
import { SafetyCheck, Resident } from '../../types';
import { mockResidents } from './residentData';

// Helper to group residents by their location for check creation
const residentsByLocation = mockResidents.reduce((acc, resident) => {
  if (!acc[resident.location]) {
    acc[resident.location] = [];
  }
  acc[resident.location].push(resident);
  return acc;
}, {} as Record<string, typeof mockResidents>);

// Factory function to generate fresh check data with current timestamps
export const generateInitialChecks = (): SafetyCheck[] => {
  const now = new Date();
  const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

  let walkingIndex = 1;
  const DEFAULT_INTERVAL = 15; // Minutes

  // Helper to create checks from the table data for consistency.
  const createCheck = (location: string, offsetMinutes: number = 0, specialClassifications: { type: string, details: string, residentId: string }[] = []) => {
    return {
      id: `chk_${location.toLowerCase().replace(/[\s']/g, '_')}`,
      type: 'scheduled',
      residents: residentsByLocation[location] || [],
      status: 'pending', // Will be recalculated by atoms based on dueDate
      dueDate: inNMinutes(offsetMinutes),
      walkingOrderIndex: walkingIndex++,
      specialClassifications,
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
    } as SafetyCheck;
  };

  // --- STANDARD CHECKS ---
  // We distribute these across the timeline to demonstrate all states:
  // Early (0-7m into cycle -> Due in 8-15m)
  // Pending (7-13m into cycle -> Due in 2-8m)
  // Due soon (13-15m into cycle -> Due in 0-2m)
  // Late (15-22m into cycle -> Due 0-7m ago)

  // Note: Due Date = End of 15m cycle.
  // Example: If cycle started 14 mins ago, we are in "Due soon". Due Date is in 1 min.

  const standardChecks = [
    // --- LATE GROUP (Due 2-5 mins ago) ---
    createCheck("A1-101", -2),
    createCheck("A1-102", -5),

    // --- DUE SOON GROUP (Due now in 1-2 mins) ---
    createCheck("A2-205", 1),
    createCheck("A2-206", 2),

    // --- PENDING GROUP (Due in 5-10 mins) ---
    createCheck("A3-301", 5, [{ type: 'CS', details: 'Separation from J. Miller', residentId: 'jdc_a3_1' }]),
    createCheck("A3-302", 8),
    createCheck("A4-410", 10),

    // --- EARLY GROUP (Due in 13-15 mins) ---
    createCheck("A4-411", 13),
    createCheck("A5-502", 14, [{ type: 'MW', details: 'Asthmatic, check inhaler', residentId: 'jdc_a5_1' }]),
    createCheck("A5-503", 15),

    // --- FUTURE / STANDARD (Due later) ---
    createCheck("A6-601", 20, [{ type: 'SR', details: 'Active watch, 15-min checks', residentId: 'jdc_a6_1' }]),
    createCheck("A6-602", 25),
    createCheck("A6-604", 30, [
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_4' },
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_5' }
    ]),

    // JDC - B-Wing (Standard)
    createCheck("B1-101", 35),
    createCheck("B1-102", 40),
    createCheck("B2-201", 45),

    // JDC - C-Wing
    createCheck("C1-101", 50),
    createCheck("C1-102", 55),

    // Sci-Fi - Star Wars
    createCheck("Death Star Detention Block", 60),
    createCheck("Emperor's Throne Room", 65, [
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_palp' },
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_vader' }
    ]),
    createCheck("Millennium Falcon", 70),
    createCheck("Mos Eisley Cantina", 75),
    createCheck("Tatooine Homestead", 80),
    createCheck("Dagobah", 85),
    createCheck("Bespin", 90),
    createCheck("Jabba's Palace", 95),

    // Sci-Fi - Harry Potter
    createCheck("Gryffindor Tower", 100),
    createCheck("Headmaster's Office", 105, [{ type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'hp_dumbledore' }]),
    createCheck("Hufflepuff Common Room", 110),
    createCheck("Potions Classroom", 115),
    createCheck("The Great Hall", 120),
    createCheck("Room of Requirement", 125),
    createCheck("Slytherin Dungeon", 130),
    createCheck("Ministry of Magic", 135, [{ type: 'MA', details: 'Requires MoM authorization.', residentId: 'hp_umbridge' }]),

    // Sci-Fi - Terminator
    createCheck("Cyberdyne Annex", 140),
    createCheck("Future Resistance Bunker", 145, [{ type: 'MA', details: 'Leadership check-in required.', residentId: 't_john' }]),
    createCheck("Skynet Command Center", 150, [{ type: 'SW', details: 'Hostile cybernetic organism.', residentId: 't_t800_m101' }]),
    createCheck("Pescadero State Hospital", 155),
    createCheck("Tech-Noir Nightclub", 160),
    createCheck("Cyberdyne Systems HQ", 165),

    // Sci-Fi - Alien
    createCheck("LV-426 Medlab", 170, [{ type: 'SW', details: 'Xenomorph detected. High alert.', residentId: 'al_ripley' }]),
    createCheck("Nostromo Galley", 175),
    createCheck("Nostromo Cockpit", 180),
    createCheck("LV-426 Operations Center", 185),
    createCheck("LV-426 Ventilation Shafts", 190),
    createCheck("Nostromo Hypersleep Chamber", 195, [{ type: 'SW', details: 'Synthetic. Behavioral monitoring.', residentId: 'al_ash' }]),
    createCheck("USCSS Prometheus Bridge", 200),

    // Sci-Fi - The Expanse
    createCheck("Rocinante Cockpit", 205),
    createCheck("Rocinante Engineering", 210),
    createCheck("Rocinante Galley", 215),
    createCheck("UN-One", 220),
    createCheck("Tycho Station Command", 225),
    createCheck("Ceres Station Docks", 230),
  ];

  // --- B-WING STRESS TEST DATA GENERATOR ---
  // Group 1 (6 checks): Sequential Misses (5s apart) -> Tests individual toasts.
  // Group 2 (6 checks): Simultaneous Misses (0s apart) -> Tests aggregation logic.

  const bWingStressChecks: SafetyCheck[] = Array.from({ length: 12 }).map((_, i) => {
    const isGroup2 = i >= 6;

    // We want these to become MISSED shortly.
    // Missed Threshold = Due Date + 7m.
    // So if we want it to miss in 10s, Due Date must be (Now - 7m + 10s).

    const startDelay = isGroup2 ? 70 : 10; // Group 1 starts in 10s, Group 2 in 70s
    const stagger = isGroup2 ? 0 : (i % 6) * 5;

    const secondsUntilMissed = startDelay + stagger;

    // Due Date = Now - 7m (buffer) + secondsUntilMissed
    const dueTimeMs = now.getTime() - (7 * 60 * 1000) + (secondsUntilMissed * 1000);

    const locationName = `B1-Stress-${String(i + 1).padStart(2, '0')}`;

    // Find the actual resident object to ensure ID matching
    const residents = residentsByLocation[locationName];
    const finalResidents = residents || [{
      id: `res_stress_b_${i}`,
      name: `Subject ${i + 1}`,
      location: locationName
    } as Resident];

    return {
      id: `chk_stress_b_${i}`,
      type: 'scheduled',
      residents: finalResidents,
      status: 'late', // Already technically late relative to due date
      dueDate: new Date(dueTimeMs).toISOString(),
      walkingOrderIndex: 50 + i,
      specialClassifications: [],
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
    } as SafetyCheck;
  });

  // Add some completed checks for history view
  const historyChecks = [
    {
      id: 'chk_completed_1',
      type: 'scheduled',
      residents: [mockResidents[0]],
      status: 'complete',
      dueDate: inNMinutes(-30),
      walkingOrderIndex: 900,
      lastChecked: inNMinutes(-32),
      completionStatus: 'All good',
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL
    } as SafetyCheck,
    {
      id: 'chk_completed_2',
      type: 'scheduled',
      residents: [mockResidents[1]],
      status: 'complete',
      dueDate: inNMinutes(-60),
      walkingOrderIndex: 901,
      lastChecked: inNMinutes(-61),
      completionStatus: 'Assisted',
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL
    } as SafetyCheck,
  ];

  return [...standardChecks, ...bWingStressChecks, ...historyChecks];
};

// Cached initial checks for first load (generated at import time)
export const initialChecks: SafetyCheck[] = generateInitialChecks();