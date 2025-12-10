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
  // Simplified 3-state model:
  // - Missed: Due date has passed (negative offset)
  // - Due: Due in 0-2 minutes (warning window)
  // - Upcoming: Due in 2-15 minutes
  // NOTE: No check should be due more than 15 minutes from now

  const standardChecks = [
    // --- MISSED GROUP (staggered: 58m, 44m, 13m ago) ---
    createCheck("A1-101", -58), // "4 Missed" badge (58 min = 4 cycles)
    createCheck("A1-102", -44), // "3 Missed" badge (44 min = 3 cycles)
    createCheck("A1-103", -13), // "Missed" badge (13 min = 1 cycle)

    // --- DUE GROUP (Due in 1-2 mins - warning window) ---
    createCheck("A2-205", 1),
    createCheck("A2-206", 2),

    // --- UPCOMING GROUP (Due in 3-15 mins) ---
    createCheck("A3-301", 5, [{ type: 'CS', details: 'Separation from J. Miller', residentId: 'jdc_a3_1' }]),
    createCheck("A3-302", 8),
    createCheck("A4-410", 10),
    createCheck("A4-411", 12),
    createCheck("A5-502", 14, [{ type: 'MW', details: 'Asthmatic, check inhaler', residentId: 'jdc_a5_1' }]),
    createCheck("A5-503", 15), // Max future due time

    // --- OTHER WINGS (capped at 15m future) ---
    createCheck("A6-601", 15, [{ type: 'SR', details: 'Active watch, 15-min checks', residentId: 'jdc_a6_1' }]),
    createCheck("A6-602", 15),
    createCheck("A6-604", 15, [
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_4' },
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_5' }
    ]),

    // JDC - B-Wing (capped at 15m)
    createCheck("B1-101", 15),
    createCheck("B1-102", 15),
    createCheck("B2-201", 15),

    // JDC - C-Wing (capped at 15m)
    createCheck("C1-101", 15),
    createCheck("C1-102", 15),

    // Sci-Fi - Star Wars (capped at 15m future)
    createCheck("Death Star Detention Block", 15),
    createCheck("Emperor's Throne Room", 15, [
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_palp' },
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_vader' }
    ]),
    createCheck("Millennium Falcon", 15),
    createCheck("Mos Eisley Cantina", 15),
    createCheck("Tatooine Homestead", 15),
    createCheck("Dagobah", 15),
    createCheck("Bespin", 15),
    createCheck("Jabba's Palace", 15),

    // Sci-Fi - Harry Potter (capped at 15m future)
    createCheck("Gryffindor Tower", 15),
    createCheck("Headmaster's Office", 15, [{ type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'hp_dumbledore' }]),
    createCheck("Hufflepuff Common Room", 15),
    createCheck("Potions Classroom", 15),
    createCheck("The Great Hall", 15),
    createCheck("Room of Requirement", 15),
    createCheck("Slytherin Dungeon", 15),
    createCheck("Ministry of Magic", 15, [{ type: 'MA', details: 'Requires MoM authorization.', residentId: 'hp_umbridge' }]),

    // Sci-Fi - Terminator (capped at 15m future)
    createCheck("Cyberdyne Annex", 15),
    createCheck("Future Resistance Bunker", 15, [{ type: 'MA', details: 'Leadership check-in required.', residentId: 't_john' }]),
    createCheck("Skynet Command Center", 15, [{ type: 'SW', details: 'Hostile cybernetic organism.', residentId: 't_t800_m101' }]),
    createCheck("Pescadero State Hospital", 15),
    createCheck("Tech-Noir Nightclub", 15),
    createCheck("Cyberdyne Systems HQ", 15),

    // Sci-Fi - Alien (capped at 15m future)
    createCheck("LV-426 Medlab", 15, [{ type: 'SW', details: 'Xenomorph detected. High alert.', residentId: 'al_ripley' }]),
    createCheck("Nostromo Galley", 15),
    createCheck("Nostromo Cockpit", 15),
    createCheck("LV-426 Operations Center", 15),
    createCheck("LV-426 Ventilation Shafts", 15),
    createCheck("Nostromo Hypersleep Chamber", 15, [{ type: 'SW', details: 'Synthetic. Behavioral monitoring.', residentId: 'al_ash' }]),
    createCheck("USCSS Prometheus Bridge", 15),

    // Sci-Fi - The Expanse (capped at 15m future)
    createCheck("Rocinante Cockpit", 15),
    createCheck("Rocinante Engineering", 15),
    createCheck("Rocinante Galley", 15),
    createCheck("UN-One", 15),
    createCheck("Tycho Station Command", 15),
    createCheck("Ceres Station Docks", 15),
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
      status: 'pending', // Will be recalculated by atoms based on dueDate
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