'use client';

import { useEffect, useState } from 'react';
import { getOrCreateUserProfile } from '@/utils/user';
import LeaderboardList from './LeaderboardList';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function LeaderboardModal({ isOpen, onClose }: Props) {
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState<{ topPlayers: any[], ownRank: any } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setAnimate(false);
            const t = setTimeout(() => setAnimate(true), 30);
            
            // Get user info and fetch leaderboard
            const profile = getOrCreateUserProfile();
            setUserId(profile.id);
            fetchLeaderboard(profile.id);
            
            return () => clearTimeout(t);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    const fetchLeaderboard = async (uid: string) => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/leaderboard?limit=5&userId=${uid}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 ring-inset"
            style={{ backgroundColor: 'var(--overlay-bg)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                className="relative w-full max-w-sm md:max-w-2xl bg-bg-main rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(20px)',
                    transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Header */}
                <div className="pt-8 pb-4 px-7 flex items-center justify-center relative flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-base">Global Leaderboard</span>
                        <h2 className="text-3xl font-black text-text-main tracking-tight">Top Altitude</h2>
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-grow">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-brand-muted border-t-brand-base rounded-full animate-spin" />
                            <p className="text-text-dim font-bold uppercase tracking-widest text-xs">Scanning Airspace...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                            <div className="text-4xl">📡</div>
                            <p className="text-text-secondary font-medium italic">Lost contact with ATC</p>
                            <button 
                                onClick={() => userId && fetchLeaderboard(userId)}
                                className="px-6 py-2 bg-bg-subtle border border-border-muted rounded-full text-sm font-bold text-text-main hover:bg-border-muted transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : data ? (
                        <LeaderboardList 
                            topPlayers={data.topPlayers}
                            ownRank={data.ownRank}
                            currentUserId={userId}
                        />
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-6 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl font-bold text-lg tracking-wide bg-bg-inverse hover:opacity-90 text-white active:scale-95 transition-all shadow-lg"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
