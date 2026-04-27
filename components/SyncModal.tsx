'use client';

import { useState, useEffect } from 'react';
import { getOrCreateUserProfile } from '@/utils/user';

function safeParse<T>(raw: string | null, fallback: T): T {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export default function SyncModal() {
    const [needsSync, setNeedsSync] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if there is legacy localstorage state that hasn't been synced
        if (typeof window !== 'undefined') {
            const hasLegacyStats = !!localStorage.getItem('plandle_stats_v2');
            const hasLegacyMiles = !!localStorage.getItem('plandle_miles_v1');
            const hasLegacyLog = !!localStorage.getItem('plandle_daily_log');
            
            if (hasLegacyStats || hasLegacyMiles || hasLegacyLog) {
                setNeedsSync(true);
            }
        }
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setError(null);

        try {
            const user = getOrCreateUserProfile();
            const rawMiles = localStorage.getItem('plandle_miles_v1');
            const rawDifficulty = localStorage.getItem('plandle_difficulty');
            const rawStats = localStorage.getItem('plandle_stats_v2');
            const rawDailyLog = localStorage.getItem('plandle_daily_log');

            const parsedMiles = rawMiles ? parseInt(rawMiles, 10) : 0;
            const payload = {
                user,
                miles: isNaN(parsedMiles) ? 0 : parsedMiles,
                difficulty: rawDifficulty || 'Business',
                stats: safeParse<Record<string, unknown>>(rawStats, {}),
                dailyLog: safeParse<Record<string, string>>(rawDailyLog, {}),
            };

            const response = await fetch('/api/user/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Server returned an error');
            }

            const data = await response.json();

            // Verification check
            if (data.success && data.verifiedUser) {
                const verifiedMiles = data.verifiedUser.miles;
                if (verifiedMiles === payload.miles) {
                    // Success! Clean up localStorage except user id (plandle_user_v1 remains for now)
                    localStorage.removeItem('plandle_miles_v1');
                    localStorage.removeItem('plandle_difficulty');
                    localStorage.removeItem('plandle_stats_v2');
                    localStorage.removeItem('plandle_daily_log');
                    
                    setNeedsSync(false);
                } else {
                    throw new Error('Data integrity check failed');
                }
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: unknown) {
            console.error('Migration failed:', err);
            const message = err instanceof Error ? err.message : 'Unknown error occurred. Please try again.';
            setError(message);
        } finally {
            setSyncing(false);
        }
    };

    if (!needsSync) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-bg-main p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-brand-base/20">
                <div className="text-5xl mb-4">☁️</div>
                <h2 className="text-2xl font-black text-text-main mb-2">Cloud Upgrade</h2>
                <p className="text-text-secondary mb-6 text-sm">
                    Plandle is moving to the cloud! We need to sync your offline flight records to securely store them and enable new features.
                </p>
                
                {error && (
                    <div className="text-sm text-error-base mb-4 bg-error-base/10 py-2 px-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="w-full py-4 bg-brand-base hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(var(--brand-base-rgb),0.3)] transition-all active:scale-95"
                >
                    {syncing ? 'Syncing to Cloud...' : 'Sync My Data Now'}
                </button>
                <p className="text-xs text-text-muted mt-4">
                    Please do not close the window while syncing.
                </p>
            </div>
        </div>
    );
}
