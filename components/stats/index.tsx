'use client';

import { useEffect, useState } from 'react';
import { ModeStats, GameStats } from '@/contexts/UserContext';
import { getCurrentTier } from '@/data/ranks';
import { ConfettiPiece } from './StatElements';
import OverviewPanel from './OverviewPanel';
import PostgameSection from './PostgameSection';
import './StatsModal.css';

type Props = {
    stats: ModeStats;
    allStats?: GameStats;
    winRate: number;
    getWinRate?: (mode: string) => number;
    hasWon: boolean;
    isOpen: boolean;
    guessCount: number;
    maxAttempts: number;
    answer?: Record<string, string>;
    gameMode?: string;
    variant?: 'postgame' | 'overview';
    difficulty?: string;
    miles?: number;
    milesEarned?: number;
    onClose: () => void;
    onNext?: () => void;
    onDifficultyChange?: (level: any) => void;
    nextLabel?: string;
    onShareChallenge?: () => void;
};

export default function StatsModal({ stats, allStats, winRate, getWinRate, hasWon, isOpen, guessCount, maxAttempts, answer, gameMode = 'practice', variant = 'postgame', difficulty, miles = 0, milesEarned = 0, onClose, onNext, onDifficultyChange, nextLabel, onShareChallenge }: Props) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [animate, setAnimate] = useState(false);

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
            setShowConfetti(false);
            const t1 = setTimeout(() => setAnimate(true), 30);
            // Only show confetti in postgame win
            const t2 = (hasWon && variant === 'postgame') ? setTimeout(() => setShowConfetti(true), 200) : null;
            return () => {
                clearTimeout(t1);
                if (t2) clearTimeout(t2);
            };
        } else {
            setAnimate(false);
            setShowConfetti(false);
        }
    }, [isOpen, hasWon, variant]);

    if (!isOpen) return null;

    const isOverview = variant === 'overview';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--overlay-bg)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            {/* Confetti layer — postgame wins only */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {Array.from({ length: 28 }, (_, i) => (
                        <ConfettiPiece key={i} index={i} />
                    ))}
                </div>
            )}

            {/* Modal Panel */}
            <div
                className="relative w-full max-w-sm md:max-w-3xl bg-bg-main rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(20px)',
                    transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {isOverview ? (
                    // ─── OVERVIEW VARIANT ───────────────────────────────────────
                    <>
                        <div className="pt-7 pb-4 px-7 flex items-center justify-center relative">
                            <h2 className="text-3xl font-black text-text-main tracking-tight">Statistics</h2>
                            {allStats && getWinRate && (
                                <button
                                    onClick={async () => {
                                        const pStats = allStats['practice'] || { wins: 0, played: 0, currentStreak: 0, maxStreak: 0 };
                                        const wr = getWinRate('practice');
                                        const tier = getCurrentTier(miles || 0);
                                        const text = `✈️ Plandle Career Report ✈️\n━━━━━━━━━━━━━━\n🏆 ${tier.name} Rank\n📍 ${(miles || 0).toLocaleString()} mi flown\n📈 ${wr}% Success\n🔥 ${pStats.maxStreak} Match Max Streak\n━━━━━━━━━━━━━━\nThink you can fly higher?\n👉 plandle.vercel.app`;
                                        try {
                                            if (navigator.share) {
                                                await navigator.share({ title: 'Plandle Stats', text: text });
                                            } else if (navigator.clipboard) {
                                                await navigator.clipboard.writeText(text);
                                                alert("Copied to clipboard!");
                                            } else {
                                                const textArea = document.createElement("textarea");
                                                textArea.value = text;
                                                textArea.style.position = "fixed";
                                                textArea.style.opacity = "0";
                                                document.body.appendChild(textArea);
                                                textArea.focus();
                                                textArea.select();
                                                try {
                                                    document.execCommand('copy');
                                                    alert("Copied to clipboard!");
                                                } catch (err) {
                                                    alert("Could not copy automatically.");
                                                }
                                                document.body.removeChild(textArea);
                                            }
                                        } catch (e: any) {
                                            if (e.name !== "AbortError") console.error("Error sharing", e);
                                        }
                                    }}
                                    className="absolute right-7 text-brand-base hover:text-brand-dark p-2 rounded-full hover:bg-brand-muted/20 transition-all active:scale-95"
                                    title="Share Career Report"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {allStats && getWinRate ? (
                            <OverviewPanel
                                allStats={allStats}
                                getWinRate={getWinRate}
                                difficulty={difficulty}
                                onDifficultyChange={onDifficultyChange}
                                miles={miles}
                            />
                        ) : null}

                        <div className="px-7 pb-7">
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl font-bold text-lg tracking-wide bg-bg-inverse hover:opacity-90 text-white active:scale-95 transition-all shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    // ─── POSTGAME VARIANT ────────────────────────────────────────
                    <PostgameSection
                        hasWon={hasWon}
                        guessCount={guessCount}
                        maxAttempts={maxAttempts}
                        milesEarned={milesEarned}
                        winRate={winRate}
                        miles={miles}
                        stats={stats}
                        answer={answer}
                        gameMode={gameMode}
                        nextLabel={nextLabel}
                        onClose={onClose}
                        onNext={onNext}
                        onShareChallenge={onShareChallenge}
                    />
                )}
            </div>
        </div>
    );
}
