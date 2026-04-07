/**
 * Simple Linear Congruential Generator (LCG) for seeded randomness.
 * We use this to pick the same aircraft based on a date seed.
 */
export class SeededRandom {
    private state: number;

    constructor(seed: string) {
        // Simple hash to convert string to numeric seed
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        this.state = Math.abs(hash);
    }

    // Returns a random float between 0 and 1
    next(): number {
        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        return this.state / 4294967296;
    }

    // Returns an integer between [0, max)
    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }
}
