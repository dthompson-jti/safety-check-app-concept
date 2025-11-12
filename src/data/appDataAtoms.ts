// src/data/appDataAtoms.ts
import { atom } from 'jotai';
import { produce, Draft } from 'immer';
import { nanoid } from 'nanoid';
import { SafetyCheck, Resident, SafetyCheckStatus } from '../types';
import { currentTimeAtom, historyFilterAtom, completingChecksAtom } from './atoms';

// =================================================================
//                 Mock Data Store
// =================================================================

export const mockResidents: Resident[] = [
  // Star Wars
  { id: 'res1', name: 'Luke Skywalker', location: 'Tatooine Homestead' },
  { id: 'res2', name: 'Obi-Wan Kenobi', location: 'Tatooine Homestead' },
  { id: 'res3', name: 'Han Solo', location: 'Millennium Falcon' },
  { id: 'res4', name: 'Garrett Chan', location: 'Mos Eisley Cantina' },
  { id: 'res5', name: 'Brett Corbin', location: 'Mos Eisley Cantina' },
  { id: 'res_sw1', name: 'Princess Leia Organa', location: 'Hoth Echo Base' },
  { id: 'res_sw2', name: 'Emperor Palpatine', location: "The Emperor's Throne Room" },
  { id: 'res_sw3', name: 'Darth Vader', location: "The Emperor's Throne Room" },

  // Harry Potter
  { id: 'res6', name: 'Harry Potter', location: 'Gryffindor Tower' },
  { id: 'res7', name: 'Hermione Granger', location: 'Gryffindor Tower' },
  { id: 'res8', name: 'Ron Weasley', location: 'Gryffindor Tower' },
  { id: 'res9', name: 'Albus Dumbledore', location: "Headmaster's Office" },
  { id: 'res10', name: 'John Maier', location: 'Hufflepuff Common Room' },
  { id: 'res11', name: 'Jalpa Mazmudar', location: 'Platform 9 and 3/4' },
  { id: 'res_hp1', name: 'Severus Snape', location: 'Potions Classroom' },
  { id: 'res_hp2', name: 'Minerva McGonagall', location: 'The Great Hall' },
  
  // The Expanse
  { id: 'res12', name: 'James Holden', location: 'Rocinante Cockpit' },
  { id: 'res13', name: 'Alex Kamal', location: 'Rocinante Cockpit' },
  { id: 'res14', name: 'Naomi Nagata', location: 'Rocinante Engineering' },
  { id: 'res15', name: 'Dave Thompson', location: 'Rocinante Mess Hall' },
  { id: 'res16', name: 'Amos Burton', location: 'Rocinante Galley' },
  { id: 'res_ex0', name: 'Chrisjen Avasarala', location: 'UN-One' },
  { id: 'res_ex1', name: 'Fred Johnson', location: 'Tycho Station Command' },
  { id: 'res_ex2', name: 'Joe Miller', location: 'Ceres Station Docks' },

  // Terminator
  { id: 'res17', name: 'Sarah Connor', location: 'Cyberdyne Annex' },
  { id: 'res18', name: 'Kyle Reese', location: 'Cyberdyne Annex' },
  { id: 'res19', name: 'John Connor', location: 'Future Resistance Bunker' },
  { id: 'res20', name: 'Sean Jordan', location: 'Future Resistance Bunker' },
  { id: 'res21', name: 'Christian Morin', location: 'Future Resistance Bunker' },
  { id: 'res_t1', name: 'T-800 (Model 101)', location: 'Skynet Command Center' },
  { id: 'res_t3', name: 'The T-800 (Hunter)', location: 'Tech-Noir Nightclub' },
  { id: 'res_t4', name: 'Miles Dyson', location: 'Cyberdyne Systems Lab' },

  // Alien Series
  { id: 'res22', name: 'Ellen Ripley', location: 'LV-426 (Medlab)' },
  { id: 'res23', name: 'Jimmy Tang', location: 'Nostromo Galley' },
  { id: 'res24', name: 'Jeff Siemens', location: 'Nostromo Cockpit' },
  { id: 'res25', name: 'David 8', location: 'USCSS Prometheus Bridge' },
  { id: 'res_al1', name: 'Ash', location: 'Nostromo Medbay' },
  { id: 'res_al2', name: 'Corporal Hicks', location: 'LV-426 (Operations Center)' },
  { id: 'res_al3', name: 'Private Hudson', location: 'LV-426 (Operations Center)' },
  { id: 'res_al4', name: 'Newt', location: 'LV-426 (Ventilation Shafts)' },

  // Other Themes
  { id: 'res_ot1', name: 'John Wick', location: 'Continental NYC' },
  { id: 'res_ot2', name: 'Leto Atreides', location: 'Arrakis Palace' },
];

// Generate mock checks dynamically. This ensures that the relative times
// are always calculated against the CURRENT time when the app loads, not a
// stale time from when the module was first imported.
const initialChecks: SafetyCheck[] = (() => {
    const now = new Date();
    const inNMinutes = (n: number) => new Date(now.getTime() + n * 60 * 1000).toISOString();

    return [
      // == Terminator Theme (Late / Due Soon) ==
      { id: 'chk1', residents: [mockResidents[25], mockResidents[26], mockResidents[27]], status: 'pending', dueDate: inNMinutes(-5), walkingOrderIndex: 1, specialClassification: { type: 'MA', details: 'Leadership check-in required.', residentId: 'res19' }}, // John, Sean, Christian
      { id: 'chk2', residents: [mockResidents[28]], status: 'pending', dueDate: inNMinutes(-2), walkingOrderIndex: 2 }, // T-800 Skynet
      { id: 'chk3', residents: [mockResidents[23], mockResidents[24]], status: 'pending', dueDate: inNMinutes(1), walkingOrderIndex: 3 }, // Sarah & Kyle
      { id: 'chk4', residents: [mockResidents[30]], status: 'pending', dueDate: inNMinutes(3), walkingOrderIndex: 4 }, // Miles Dyson
      { id: 'chk5', residents: [mockResidents[29]], status: 'pending', dueDate: inNMinutes(5), walkingOrderIndex: 5 }, // T-800 Hunter
      
      // == Star Wars Theme ==
      { id: 'chk6', residents: [mockResidents[0], mockResidents[1]], status: 'pending', dueDate: inNMinutes(10), walkingOrderIndex: 6 }, // Luke & Obi-Wan
      { id: 'chk7', residents: [mockResidents[3], mockResidents[4]], status: 'pending', dueDate: inNMinutes(12), walkingOrderIndex: 7 }, // Garrett & Brett
      { id: 'chk8', residents: [mockResidents[2]], status: 'pending', dueDate: inNMinutes(14), walkingOrderIndex: 8 }, // Han Solo
      { id: 'chk9', residents: [mockResidents[5]], status: 'pending', dueDate: inNMinutes(16), walkingOrderIndex: 9 }, // Leia
      { id: 'chk10', residents: [mockResidents[6], mockResidents[7]], status: 'pending', dueDate: inNMinutes(18), walkingOrderIndex: 10, specialClassification: { type: 'SW', details: 'High-risk Sith Lords. Approach with caution.', residentId: 'res_sw3' } }, // Palpatine & Vader

      // == Harry Potter Theme ==
      { id: 'chk11', residents: [mockResidents[8], mockResidents[9], mockResidents[10]], status: 'pending', dueDate: inNMinutes(25), walkingOrderIndex: 11 }, // Harry, Hermione, Ron
      { id: 'chk12', residents: [mockResidents[12]], status: 'pending', dueDate: inNMinutes(27), walkingOrderIndex: 12 }, // John Maier
      { id: 'chk13', residents: [mockResidents[13]], status: 'pending', dueDate: inNMinutes(29), walkingOrderIndex: 13 }, // Jalpa Mazmudar
      { id: 'chk14', residents: [mockResidents[14]], status: 'pending', dueDate: inNMinutes(31), walkingOrderIndex: 14 }, // Snape
      { id: 'chk15', residents: [mockResidents[15]], status: 'pending', dueDate: inNMinutes(33), walkingOrderIndex: 15 }, // McGonagall
      { id: 'chk16', residents: [mockResidents[11]], status: 'pending', dueDate: inNMinutes(35), walkingOrderIndex: 16, specialClassification: { type: 'SR', details: 'Monitor for phoenix activity.', residentId: 'res9' }}, // Dumbledore

      // == The Expanse Theme ==
      { id: 'chk17', residents: [mockResidents[16], mockResidents[17]], status: 'pending', dueDate: inNMinutes(40), walkingOrderIndex: 17 }, // James & Alex
      { id: 'chk18', residents: [mockResidents[18]], status: 'pending', dueDate: inNMinutes(42), walkingOrderIndex: 18 }, // Naomi
      { id: 'chk19', residents: [mockResidents[20]], status: 'pending', dueDate: inNMinutes(44), walkingOrderIndex: 19 }, // Amos
      { id: 'chk20', residents: [mockResidents[19]], status: 'pending', dueDate: inNMinutes(46), walkingOrderIndex: 20 }, // Dave Thompson
      { id: 'chk21', residents: [mockResidents[21]], status: 'pending', dueDate: inNMinutes(48), walkingOrderIndex: 21 }, // Avasarala
      { id: 'chk22', residents: [mockResidents[22]], status: 'pending', dueDate: inNMinutes(50), walkingOrderIndex: 22 }, // Fred Johnson
      { id: 'chk23', residents: [mockResidents[23]], status: 'pending', dueDate: inNMinutes(52), walkingOrderIndex: 23 }, // Joe Miller
      
      // == Alien Series Theme ==
      { id: 'chk24', residents: [mockResidents[31]], status: 'pending', dueDate: inNMinutes(60), walkingOrderIndex: 24, specialClassification: { type: 'SW', details: 'Xenomorph detected in vicinity. High alert.', residentId: 'res22' }}, // Ellen Ripley
      { id: 'chk25', residents: [mockResidents[36], mockResidents[37]], status: 'pending', dueDate: inNMinutes(62), walkingOrderIndex: 25 }, // Hicks & Hudson
      { id: 'chk26', residents: [mockResidents[38]], status: 'pending', dueDate: inNMinutes(64), walkingOrderIndex: 26 }, // Newt
      { id: 'chk27', residents: [mockResidents[33]], status: 'pending', dueDate: inNMinutes(66), walkingOrderIndex: 27 }, // Jeff Siemens
      { id: 'chk28', residents: [mockResidents[32]], status: 'pending', dueDate: inNMinutes(68), walkingOrderIndex: 28 }, // Jimmy Tang
      { id: 'chk29', residents: [mockResidents[35]], status: 'pending', dueDate: inNMinutes(70), walkingOrderIndex: 29 }, // Ash
      { id: 'chk30', residents: [mockResidents[34]], status: 'pending', dueDate: inNMinutes(72), walkingOrderIndex: 30 }, // David 8
      
      // == Completed Checks (For History) ==
      { id: 'chk31', residents: [mockResidents[39]], status: 'complete', dueDate: inNMinutes(-60), walkingOrderIndex: 31, lastChecked: inNMinutes(-62), completionStatus: 'Assessing threats', notes: 'Pencil located.' }, // John Wick
      { id: 'chk32', residents: [mockResidents[40]], status: 'complete', dueDate: inNMinutes(-120), walkingOrderIndex: 32, lastChecked: inNMinutes(-121), completionStatus: 'Sleeping', notes: 'The spice must flow.' }, // Leto Atreides
    ];
})();

// This is the "source of truth" atom for the raw check data.
// It is made writable to allow the reducer-style appDataAtom to update it.
const baseChecksAtom = atom(initialChecks, (_get, set, update: SafetyCheck[]) => {
    set(baseChecksAtom, update);
});


// =================================================================
//                Core Application Data & Reducer
// =================================================================

interface AppData {
  checks: SafetyCheck[];
}

type CheckCompletePayload = {
  checkId: string;
  notes: string;
  statuses: Record<string, string>; 
  completionTime: string;
};

type SupplementalCheckPayload = {
  roomId: string;
  notes: string;
  statuses: Record<string, string>;
};

export type AppAction =
  | { type: 'CHECK_SET_COMPLETING'; payload: { checkId: string } }
  | { type: 'CHECK_COMPLETE'; payload: CheckCompletePayload }
  | { type: 'CHECK_SUPPLEMENTAL_ADD'; payload: SupplementalCheckPayload };

// This atom provides a reducer-like interface for mutating the app's core data.
const appDataAtom = atom<AppData, [AppAction], void>(
  (get) => ({ checks: get(baseChecksAtom) }),
  (get, set, action) => {
    const currentChecks = get(baseChecksAtom);
    const nextState = produce({ checks: currentChecks }, (draft: Draft<AppData>) => {
      switch (action.type) {
        case 'CHECK_SET_COMPLETING': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'completing';
          }
          break;
        }
        case 'CHECK_COMPLETE': {
          const check = draft.checks.find(c => c.id === action.payload.checkId);
          if (check) {
            check.status = 'complete';
            check.lastChecked = action.payload.completionTime;
            check.completionStatus = Object.values(action.payload.statuses)[0] || 'Complete';
            check.notes = action.payload.notes;
          }
          break;
        }
        case 'CHECK_SUPPLEMENTAL_ADD': {
          const { roomId, notes, statuses } = action.payload;
          const roomLocation = mockResidents.find(r => r.id === roomId)?.location;
          const residentsInRoom = mockResidents.filter(r => r.location === roomLocation);

          if (residentsInRoom.length > 0) {
            const newCheck: SafetyCheck = {
              id: `sup_${nanoid()}`,
              residents: residentsInRoom,
              status: 'supplemental',
              dueDate: new Date().toISOString(),
              walkingOrderIndex: 999,
              lastChecked: new Date().toISOString(),
              notes,
              completionStatus: Object.values(statuses)[0] || 'Complete',
            };
            draft.checks.push(newCheck);
          }
          break;
        }
      }
    });
    set(baseChecksAtom, nextState.checks);
  }
);

// This is the public-facing atom used by components to dispatch actions.
export const dispatchActionAtom = atom(null, (_get, set, action: AppAction) => {
    set(appDataAtom, action);
});


// =================================================================
//                Derived, Read-Only Atoms for UI
// =================================================================

// This derived atom calculates the real-time status of each check.
export const safetyChecksAtom = atom<SafetyCheck[]>((get) => {
  const { checks } = get(appDataAtom);
  const timeNow = get(currentTimeAtom).getTime();
  const threeMinutesFromNow = timeNow + 3 * 60 * 1000;
  const completing = get(completingChecksAtom);

  return checks
    .filter(check => !completing.has(check.id))
    .map(check => {
      // CRITICAL FIX: Do not change the status of an item that is in the 'completing' state.
      // Let it remain 'completing' until the final data update.
      if (check.status === 'complete' || check.status === 'supplemental' || check.status === 'completing') {
        return check;
      }
      const dueTime = new Date(check.dueDate).getTime();

      let newStatus: SafetyCheckStatus = 'pending';
      if (dueTime < timeNow) {
        newStatus = 'late';
      } else if (dueTime < threeMinutesFromNow) {
        newStatus = 'due-soon';
      } else {
        newStatus = 'pending';
      }

      if (check.status === newStatus) {
        return check;
      }

      return { ...check, status: newStatus };
    });
});

const statusOrder: Record<SafetyCheckStatus, number> = {
  late: 0,
  'due-soon': 1,
  pending: 2,
  // CRITICAL FIX: A 'completing' item is sorted as if it were still 'pending'.
  // This keeps it in its original position in the list during the animation.
  completing: 2, 
  missed: 3,
  complete: 4,
  supplemental: 5,
};

// This derived atom sorts checks for the "Time View".
export const timeSortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const sorted = [...checks];
  sorted.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  return sorted;
});

// This derived atom sorts checks for the "Route View".
export const routeSortedChecksAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  // CRITICAL FIX: Treat 'completing' items as actionable to keep them in the top group.
  const actionable = checks.filter(c => c.status !== 'complete' && c.status !== 'supplemental');
  const nonActionable = checks.filter(c => c.status === 'complete' || c.status === 'supplemental');

  actionable.sort((a, b) => a.walkingOrderIndex - b.walkingOrderIndex);
  nonActionable.sort((a, b) => {
    const timeB = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
    const timeA = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
    return timeB - timeA;
  });

  return [...actionable, ...nonActionable];
});

// This derived atom provides summary counts for the Status Overview bar.
export const statusCountsAtom = atom((get) => {
  const checks = get(safetyChecksAtom);
  const counts = {
    late: 0,
    dueSoon: 0,
    due: 0,
    completed: 0,
  };
  for (const check of checks) {
    switch (check.status) {
      case 'late':
        counts.late++;
        break;
      case 'due-soon':
        counts.dueSoon++;
        break;
      case 'pending':
        counts.due++;
        break;
      case 'complete':
        counts.completed++;
        break;
    }
  }
  return counts;
});

// =================================================================
//                Derived Atoms for History View
// =================================================================

const baseHistoricalChecksAtom = atom((get) => {
  const { checks } = get(appDataAtom);
  // Do not show 'completing' items in the history view.
  return checks.filter(c => c.status !== 'pending' && c.status !== 'due-soon' && c.status !== 'completing');
});

// NEW ATOM: Provides counts for the filter badges in the History view.
export const historyCountsAtom = atom((get) => {
  const historicalChecks = get(baseHistoricalChecksAtom);
  return {
    all: historicalChecks.length,
    lateOrMissed: historicalChecks.filter(c => c.status === 'late' || c.status === 'missed').length,
    supplemental: historicalChecks.filter(c => c.status === 'supplemental').length,
  };
});


const formatDateGroup = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
      return 'Today';
  }
  if (targetDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
  }
  return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  });
};

export const groupedHistoryAtom = atom((get) => {
  const historicalChecksBase = get(baseHistoricalChecksAtom);
  const filter = get(historyFilterAtom);

  let filteredChecks = historicalChecksBase;

  if (filter === 'lateOrMissed') {
    filteredChecks = historicalChecksBase.filter(c => c.status === 'late' || c.status === 'missed');
  } else if (filter === 'supplemental') {
    filteredChecks = historicalChecksBase.filter(c => c.status === 'supplemental');
  }

  filteredChecks.sort((a, b) => {
    const dateA = new Date(a.lastChecked || a.dueDate).getTime();
    const dateB = new Date(b.lastChecked || b.dueDate).getTime();
    return dateB - dateA;
  });

  if (filteredChecks.length === 0) {
    return { groupCounts: [], groups: [], flattenedChecks: [] };
  }

  const grouped = filteredChecks.reduce((acc, check) => {
    const checkDate = new Date(check.lastChecked || check.dueDate);
    const groupName = formatDateGroup(checkDate);
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(check);
    return acc;
  }, {} as Record<string, SafetyCheck[]>);

  const groups = Object.keys(grouped);
  const groupCounts = groups.map(groupName => grouped[groupName].length);
  const flattenedChecks = groups.flatMap(groupName => grouped[groupName]);

  return { groupCounts, groups, flattenedChecks };
});