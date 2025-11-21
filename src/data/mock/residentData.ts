// src/data/mock/residentData.ts
import { Resident } from '../../types';

export const mockResidents: Resident[] = [
  // =================================================================
  //           Facility Group: Juvenile Detention Center
  // =================================================================
  
  // --- Unit: A-Wing ---
  { id: 'jdc_a1_1', name: 'Marcus Holloway', location: 'A1-101' },
  { id: 'jdc_a1_2', name: 'Kayla Rodriguez', location: 'A1-102' },
  { id: 'jdc_a1_3', name: 'David Chen', location: 'A1-102' },
  { id: 'jdc_a2_1', name: 'Sofia Petrova', location: 'A2-205' },
  { id: 'jdc_a2_2', name: 'Ben Carter', location: 'A2-206' },
  { id: 'jdc_a2_3', name: 'Grace Lee', location: 'A2-206' },
  { id: 'jdc_a3_1', name: 'Liam O\'Connell', location: 'A3-301' },
  { id: 'jdc_a3_2', name: 'Aiden Harris', location: 'A3-302' },
  { id: 'jdc_a4_1', name: 'Jackson Miller', location: 'A4-410' },
  { id: 'jdc_a4_2', name: 'Zoe Thompson', location: 'A4-411' },
  { id: 'jdc_a4_3', name: 'Leo Garcia', location: 'A4-411' },
  { id: 'jdc_a5_1', name: 'Chloe Garcia', location: 'A5-502' },
  { id: 'jdc_a5_2', name: 'Mia Robinson', location: 'A5-503' },
  { id: 'jdc_a6_1', name: 'Ethan Williams', location: 'A6-601' },
  { id: 'jdc_a6_2', name: 'James Peterson', location: 'A6-601' },
  { id: 'jdc_a6_3', name: 'Daniel Kim', location: 'A6-602' },
  { id: 'jdc_a6_4', name: 'Emily White', location: 'A6-604' },
  { id: 'jdc_a6_5', name: 'Ryan Scott', location: 'A6-604' },

  // --- Unit: B-Wing (Standard) ---
  { id: 'jdc_b1_1', name: 'Olivia Jones', location: 'B1-101' },
  { id: 'jdc_b1_2', name: 'Noah Brown', location: 'B1-102' },
  { id: 'jdc_b2_1', name: 'Ava Johnson', location: 'B2-201' },

  // --- Unit: B-Wing (Stress Test Subjects) ---
  // These 12 residents enable the "Toast Hurricane" and "Scroll Performance" stress tests.
  { id: 'res_stress_b_0', name: 'Subject 01', location: 'B1-Stress-01' },
  { id: 'res_stress_b_1', name: 'Subject 02', location: 'B1-Stress-02' },
  { id: 'res_stress_b_2', name: 'Subject 03', location: 'B1-Stress-03' },
  { id: 'res_stress_b_3', name: 'Subject 04', location: 'B1-Stress-04' },
  { id: 'res_stress_b_4', name: 'Subject 05', location: 'B1-Stress-05' },
  { id: 'res_stress_b_5', name: 'Subject 06', location: 'B1-Stress-06' },
  { id: 'res_stress_b_6', name: 'Subject 07', location: 'B1-Stress-07' },
  { id: 'res_stress_b_7', name: 'Subject 08', location: 'B1-Stress-08' },
  { id: 'res_stress_b_8', name: 'Subject 09', location: 'B1-Stress-09' },
  { id: 'res_stress_b_9', name: 'Subject 10', location: 'B1-Stress-10' },
  { id: 'res_stress_b_10', name: 'Subject 11', location: 'B1-Stress-11' },
  { id: 'res_stress_b_11', name: 'Subject 12', location: 'B1-Stress-12' },
  
  // --- Unit: C-Wing ---
  { id: 'jdc_c1_1', name: 'Mason Davis', location: 'C1-101' },
  { id: 'jdc_c1_2', name: 'Isabella Wilson', location: 'C1-102' },

  // =================================================================
  //               Facility Group: Sci-Fi Detention Center
  // =================================================================

  // --- Pod: Star Wars ---
  { id: 'sw_leia', name: 'Princess Leia Organa', location: 'Death Star Detention Block' },
  { id: 'sw_palp', name: 'Emperor Palpatine', location: 'Emperor\'s Throne Room' },
  { id: 'sw_vader', name: 'Darth Vader', location: 'Emperor\'s Throne Room' },
  { id: 'sw_han', name: 'Han Solo', location: 'Millennium Falcon' },
  { id: 'sw_chewie', name: 'Chewbacca', location: 'Millennium Falcon' },
  { id: 'sw_staff_gc', name: 'Garrett Chan', location: 'Mos Eisley Cantina' },
  { id: 'sw_staff_bc', name: 'Brett Corbin', location: 'Mos Eisley Cantina' },
  { id: 'sw_luke', name: 'Luke Skywalker', location: 'Tatooine Homestead' },
  { id: 'sw_obiwan', name: 'Obi-Wan Kenobi', location: 'Tatooine Homestead' },
  { id: 'sw_yoda', name: 'Yoda', location: 'Dagobah' },
  { id: 'sw_lando', name: 'Lando Calrissian', location: 'Bespin' },
  { id: 'sw_jabba', name: 'Jabba the Hutt', location: 'Jabba\'s Palace' },
  { id: 'sw_boba', name: 'Boba Fett', location: 'Jabba\'s Palace' },

  // --- Pod: Harry Potter ---
  { id: 'hp_harry', name: 'Harry Potter', location: 'Gryffindor Tower' },
  { id: 'hp_hermione', name: 'Hermione Granger', location: 'Gryffindor Tower' },
  { id: 'hp_ron', name: 'Ron Weasley', location: 'Gryffindor Tower' },
  { id: 'hp_staff_jm2', name: 'Jalpa Mazmudar', location: 'Gryffindor Tower' },
  { id: 'hp_dumbledore', name: 'Albus Dumbledore', location: 'Headmaster\'s Office' },
  { id: 'hp_staff_jm', name: 'John Maier', location: 'Hufflepuff Common Room' },
  { id: 'hp_snape', name: 'Severus Snape', location: 'Potions Classroom' },
  { id: 'hp_mcgonagall', name: 'Minerva McGonagall', location: 'The Great Hall' },
  { id: 'hp_neville', name: 'Neville Longbottom', location: 'Room of Requirement' },
  { id: 'hp_draco', name: 'Draco Malfoy', location: 'Slytherin Dungeon' },
  { id: 'hp_umbridge', name: 'Dolores Umbridge', location: 'Ministry of Magic' },

  // --- Pod: Terminator ---
  { id: 't_sarah1', name: 'Sarah Connor', location: 'Cyberdyne Annex' },
  { id: 't_kyle', name: 'Kyle Reese', location: 'Cyberdyne Annex' },
  { id: 't_john', name: 'John Connor', location: 'Future Resistance Bunker' },
  { id: 't_staff_sj', name: 'Sean Jordan', location: 'Future Resistance Bunker' },
  { id: 't_staff_cm', name: 'Christian Morin', location: 'Future Resistance Bunker' },
  { id: 't_t800_m101', name: 'T-800 (Model 101)', location: 'Skynet Command Center' },
  { id: 't_sarah2', name: 'Sarah Connor (T2)', location: 'Pescadero State Hospital' },
  { id: 't_t800_hunter', name: 'The T-800 (Hunter)', location: 'Tech-Noir Nightclub' },
  { id: 't_dyson', name: 'Miles Dyson', location: 'Cyberdyne Systems HQ' },
  
  // --- Pod: Alien ---
  { id: 'al_ripley', name: 'Ellen Ripley', location: 'LV-426 Medlab' },
  { id: 'al_staff_jt', name: 'Jimmy Tang', location: 'Nostromo Galley' },
  { id: 'al_staff_js', name: 'Jeff Siemens', location: 'Nostromo Cockpit' },
  { id: 'al_dallas', name: 'Dallas', location: 'Nostromo Cockpit' },
  { id: 'al_hicks', name: 'Corporal Hicks', location: 'LV-426 Operations Center' },
  { id: 'al_hudson', name: 'Private Hudson', location: 'LV-426 Operations Center' },
  { id: 'al_newt', name: 'Newt', location: 'LV-426 Ventilation Shafts' },
  { id: 'al_ash', name: 'Ash', location: 'Nostromo Hypersleep Chamber' },
  { id: 'al_david8', name: 'David 8', location: 'USCSS Prometheus Bridge' },
  { id: 'al_vickers', name: 'Meredith Vickers', location: 'USCSS Prometheus Bridge' },

  // --- Pod: The Expanse ---
  { id: 'ex_holden', name: 'James Holden', location: 'Rocinante Cockpit' },
  { id: 'ex_alex', name: 'Alex Kamal', location: 'Rocinante Cockpit' },
  { id: 'ex_naomi', name: 'Naomi Nagata', location: 'Rocinante Engineering' },
  { id: 'ex_staff_dt', name: 'Dave Thompson', location: 'Rocinante Engineering' },
  { id: 'ex_amos', name: 'Amos Burton', location: 'Rocinante Galley' },
  { id: 'ex_avasarala', name: 'Chrisjen Avasarala', location: 'UN-One' },
  { id: 'ex_fred', name: 'Fred Johnson', location: 'Tycho Station Command' },
  { id: 'ex_miller', name: 'Joe Miller', location: 'Ceres Station Docks' },
];