import { generateRandomName } from "./nameGenerator";

export type UserProfile = {
    id: string;
};

const STORAGE_KEY = 'plandle_user_v1';

/**
 * Loads the user profile from localStorage, 
 * or creates a new one with a UUID if it doesn't exist.
 * We no longer store the name in localStorage — the DB is the single source of truth.
 */
export function getOrCreateUserProfile(): UserProfile {
    if (typeof window === 'undefined') return { id: '' };

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed.id) return parsed;
        } catch (e) {
            console.error("Failed to parse user profile", e);
        }
    }

    // Create new profile ID
    const newProfile: UserProfile = {
        id: crypto.randomUUID(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
}
