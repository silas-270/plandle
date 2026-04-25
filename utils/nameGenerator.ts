const ADJECTIVES = [
    "Swift", "Brave", "Silver", "Golden", "Metallic", "Stealthy", "Rapid", "High", 
    "Infinite", "Solar", "Midnight", "Oceanic", "Alpine", "Crimson", "Radiant", 
    "Nimbus", "Stratos", "Aero", "Mach", "Sonic", "Global", "Arctic", "Blue"
];

const NOUNS = [
    "Pilot", "Aviator", "Captain", "Navigator", "Eagle", "Falcon", "Hawk", 
    "Albatross", "Airbus", "Boeing", "Propeller", "Wing", "Turbine", "Jet", 
    "Flare", "Skyward", "Horizon", "Runway", "Altitude", "Vector", "Cessna", 
    "Piper", "Concorde"
];

/**
 * Generates a random aviation-themed name.
 * Example: "Solar Falcon", "Swift Navigator"
 */
export function generateRandomName(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
}
