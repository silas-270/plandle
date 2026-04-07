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

export const getPlaneBySeed = (seed: string): aircraft => {
    const rng = new SeededRandom(seed);
    const airplaneIndex = rng.nextInt(AIRCRAFT_DATABASE.length);
    const airplane = AIRCRAFT_DATABASE[airplaneIndex];
    const airlineIndex = rng.nextInt(airplane.airlines.length);

    return {
        manufacturer: airplane.manufacturer,
        type: airplane.type,
        airline: airplane.airlines[airlineIndex],
    };
};

export const AIRCRAFT_DATABASE: AircraftDB = aircraftData;