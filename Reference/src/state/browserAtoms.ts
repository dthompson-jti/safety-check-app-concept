import { atom } from 'jotai';

export const searchQueryAtom = atom('');
export const filteredComponentsAtom = atom((get) => {
  const q = get(searchQueryAtom).toLowerCase();
  const all = ['Text', 'Number', 'Date', 'Select', 'Container'];
  return q ? all.filter((n) => n.toLowerCase().includes(q)) : all;
});
