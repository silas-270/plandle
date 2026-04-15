export type DifficultyLevel = 'Economy' | 'Business' | 'First Class';

export type DifficultyConfig = {
    maxAttempts: number;
    initialZoom: number;
    zoomStep: number;
    showPartialHints: boolean;
    milesPerWin: number;
};

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
    'Economy': {
        maxAttempts: 6,
        initialZoom: 2.0,
        zoomStep: 0.2,
        showPartialHints: true,
        milesPerWin: 250,
    },
    'Business': {
        maxAttempts: 4,
        initialZoom: 3.5,
        zoomStep: 0.6,
        showPartialHints: true,
        milesPerWin: 500,
    },
    'First Class': {
        maxAttempts: 3,
        initialZoom: 5.0,
        zoomStep: 1.5,
        showPartialHints: false,
        milesPerWin: 800,
    }
};
