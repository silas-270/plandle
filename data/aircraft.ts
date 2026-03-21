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

export const AIRCRAFT_DATABASE: AircraftDB = [
    {
        "manufacturer": "Airbus",
        "type": "A220",
        "airlines": ["Delta Air Lines", "Air France", "Swiss", "JetBlue Airways", "Air Canada", "Korean Air"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A319",
        "airlines": ["American Airlines", "Delta Air Lines", "United Airlines", "EasyJet", "Lufthansa", "British Airways"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A320",
        "airlines": ["American Airlines", "EasyJet", "Lufthansa", "China Eastern Airlines", "IndiGo", "All Nippon Airways"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A321",
        "airlines": ["American Airlines", "Delta Air Lines", "Lufthansa", "British Airways", "Turkish Airlines", "JetBlue Airways"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A330",
        "airlines": ["Turkish Airlines", "Delta Air Lines", "Cathay Pacific", "Qantas Airways", "China Eastern Airlines", "Lufthansa"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A350",
        "airlines": ["Singapore Airlines", "Qatar Airways", "Delta Air Lines", "Lufthansa", "Cathay Pacific", "Air France"]
    },
    {
        "manufacturer": "Airbus",
        "type": "A380",
        "airlines": ["Emirates", "Singapore Airlines", "British Airways", "Qantas Airways", "Lufthansa", "Qatar Airways"]
    },
    {
        "manufacturer": "Boeing",
        "type": "737",
        "airlines": ["Southwest Airlines", "Ryanair", "American Airlines", "United Airlines", "Delta Air Lines", "Qantas Airways"]
    },
    {
        "manufacturer": "Boeing",
        "type": "747",
        "airlines": ["Lufthansa", "Korean Air", "Air China", "Asiana Airlines", "Saudia"]
    },
    {
        "manufacturer": "Boeing",
        "type": "767",
        "airlines": ["Delta Air Lines", "United Airlines", "Japan Airlines", "All Nippon Airways", "LATAM Airlines", "Condor"]
    },
    {
        "manufacturer": "Boeing",
        "type": "777",
        "airlines": ["Emirates", "Qatar Airways", "Air France", "Cathay Pacific", "United Airlines", "British Airways"]
    },
    {
        "manufacturer": "Boeing",
        "type": "787",
        "airlines": ["All Nippon Airways", "Japan Airlines", "Qatar Airways", "United Airlines", "British Airways", "Qantas Airways"]
    },
    {
        "manufacturer": "Embraer",
        "type": "E175",
        "airlines": ["American Airlines", "United Airlines", "Delta Air Lines", "Alaska Airlines", "Air Canada", "LOT Polish Airlines"]
    },
    {
        "manufacturer": "Embraer",
        "type": "E190",
        "airlines": ["JetBlue Airways", "KLM", "British Airways", "Qantas Airways", "Aeromexico", "Finnair"]
    },
    {
        "manufacturer": "Embraer",
        "type": "E195",
        "airlines": ["Azul Brazilian Airlines", "KLM", "LOT Polish Airlines", "Porter Airlines", "Lufthansa"]
    },
    {
        "manufacturer": "Bombardier",
        "type": "CRJ-900",
        "airlines": ["American Airlines", "Delta Air Lines", "Lufthansa", "Scandinavian Airlines", "Air Canada", "Iberia"]
    }
];