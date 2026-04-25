import { generateRandomName } from "./nameGenerator";

export type UserProfile = {
    id: string;
    name: string;
};

const STORAGE_KEY = 'plandle_user_v1';

/**
 * Loads the user profile from localStorage, 
 * or creates a new one with a UUID and random name if it doesn't exist.
 */
export function getOrCreateUserProfile(): UserProfile {
    if (typeof window === 'undefined') return { id: '', name: 'Passenger' };

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse user profile", e);
        }
    }

    // Create new profile
    const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        name: generateRandomName()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
}

/**
 * Updates the username in the stored profile.
 */
export function updateUsername(newName: string): void {
    if (typeof window === 'undefined') return;
    
    const profile = getOrCreateUserProfile();
    profile.name = newName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
