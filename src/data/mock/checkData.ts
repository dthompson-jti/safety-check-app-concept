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

export const initialChecks: SafetyCheck[] = (() => {
  const now = new Date();
  const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

  let walkingIndex = 1;
  const DEFAULT_INTERVAL = 15; // Minutes

  // Helper to create checks from the table data for consistency.
  const createCheck = (location: string, specialClassifications: { type: string, details: string, residentId: string }[] = []) => {
    return {
      id: `chk_${location.toLowerCase().replace(/[\s']/g, '_')}`,
      type: 'scheduled',
      residents: residentsByLocation[location] || [],
      status: 'pending',
      dueDate: inNMinutes(walkingIndex * 2),
      walkingOrderIndex: walkingIndex++,
      specialClassifications,
      generationId: 1,
      baseInterval: DEFAULT_INTERVAL,
    } as SafetyCheck;
  };

  const standardChecks = [
    // JDC - A-Wing
    createCheck("A1-101"),
    createCheck("A1-102"),
    createCheck("A2-205"),
    createCheck("A2-206"),
    createCheck("A3-301", [{ type: 'CS', details: 'Separation from J. Miller', residentId: 'jdc_a3_1' }]),
    createCheck("A3-302"),
    createCheck("A4-410"),
    createCheck("A4-411"),
    createCheck("A5-502", [{ type: 'MW', details: 'Asthmatic, check inhaler', residentId: 'jdc_a5_1' }]),
    createCheck("A5-503"),
    createCheck("A6-601", [{ type: 'SR', details: 'Active watch, 15-min checks', residentId: 'jdc_a6_1' }]),
    createCheck("A6-602"),
    createCheck("A6-604", [
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_4' },
      { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_5' }
    ]),

    // JDC - B-Wing (Standard)
    createCheck("B1-101"),
    createCheck("B1-102"),
    createCheck("B2-201"),

    // JDC - C-Wing
    createCheck("C1-101"),
    createCheck("C1-102"),

    // Sci-Fi - Star Wars
    createCheck("Death Star Detention Block"),
    createCheck("Emperor's Throne Room", [
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_palp' },
      { type: 'SW', details: "High-risk Sith Lords. Approach with caution.", residentId: 'sw_vader' }
    ]),
    createCheck("Millennium Falcon"),
    createCheck("Mos Eisley Cantina"),
    createCheck("Tatooine Homestead"),
    createCheck("Dagobah"),
    createCheck("Bespin"),
    createCheck("Jabba's Palace"),

    // Sci-Fi - Harry Potter
    createCheck("Gryffindor Tower"),
    createCheck("Headmaster's Office", [{ type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'hp_dumbledore' }]),
    createCheck("Hufflepuff Common Room"),
    createCheck("Potions Classroom"),
    createCheck("The Great Hall"),
    createCheck("Room of Requirement"),
    createCheck("Slytherin Dungeon"),
    createCheck("Ministry of Magic", [{ type: 'MA', details: 'Requires MoM authorization.', residentId: 'hp_umbridge' }]),

    // Sci-Fi - Terminator
    createCheck("Cyberdyne Annex"),
    createCheck("Future Resistance Bunker", [{ type: 'MA', details: 'Leadership check-in required.', residentId: 't_john' }]),
    createCheck("Skynet Command Center", [{ type: 'SW', details: 'Hostile cybernetic organism.', residentId: 't_t800_m101' }]),
    createCheck("Pescadero State Hospital"),
    createCheck("Tech-Noir Nightclub"),
    createCheck("Cyberdyne Systems HQ"),

    // Sci-Fi - Alien
    createCheck("LV-426 Medlab", [{ type: 'SW', details: 'Xenomorph detected. High alert.', residentId: 'al_ripley' }]),
    createCheck("Nostromo Galley"),
    createCheck("Nostromo Cockpit"),
    createCheck("LV-426 Operations Center"),
    createCheck("LV-426 Ventilation Shafts"),
    createCheck("Nostromo Hypersleep Chamber", [{ type: 'SW', details: 'Synthetic. Behavioral monitoring.', residentId: 'al_ash' }]),
    createCheck("USCSS Prometheus Bridge"),

    // Sci-Fi - The Expanse
    createCheck("Rocinante Cockpit"),
    createCheck("Rocinante Engineering"),
    createCheck("Rocinante Galley"),
    createCheck("UN-One"),
    createCheck("Tycho Station Command"),
    createCheck("Ceres Station Docks"),
  ];

  // --- B-WING STRESS TEST DATA GENERATOR ---
  // Group 1 (6 checks): Sequential Misses (5s apart) -> Tests individual toasts.
  // Group 2 (6 checks): Simultaneous Misses (0s apart) -> Tests aggregation logic.
  
  const bWingStressChecks: SafetyCheck[] = Array.from({ length: 12 }).map((_, i) => {
    const isGroup2 = i >= 6;
    
    const startDelay = isGroup2 ? 70 : 10; // Group 1 starts in 10s, Group 2 in 70s
    
    // CRITICAL CHANGE: 
    // Group 1 staggers by 5s. 
    // Group 2 has NO stagger (all 0), forcing them to occur in the same "Tick".
    const stagger = isGroup2 ? 0 : (i % 6) * 5; 
    
    const secondsUntilMissed = startDelay + stagger;
    const dueTimeMs = now.getTime() + (secondsUntilMissed * 1000) - (DEFAULT_INTERVAL * 60 * 1000);

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
})();