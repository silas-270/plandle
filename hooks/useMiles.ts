'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'plandle_miles_v1';
export const SKIP_COST = 250;
export const DAILY_MILES = 2000;

function loadMiles(): number {
    try {
        if (typeof window === 'undefined') return 0;
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? parseInt(raw, 10) : 0;
    } catch {
        return 0;
    }
}

function saveMiles(miles: number): void {
    try {
        localStorage.setItem(STORAGE_KEY, String(miles));
    } catch {}
}

export function useMiles() {
    const [miles, setMiles] = useState(0);

    // Hydrate from localStorage
    useEffect(() => {
        setMiles(loadMiles());
    }, []);

    const addMiles = useCallback((amount: number) => {
        setMiles(prev => {
            const next = prev + amount;
            saveMiles(next);
            return next;
        });
    }, []);

    // Returns true if the spend succeeded, false if insufficient miles
    const spendMiles = useCallback((amount: number): boolean => {
        let success = false;
        setMiles(prev => {
            if (prev < amount) return prev; // not enough
            success = true;
            const next = prev - amount;
            saveMiles(next);
            return next;
        });
        // Note: success is set synchronously before setMiles batches
        return success;
    }, []);

    const canAfford = useCallback((amount: number) => miles >= amount, [miles]);

    return { miles, addMiles, spendMiles, canAfford };
}
