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
  // Lifecycle stress test configuration:
  // - A-Wing: Specifically staggered to test all lifecycle transitions.
  // - Other Wings: Spread evenly within the 15m cap.

  const standardChecks = [
    // =================================================================
    //               A-WING: LIFECYCLE STRESS TEST ZONE
    // =================================================================
    // Checks are positioned near transition boundaries (Missed, Due, Upcoming).

    // --- MISSED GROUP (Multi-cycle test) ---
    createCheck("A1-101", -30),   // "2 Missed" (2 cycles)
    createCheck("A1-102", -14.5), // "Missed" -> "2 Missed" in 30s
    createCheck("A1-103", -1),    // "Missed" (just crossed 15m)

    // --- DUE GROUP (Near-missed transition) ---
    createCheck("A2-205", 0.5),   // "Due" -> "Missed" in 30s
    createCheck("A2-206", 1.5),   // "Due" -> "Missed" in 90s

    // --- UPCOMING -> DUE TRANSITION ---
    createCheck("A3-301", 2.1, [{ type: 'CS', details: 'Separation from J. Miller', residentId: 'jdc_a3_1' }]),  // "Upcoming" -> "Due" in 6s
    createCheck("A3-302", 2.5),   // "Upcoming" -> "Due" in 30s

    // --- UPCOMING (Mid-range) ---
    createCheck("A4-410", 5),
    createCheck("A4-411", 8),

    // --- UPCOMING (Fresh) ---
    createCheck("A5-502", 12, [{ type: 'MW', details: 'Asthmatic, check inhaler', residentId: 'jdc_a5_1' }]),
    createCheck("A5-503", 14),

    // --- A6 (Stable, fresh) ---
    createCheck("A6-601", 15, [{ type: 'SR', details: 'Active watch, 15-min checks', residentId: 'jdc_a6_1' }]),
    createCheck("A6-602", 15),
    createCheck("A6-604", 15, [
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_4' },
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_5' }
    ]),

    // =================================================================
    //               OTHER WINGS: EVEN SPREAD (0-15m Cap)
    // =================================================================

    // JDC - B-Wing (Staggered)
    createCheck("B1-101", 5),
    createCheck("B1-102", 10),
    createCheck("B2-201", 14),

    // JDC - C-Wing (Staggered)
    createCheck("C1-101", 3),
    createCheck("C1-102", 8),

    // Sci-Fi - Star Wars (Spread)
    createCheck("Death Star Detention Block", 2),
    createCheck("Emperor's Throne Room", 4, [
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_palp' },
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_vader' }
    ]),
    createCheck("Millennium Falcon", 6),
    createCheck("Mos Eisley Cantina", 8),
    createCheck("Tatooine Homestead", 10),
    createCheck("Dagobah", 12),
    createCheck("Bespin", 13),
    createCheck("Jabba's Palace", 15),

    // Sci-Fi - Harry Potter (Spread)
    createCheck("Gryffindor Tower", 3),
    createCheck("Headmaster's Office", 5, [{ type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'hp_dumbledore' }]),
    createCheck("Hufflepuff Common Room", 7),
    createCheck("Potions Classroom", 9),
    createCheck("The Great Hall", 11),
    createCheck("Room of Requirement", 13),
    createCheck("Slytherin Dungeon", 14),
    createCheck("Ministry of Magic", 15, [{ type: 'MA', details: 'Requires MoM authorization.', residentId: 'hp_umbridge' }]),

    // Sci-Fi - Terminator (Spread)
    createCheck("Cyberdyne Annex", 4),
    createCheck("Future Resistance Bunker", 6, [{ type: 'MA', details: 'Leadership check-in required.', residentId: 't_john' }]),
    createCheck("Skynet Command Center", 8, [{ type: 'SW', details: 'Hostile cybernetic organism.', residentId: 't_t800_m101' }]),
    createCheck("Pescadero State Hospital", 10),
    createCheck("Tech-Noir Nightclub", 12),
    createCheck("Cyberdyne Systems HQ", 15),

    // Sci-Fi - Alien (Spread)
    createCheck("LV-426 Medlab", 2, [{ type: 'SW', details: 'Xenomorph detected. High alert.', residentId: 'al_ripley' }]),
    createCheck("Nostromo Galley", 5),
    createCheck("Nostromo Cockpit", 7),
    createCheck("LV-426 Operations Center", 9),
    createCheck("LV-426 Ventilation Shafts", 11),
    createCheck("Nostromo Hypersleep Chamber", 13, [{ type: 'SW', details: 'Synthetic. Behavioral monitoring.', residentId: 'al_ash' }]),
    createCheck("USCSS Prometheus Bridge", 15),

    // Sci-Fi - The Expanse (Spread)
    createCheck("Rocinante Cockpit", 3),
    createCheck("Rocinante Engineering", 6),
    createCheck("Rocinante Galley", 9),
    createCheck("UN-One", 11),
    createCheck("Tycho Station Command", 13),
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