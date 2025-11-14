// src/data/mock/facilityData.ts

export interface FacilityUnit {
  id: string;
  name: string;
}

export interface FacilityGroup {
  id: string;
  name: string;
  units: FacilityUnit[];
}

export const facilityData: FacilityGroup[] = [
  {
    id: 'jdc',
    name: 'Juvenile Detention Center',
    units: [
      { id: 'a-wing', name: 'A-Wing' },
      { id: 'b-wing', name: 'B-Wing' },
      { id: 'c-wing', name: 'C-Wing' },
    ],
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi Detention Center',
    units: [
      { id: 'star-wars', name: 'Star Wars Pod' },
      { id: 'harry-potter', name: 'Harry Potter Pod' },
      { id: 'terminator', name: 'Terminator Pod' },
      { id: 'alien', name: 'Alien Pod' },
      { id: 'expanse', name: 'The Expanse Pod' },
    ],
  },
];