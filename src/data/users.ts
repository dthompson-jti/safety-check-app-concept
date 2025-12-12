// src/data/users.ts

/**
 * User Management
 * 
 * Defines the User type and a hardcoded list of users for prototype authentication.
 * Includes OKLCH color generation algorithm for Smart Avatar feature.
 */

export interface User {
    username: string;
    displayName: string;
    initials: string;
}

export const MOCK_USERS: User[] = [
    { username: 'bcorbin', displayName: 'Brett Corbin', initials: 'BC' },
    { username: 'bcardile', displayName: 'Brian Cardile', initials: 'BC' },
    { username: 'dthompson', displayName: 'Dave Thompson', initials: 'DT' },
    { username: 'jmazmudar', displayName: 'Jalpa Mazmudar', initials: 'JM' },
    { username: 'jsiemens', displayName: 'Jeff Siemens', initials: 'JS' },
];

/**
 * Find a user by username (case-insensitive)
 */
export function findUser(username: string): User | undefined {
    return MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Smart Avatar: OKLCH Color Generation
 * 
 * Generates a deterministic hue value for a user using the Golden Angle.
 * This ensures maximum color separation for similar usernames.
 * 
 * @param username - The username to generate a color for
 * @returns Hue value (0-360)
 */
export function generateAvatarHue(username: string): number {
    const GOLDEN_ANGLE = 137.508; // Golden angle in degrees

    // Sum character codes
    const sum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Multiply by golden angle and wrap to 0-360
    const hue = (sum * GOLDEN_ANGLE) % 360;

    return Math.round(hue);
}

/**
 * Generate OKLCH color string for avatar background
 * 
 * @param hue - Hue value (0-360)
 * @returns CSS oklch() string
 */
export function getAvatarColor(hue: number): string {
    const L = 0.65; // Lightness (constant for good contrast with white text)
    const C = 0.18; // Chroma (constant for vibrant but not neon)

    return `oklch(${L} ${C} ${hue})`;
}
