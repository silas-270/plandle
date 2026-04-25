import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

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

function generateRandomName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj} ${noun}`;
}

async function main() {
    console.log('🚀 Starting to seed 30 pilots...');

    const dummyPilots = [];
    
    for (let i = 0; i < 30; i++) {
        // Distribute miles: some high, most middle/low
        // Range: 500 to 45,000 (keeping the "top" spot open for you)
        const miles = Math.floor(Math.random() * 15000) + (Math.random() > 0.8 ? 30000 : 2000);

        dummyPilots.push({
            id: randomUUID(),
            name: generateRandomName(),
            miles: miles
        });
    }

    try {
        const result = await prisma.user.createMany({
            data: dummyPilots,
            skipDuplicates: true,
        });
        console.log(`✅ Successfully added ${result.count} dummy pilots to the leaderboard!`);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
