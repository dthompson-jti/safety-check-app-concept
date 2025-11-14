// src/data/mock/checkData.ts
import { SafetyCheck } from '../../types';
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
    
    return [
      // --- LATE CHECKS ---
      { id: 'chk1', residents: residentsByLocation['Future Resistance Bunker'], status: 'pending', dueDate: inNMinutes(-15), walkingOrderIndex: 1, specialClassification: { type: 'MA', details: 'Leadership check-in required.', residentId: 't_john' }},
      { id: 'chk2', residents: residentsByLocation['Emperor\'s Throne Room'], status: 'pending', dueDate: inNMinutes(-5), walkingOrderIndex: 2, specialClassification: { type: 'SW', details: 'High-risk Sith Lords. Approach with caution.', residentId: 'sw_palp' }},
      
      // --- DUE SOON CHECKS ---
      { id: 'chk3', residents: residentsByLocation['LV-426 Medlab'], status: 'pending', dueDate: inNMinutes(1), walkingOrderIndex: 3, specialClassification: { type: 'SW', details: 'Xenomorph detected in vicinity. High alert.', residentId: 'al_ripley' }},
      { id: 'chk4', residents: residentsByLocation['A6-601'], status: 'pending', dueDate: inNMinutes(2), walkingOrderIndex: 4, specialClassification: { type: 'SR', details: 'Active watch, 15-min checks', residentId: 'jdc_a6_1' }},
      { id: 'chk_a604', residents: residentsByLocation['A6-604'], status: 'pending', dueDate: inNMinutes(2.5), walkingOrderIndex: 5, specialClassification: { type: 'SR', details: 'Both residents on suicide watch.', residentId: 'jdc_a6_4' }},

      // --- PENDING CHECKS (A-WING) ---
      { id: 'chk_a101', residents: residentsByLocation['A1-101'], status: 'pending', dueDate: inNMinutes(5), walkingOrderIndex: 6 },
      { id: 'chk_a102', residents: residentsByLocation['A1-102'], status: 'pending', dueDate: inNMinutes(8), walkingOrderIndex: 7 },
      { id: 'chk_a205', residents: residentsByLocation['A2-205'], status: 'pending', dueDate: inNMinutes(10), walkingOrderIndex: 8 },
      { id: 'chk_a206', residents: residentsByLocation['A2-206'], status: 'pending', dueDate: inNMinutes(12), walkingOrderIndex: 9 },
      { id: 'chk_a301', residents: residentsByLocation['A3-301'], status: 'pending', dueDate: inNMinutes(15), walkingOrderIndex: 10, specialClassification: { type: 'CS', details: 'Separation from J. Miller', residentId: 'jdc_a3_1' }},
      { id: 'chk_a302', residents: residentsByLocation['A3-302'], status: 'pending', dueDate: inNMinutes(18), walkingOrderIndex: 11 },
      { id: 'chk_a410', residents: residentsByLocation['A4-410'], status: 'pending', dueDate: inNMinutes(20), walkingOrderIndex: 12 },
      { id: 'chk_a411', residents: residentsByLocation['A4-411'], status: 'pending', dueDate: inNMinutes(22), walkingOrderIndex: 13 },
      { id: 'chk_a502', residents: residentsByLocation['A5-502'], status: 'pending', dueDate: inNMinutes(25), walkingOrderIndex: 14, specialClassification: { type: 'MW', details: 'Asthmatic, check inhaler', residentId: 'jdc_a5_1' }},
      { id: 'chk_a503', residents: residentsByLocation['A5-503'], status: 'pending', dueDate: inNMinutes(28), walkingOrderIndex: 15 },
      { id: 'chk_a602', residents: residentsByLocation['A6-602'], status: 'pending', dueDate: inNMinutes(30), walkingOrderIndex: 16 },

      // --- PENDING CHECKS (B & C WING) ---
      { id: 'chk_b101_pending', residents: residentsByLocation['B1-101'], status: 'pending', dueDate: inNMinutes(33), walkingOrderIndex: 17 },
      { id: 'chk_b102_pending', residents: residentsByLocation['B1-102'], status: 'pending', dueDate: inNMinutes(35), walkingOrderIndex: 18 },
      { id: 'chk_b201_pending', residents: residentsByLocation['B2-201'], status: 'pending', dueDate: inNMinutes(38), walkingOrderIndex: 19 },
      { id: 'chk_c101_pending', residents: residentsByLocation['C1-101'], status: 'pending', dueDate: inNMinutes(40), walkingOrderIndex: 20 },
      { id: 'chk_c102_pending', residents: residentsByLocation['C1-102'], status: 'pending', dueDate: inNMinutes(42), walkingOrderIndex: 21 },

      // --- PENDING CHECKS (SCI-FI) ---
      { id: 'chk_hp_dumbledore', residents: residentsByLocation['Headmaster\'s Office'], status: 'pending', dueDate: inNMinutes(45), walkingOrderIndex: 22, specialClassification: { type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'hp_dumbledore' }},
      { id: 'chk_sw_millennium', residents: residentsByLocation['Millennium Falcon'], status: 'pending', dueDate: inNMinutes(48), walkingOrderIndex: 23 },
      { id: 'chk_sw_tatooine', residents: residentsByLocation['Tatooine Homestead'], status: 'pending', dueDate: inNMinutes(50), walkingOrderIndex: 24 },
      { id: 'chk_hp_gryffindor', residents: residentsByLocation['Gryffindor Tower'], status: 'pending', dueDate: inNMinutes(52), walkingOrderIndex: 25 },
      { id: 'chk_ex_roci_cockpit', residents: residentsByLocation['Rocinante Cockpit'], status: 'pending', dueDate: inNMinutes(55), walkingOrderIndex: 26 },
      { id: 'chk_al_ash', residents: residentsByLocation['Nostromo Hypersleep Chamber'], status: 'pending', dueDate: inNMinutes(58), walkingOrderIndex: 27, specialClassification: { type: 'SW', details: 'Synthetic. Behavioral monitoring.', residentId: 'al_ash' }},
      { id: 'chk_sw_cantina', residents: residentsByLocation['Mos Eisley Cantina'], status: 'pending', dueDate: inNMinutes(60), walkingOrderIndex: 28 },
      { id: 'chk_ex_roci_eng', residents: residentsByLocation['Rocinante Engineering'], status: 'pending', dueDate: inNMinutes(62), walkingOrderIndex: 29 },
      { id: 'chk_al_ops', residents: residentsByLocation['LV-426 Operations Center'], status: 'pending', dueDate: inNMinutes(65), walkingOrderIndex: 30 },
      { id: 'chk_sw_jabba', residents: residentsByLocation['Jabba\'s Palace'], status: 'pending', dueDate: inNMinutes(68), walkingOrderIndex: 31 },
      { id: 'chk_t_skynet', residents: residentsByLocation['Skynet Command Center'], status: 'pending', dueDate: inNMinutes(70), walkingOrderIndex: 32, specialClassification: { type: 'SW', details: 'Hostile cybernetic organism.', residentId: 't_t800_m101' }},
      { id: 'chk_ex_unone', residents: residentsByLocation['UN-One'], status: 'pending', dueDate: inNMinutes(72), walkingOrderIndex: 33 },
      { id: 'chk_al_vents', residents: residentsByLocation['LV-426 Ventilation Shafts'], status: 'pending', dueDate: inNMinutes(75), walkingOrderIndex: 34 },
      { id: 'chk_hp_magic', residents: residentsByLocation['Ministry of Magic'], status: 'pending', dueDate: inNMinutes(78), walkingOrderIndex: 35, specialClassification: { type: 'MA', details: 'Requires MoM authorization.', residentId: 'hp_umbridge' } },

      // --- COMPLETED CHECKS (For History View) ---
      { id: 'chk_completed_1', residents: [mockResidents[0]], status: 'complete', dueDate: inNMinutes(-30), walkingOrderIndex: 36, lastChecked: inNMinutes(-32), completionStatus: 'All good' },
      { id: 'chk_completed_2', residents: [mockResidents[1]], status: 'complete', dueDate: inNMinutes(-60), walkingOrderIndex: 37, lastChecked: inNMinutes(-61), completionStatus: 'Assisted' },
    ];
})();