import aircraftData from './aircraft_database.json';
import { SeededRandom } from './seededRandom';

export type aircraft = {
    manufacturer: string;
    type: string;
    airline: string;
};

type AircraftDB = {
    manufacturer: string;
    type: string;
    airlines: string[];
}[];

// Returns an array of all unique manufacturers, sorted alphabetically
export const getManufacturers = (): string[] => {
    return Array.from(new Set(AIRCRAFT_DATABASE.map(plane => plane.manufacturer))).sort();
};

// Returns an array of all types for a specific manufacturer, sorted alphabetically
export const getTypes = (manufacturer: string): string[] => {
    return AIRCRAFT_DATABASE
        .filter(plane => plane.manufacturer === manufacturer)
        .map(plane => plane.type)
        .sort();
};

// Returns an array of all unique airlines across the database, sorted alphabetically
export const getAirlines = (): string[] => {
    return Array.from(new Set(AIRCRAFT_DATABASE.flatMap(plane => plane.airlines))).sort();
};

export const getRandomPlane = (): aircraft => {
    const randomAirplaneIndex = Math.floor(Math.random() * AIRCRAFT_DATABASE.length);
    const airplane = AIRCRAFT_DATABASE[randomAirplaneIndex];
    const randomAirlineIndex = Math.floor(Math.random() * airplane.airlines.length);

    return {
        manufacturer: airplane.manufacturer,
        type: airplane.type,
        airline: airplane.airlines[randomAirlineIndex],
    };
};

export const getPlaneBySeed = (seed: string): { airplane: aircraft; imageIndex: number } => {
    const rng = new SeededRandom(seed);
    const airplaneIndex = rng.nextInt(AIRCRAFT_DATABASE.length);
    const airplane = AIRCRAFT_DATABASE[airplaneIndex];
    const airlineIndex = rng.nextInt(airplane.airlines.length);
    // Consistent image choice for Daily: 0-5
    const imageIndex = rng.nextInt(6);

    return {
        airplane: {
            manufacturer: airplane.manufacturer,
            type: airplane.type,
            airline: airplane.airlines[airlineIndex],
        },
        imageIndex
    };
};

// Returns the aircraft and airline for given explicit indices
export const getPlaneByIndices = (aircraftIndex: number, airlineIndex: number): aircraft | null => {
    const airplane = AIRCRAFT_DATABASE[aircraftIndex];
    if (!airplane) return null;
    const airline = airplane.airlines[airlineIndex];
    if (!airline) return null;
    return {
        manufacturer: airplane.manufacturer,
        type: airplane.type,
        airline,
    };
};

// Returns database indices for a given aircraft + airline combo
export const getPlaneIndices = (manufacturer: string, type: string, airline: string): { aircraftIndex: number; airlineIndex: number } | null => {
    const aircraftIndex = AIRCRAFT_DATABASE.findIndex(a => a.manufacturer === manufacturer && a.type === type);
    if (aircraftIndex === -1) return null;
    const airlineIndex = AIRCRAFT_DATABASE[aircraftIndex].airlines.indexOf(airline);
    if (airlineIndex === -1) return null;
    return { aircraftIndex, airlineIndex };
};

// Encode: aircraftIndex.airlineIndex.imageIndex -> base64 string
export const encodeChallenge = (aircraftIndex: number, airlineIndex: number, imageIndex: number): string => {
    const raw = `${aircraftIndex}.${airlineIndex}.${imageIndex}`;
    return btoa(raw);
};

// Decode: base64 string -> { aircraftIndex, airlineIndex, imageIndex } or null if invalid
export const decodeChallenge = (encoded: string): { aircraftIndex: number; airlineIndex: number; imageIndex: number } | null => {
    try {
        const raw = atob(encoded);
        const parts = raw.split('.');
        if (parts.length !== 3) return null;
        const [ai, li, ii] = parts.map(Number);
        if (isNaN(ai) || isNaN(li) || isNaN(ii)) return null;
        return { aircraftIndex: ai, airlineIndex: li, imageIndex: ii };
    } catch {
        return null;
    }
};

export const AIRCRAFT_DATABASE: AircraftDB = aircraftData;