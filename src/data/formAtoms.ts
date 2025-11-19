// src/data/formAtoms.ts
import { atom } from 'jotai';

/**
 * Structure for cached form data.
 * This allows a user to navigate away from a check (e.g. hit 'Back' by mistake)
 * and return to find their entered data preserved.
 */
export interface CheckFormDraft {
  statuses: Record<string, string>;
  notes: Record<string, string>;
  checkType?: string;
  isAttested?: boolean;
  timestamp: number;
}

// A dictionary mapping checkId -> DraftData
export const draftFormsAtom = atom<Record<string, CheckFormDraft>>({});

// Action: Save a draft
export const saveDraftAtom = atom(
  null,
  (get, set, { checkId, draft }: { checkId: string; draft: Omit<CheckFormDraft, 'timestamp'> }) => {
    const currentDrafts = get(draftFormsAtom);
    set(draftFormsAtom, {
      ...currentDrafts,
      [checkId]: {
        ...draft,
        timestamp: Date.now(),
      },
    });
  }
);

// Action: Clear a draft (used upon successful submission)
export const clearDraftAtom = atom(
  null,
  (get, set, checkId: string) => {
    const currentDrafts = get(draftFormsAtom);
    // Create a shallow copy to mutate safely without triggering linter unused var errors
    const nextDrafts = { ...currentDrafts };
    delete nextDrafts[checkId];
    set(draftFormsAtom, nextDrafts);
  }
);