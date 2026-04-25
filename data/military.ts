import militaryData from './military_database.json';

export type MilitaryAircraft = {
    manufacturer: string;
    type: string;
};

type MilitaryAircraftDB = MilitaryAircraft[];

export const MILITARY_DATABASE: MilitaryAircraftDB = militaryData as MilitaryAircraftDB;

export const getMilitaryManufacturers = (): string[] => {
    return Array.from(new Set(MILITARY_DATABASE.map(plane => plane.manufacturer))).sort();
};

export const getMilitaryTypes = (manufacturer: string): string[] => {
    return MILITARY_DATABASE
        .filter(plane => plane.manufacturer === manufacturer)
        .map(plane => plane.type)
        .sort();
};

export const getRandomMilitaryPlane = (): MilitaryAircraft => {
    const randomIndex = Math.floor(Math.random() * MILITARY_DATABASE.length);
    return MILITARY_DATABASE[randomIndex];
};

/** Returns the aircraft at a specific DB index, or null if out of bounds */
export const getMilitaryByIndex = (aircraftIndex: number): MilitaryAircraft | null => {
    return MILITARY_DATABASE[aircraftIndex] ?? null;
};

/** Returns the DB index for a given manufacturer + type combo, or -1 if not found */
export const getMilitaryIndex = (manufacturer: string, type: string): number => {
    return MILITARY_DATABASE.findIndex(p => p.manufacturer === manufacturer && p.type === type);
};

/** Encode: aircraftIndex.imageIndex -> base64 string, prefixed with 'm.' to avoid collisions */
export const encodeMilitaryChallenge = (aircraftIndex: number, imageIndex: number): string => {
    return btoa(`m.${aircraftIndex}.${imageIndex}`);
};

/** Decode: base64 string -> { aircraftIndex, imageIndex } or null if invalid */
export const decodeMilitaryChallenge = (encoded: string): { aircraftIndex: number; imageIndex: number } | null => {
    try {
        const raw = atob(encoded);
        if (!raw.startsWith('m.')) return null;
        const parts = raw.split('.');
        if (parts.length !== 3) return null;
        const ai = Number(parts[1]);
        const ii = Number(parts[2]);
        if (isNaN(ai) || isNaN(ii)) return null;
        return { aircraftIndex: ai, imageIndex: ii };
    } catch {
        return null;
    }
};
