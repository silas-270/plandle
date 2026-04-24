'use client';

import { useState, useEffect } from 'react';

export type ModeStats = {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    recentResults?: boolean[];
};

export type GameStats = Record<string, ModeStats>;

const STORAGE_KEY = 'plandle_stats_v2'; // Versioning storage

const DEFAULT_MODE_STATS: ModeStats = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    recentResults: [],
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
        let needsSave = false;

        // Migration: If we have history but no recentResults array, 
        // generate a baseline array using the existing win rate.
        Object.keys(loaded).forEach(mode => {
            const mStats = loaded[mode];
            if (mStats.played > 0 && (!mStats.recentResults || mStats.recentResults.length === 0)) {
                const sampleSize = Math.min(mStats.played, 100);
                const winRate = mStats.wins / mStats.played;
                const winsCount = Math.round(sampleSize * winRate);
                
                const migratedResults = new Array(sampleSize).fill(false);
                for (let i = 0; i < winsCount; i++) {
                    migratedResults[i] = true;
                }
                // Randomize order purely for a better initial "sliding" feel
                migratedResults.sort(() => Math.random() - 0.5);
                
                mStats.recentResults = migratedResults;
                needsSave = true;
            }
        });

        if (needsSave) {
            saveStats(loaded);
        }

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
                recentResults: [hasWon, ...(currentModeStats.recentResults || [])].slice(0, 100),
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
        const results = mStats.recentResults || [];
        
        if (results.length > 0) {
            const recentWins = results.filter(r => r).length;
            return Math.round((recentWins / results.length) * 100);
        }
        
        // Fallback for players before the update (all-time win rate)
        return mStats.played > 0
            ? Math.round((mStats.wins / mStats.played) * 100)
            : 0;
    };

    return { stats, getWinRate, updateStats, isHydrated };
}
