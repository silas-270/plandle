'use client';

import { useState, useEffect } from 'react';

export type ModeStats = {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
};

export type GameStats = Record<string, ModeStats>;

const STORAGE_KEY = 'plandle_stats_v2'; // Versioning storage

const DEFAULT_MODE_STATS: ModeStats = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
};

const DEFAULT_STATS: GameStats = {
    daily: { ...DEFAULT_MODE_STATS },
    practice: { ...DEFAULT_MODE_STATS },
    trivia: { ...DEFAULT_MODE_STATS },
};

function loadStats(): GameStats {
    try {
        if (typeof window === 'undefined') return DEFAULT_STATS;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STATS;
        const parsed = JSON.parse(raw);
        
        const merged: GameStats = { ...DEFAULT_STATS };
        for (const [key, value] of Object.entries(parsed)) {
            if (value && typeof value === 'object') {
                merged[key] = { ...DEFAULT_MODE_STATS, ...(value as any) };
            }
        }
        return merged;
    } catch {
        return DEFAULT_STATS;
    }
}

function saveStats(stats: GameStats): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
    }
}

export function useStats() {
    const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const loaded = loadStats();
        setStats(loaded);
        setIsHydrated(true);
    }, []);

    const updateStats = (hasWon: boolean, mode: string) => {
        setStats(prev => {
            const currentModeStats = prev[mode] || { ...DEFAULT_MODE_STATS };
            const newStreak = hasWon ? currentModeStats.currentStreak + 1 : 0;
            
            const nextModeStats: ModeStats = {
                played: currentModeStats.played + 1,
                wins: hasWon ? currentModeStats.wins + 1 : currentModeStats.wins,
                currentStreak: newStreak,
                maxStreak: Math.max(currentModeStats.maxStreak, newStreak),
            };

            const next: GameStats = {
                ...prev,
                [mode]: nextModeStats,
            };
            
            saveStats(next);
            return next;
        });
    };

    const getWinRate = (mode: string) => {
        const mStats = stats[mode] || { ...DEFAULT_MODE_STATS };
        return mStats.played > 0
            ? Math.round((mStats.wins / mStats.played) * 100)
            : 0;
    };

    return { stats, getWinRate, updateStats, isHydrated };
}
