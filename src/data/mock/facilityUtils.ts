// src/data/mock/facilityUtils.ts
import { facilityData } from './facilityData';

// Create lookup maps for efficient searching.
const locationToUnitMap = new Map<string, string>();
const unitToGroupMap = new Map<string, string>();

facilityData.forEach(group => {
  group.units.forEach(unit => {
    unitToGroupMap.set(unit.id, group.id);
  });
});

// Note: This is a simplified mapping for the mock data. A real system would
// have this relationship stored in the database. We manually list the Sci-Fi
// locations here.
const sciFiLocations = {
  'star-wars': [
    "Death Star Detention Block", "Emperor's Throne Room", "Millennium Falcon",
    "Mos Eisley Cantina", "Tatooine Homestead", "Dagobah", "Bespin", "Jabba's Palace"
  ],
  'harry-potter': [
    "Gryffindor Tower", "Headmaster's Office", "Hufflepuff Common Room",
    "Potions Classroom", "The Great Hall", "Room of Requirement",
    "Slytherin Dungeon", "Ministry of Magic"
  ],
  'terminator': [
    "Cyberdyne Annex", "Future Resistance Bunker", "Skynet Command Center",
    "Pescadero State Hospital", "Tech-Noir Nightclub", "Cyberdyne Systems HQ"
  ],
  'alien': [
    "LV-426 Medlab", "Nostromo Galley", "Nostromo Cockpit",
    "LV-426 Operations Center", "LV-426 Ventilation Shafts",
    "Nostromo Hypersleep Chamber", "USCSS Prometheus Bridge"
  ],
  'expanse': [
    "Rocinante Cockpit", "Rocinante Engineering", "Rocinante Galley",
    "UN-One", "Tycho Station Command", "Ceres Station Docks"
  ],
};

// Populate the map for Sci-Fi locations
for (const [unitId, locations] of Object.entries(sciFiLocations)) {
  locations.forEach(location => {
    locationToUnitMap.set(location, unitId);
  });
}

/**
 * Takes a location string and returns the corresponding facility group and unit IDs.
 * @param location The name of the resident's location.
 * @returns An object with groupId and unitId, or null if not found.
 */
export const getFacilityContextForLocation = (location: string): { groupId: string; unitId: string } | null => {
  // --- Strategy 1: Check for JDC prefix (e.g., "A1-101") ---
  const jdcPrefix = location.charAt(0).toLowerCase();
  if (['a', 'b', 'c'].includes(jdcPrefix) && location.includes('-')) {
    const unitId = `${jdcPrefix}-wing`;
    const groupId = unitToGroupMap.get(unitId);
    if (groupId) {
      return { groupId, unitId };
    }
  }

  // --- Strategy 2: Look up in the Sci-Fi map ---
  const unitId = locationToUnitMap.get(location);
  if (unitId) {
    const groupId = unitToGroupMap.get(unitId);
    if (groupId) {
      return { groupId, unitId };
    }
  }

  return null;
};