'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { getOrCreateUserProfile } from '@/utils/user';
import { generateRandomName } from '@/utils/nameGenerator';

// ── Types ──────────────────────────────────────────────────

export type ModeStats = {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    recentResults?: boolean[];
};

export type GameStats = Record<string, ModeStats>;

export type UserData = {
    id: string;
    name: string;
    miles: number;
    difficulty: string;
    stats: GameStats;
    dailyLog: Record<string, string>;
};

type UserContextType = {
    /** Full user data — null while loading */
    data: UserData | null;
    isLoading: boolean;

    // ── Miles ──
    miles: number;
    addMiles: (amount: number) => void;
    spendMiles: (amount: number) => boolean;
    canAfford: (amount: number) => boolean;

    // ── Stats ──
    stats: GameStats;
    getWinRate: (mode: string) => number;
    updateStats: (hasWon: boolean, mode: string) => void;

    // ── Difficulty ──
    difficulty: string;
    setDifficulty: (level: string) => void;

    // ── Daily Log ──
    dailyLog: Record<string, string>;
    recordDaily: (date: string, status: string) => void;

    // ── Name ──
    updateName: (name: string) => void;
};

const DEFAULT_MODE_STATS: ModeStats = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    recentResults: [],
};

const UserContext = createContext<UserContextType | null>(null);

// ── Fire-and-forget sync helper ────────────────────────────

function syncToServer(payload: Record<string, unknown>) {
    fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).catch(err => console.warn('[Sync] Failed:', err));
}

// ── Provider ───────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate from server on mount
    useEffect(() => {
        const profile = getOrCreateUserProfile();
        if (!profile.id) {
            setIsLoading(false);
            return;
        }

        // Create a fallback name just in case the ID isn't in DB yet so it can init them
        const fallbackName = encodeURIComponent(generateRandomName());
        
        fetch(`/api/user/me?id=${profile.id}&fallbackName=${fallbackName}`)
            .then(r => {
                if (r.status === 404) {
                    // This technically shouldn't happen anymore since the API creates new users, 
                    // but we keep the fallback to prevent crashes if API goes entirely down
                    return {
                        user: { id: profile.id, name: 'Passenger', miles: 0, difficulty: 'Business' },
                        stats: {},
                        dailyLog: {},
                    };
                }
                return r.json();
            })
            .then(result => {
                setData({
                    id: result.user.id,
                    name: result.user.name,
                    miles: result.user.miles,
                    difficulty: result.user.difficulty,
                    stats: result.stats,
                    dailyLog: result.dailyLog,
                });
            })
            .catch(err => {
                console.error('[UserProvider] Failed to load user:', err);
                // Fallback to empty defaults so the app doesn't crash
                setData({
                    id: profile.id,
                    name: 'Passenger',
                    miles: 0,
                    difficulty: 'Business',
                    stats: {},
                    dailyLog: {},
                });
            })
            .finally(() => setIsLoading(false));
    }, []);

    // ── Miles ──

    const miles = data?.miles ?? 0;

    const addMiles = useCallback((amount: number) => {
        setData(prev => {
            if (!prev) return prev;
            const next = { ...prev, miles: prev.miles + amount };
            syncToServer({ id: prev.id, type: 'miles', miles: next.miles });
            return next;
        });
    }, []);

    const spendMiles = useCallback((amount: number): boolean => {
        let success = false;
        setData(prev => {
            if (!prev || prev.miles < amount) return prev;
            success = true;
            const next = { ...prev, miles: prev.miles - amount };
            syncToServer({ id: prev.id, type: 'miles', miles: next.miles });
            return next;
        });
        return success;
    }, []);

    const canAfford = useCallback((amount: number) => miles >= amount, [miles]);

    // ── Stats ──

    const stats = useMemo(() => data?.stats ?? {}, [data?.stats]);

    const getWinRate = useCallback((mode: string) => {
        const mStats = stats[mode] || { ...DEFAULT_MODE_STATS };
        const results = mStats.recentResults || [];

        if (results.length > 0) {
            const recentWins = results.filter(r => r).length;
            return Math.round((recentWins / results.length) * 100);
        }

        return mStats.played > 0
            ? Math.round((mStats.wins / mStats.played) * 100)
            : 0;
    }, [stats]);

    const updateStats = useCallback((hasWon: boolean, mode: string) => {
        setData(prev => {
            if (!prev) return prev;
            const currentModeStats = prev.stats[mode] || { ...DEFAULT_MODE_STATS };
            const newStreak = hasWon ? currentModeStats.currentStreak + 1 : 0;

            const nextModeStats: ModeStats = {
                played: currentModeStats.played + 1,
                wins: hasWon ? currentModeStats.wins + 1 : currentModeStats.wins,
                currentStreak: newStreak,
                maxStreak: Math.max(currentModeStats.maxStreak, newStreak),
                recentResults: [hasWon, ...(currentModeStats.recentResults || [])].slice(0, 100),
            };

            syncToServer({
                id: prev.id,
                type: 'stats',
                mode,
                ...nextModeStats,
            });

            return {
                ...prev,
                stats: { ...prev.stats, [mode]: nextModeStats },
            };
        });
    }, []);

    // ── Difficulty ──

    const difficulty = data?.difficulty ?? 'Business';

    const setDifficultyFn = useCallback((level: string) => {
        setData(prev => {
            if (!prev) return prev;
            syncToServer({ id: prev.id, type: 'difficulty', difficulty: level });
            return { ...prev, difficulty: level };
        });
    }, []);

    // ── Daily Log ──

    const dailyLog = data?.dailyLog ?? {};

    const recordDaily = useCallback((date: string, status: string) => {
        setData(prev => {
            if (!prev) return prev;
            syncToServer({ id: prev.id, type: 'daily', date, status });
            return { ...prev, dailyLog: { ...prev.dailyLog, [date]: status } };
        });
    }, []);

    // ── Name ──

    const updateName = useCallback((name: string) => {
        setData(prev => {
            if (!prev) return prev;
            syncToServer({ id: prev.id, type: 'name', name });
            return { ...prev, name };
        });
    }, []);

    return (
        <UserContext.Provider value={{
            data,
            isLoading,
            miles,
            addMiles,
            spendMiles,
            canAfford,
            stats,
            getWinRate,
            updateStats,
            difficulty,
            setDifficulty: setDifficultyFn,
            dailyLog,
            recordDaily,
            updateName,
        }}>
            {children}
        </UserContext.Provider>
    );
}

// ── Consumer hook ──────────────────────────────────────────

export function useUser(): UserContextType {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within a UserProvider');
    return ctx;
}
