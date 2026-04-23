'use client';

import { useEffect, useRef, useState } from 'react';
import { ModeStats, GameStats } from '@/hooks/useStats';
import MilesProgress from './Milesprogress';
import { TIERS } from '@/data/ranks';

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
};

// --- Confetti Particle Component ---
function ConfettiPiece({ index }: { index: number }) {
    const colors = ['var(--brand-light)', 'var(--warning-base)', 'var(--success-stats)', 'var(--error-base)', 'var(--accent-violet)', 'var(--accent-pink)', 'var(--accent-teal)'];
    const color = colors[index % colors.length];
    const left = `${(index * 37 + 11) % 100}%`;
    const delay = `${(index * 0.13) % 1.2}s`;
    const duration = `${1.2 + (index * 0.07) % 0.8}s`;
    const size = 6 + (index % 5);

    return (
        <div
            style={{
                position: 'absolute',
                top: '-20px',
                left,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: index % 3 === 0 ? '50%' : '2px',
                transform: `rotate(${index * 47}deg)`,
                animation: `confetti-fall ${duration} ${delay} ease-in forwards`,
            }}
        />
    );
}

// --- Animated Bar for streaks / win rate ---
function AnimatedBar({ value, max, color = 'var(--brand-light)', delay = '0s' }: {
    value: number;
    max: number;
    color?: string;
    delay?: string;
}) {
    const [width, setWidth] = useState(0);
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;

    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 100);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div className="w-full h-2.5 bg-bg-subtle rounded-full overflow-hidden">
            <div
                style={{
                    width: `${width}%`,
                    backgroundColor: color,
                    height: '100%',
                    borderRadius: '9999px',
                    transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                }}
            />
        </div>
    );
}

// --- Streak display with animated flame ---
function StreakBadge({ value, isMax }: { value: number; isMax?: boolean }) {
    const hot = value >= 3;
    const inferno = value >= 7;

    return (
        <div className={`flex flex-col items-center justify-center px-4 py-4 rounded-2xl ${isMax ? 'bg-bg-subtle' : hot ? 'bg-warning-muted border border-warning-light' : 'bg-bg-subtle'}`}>
            <div className="flex items-center gap-1.5">
                {hot && (
                    <span
                        style={{
                            display: 'inline-block',
                            animation: inferno ? 'flame-inferno 0.5s ease-in-out infinite alternate' : 'flame-wobble 0.8s ease-in-out infinite alternate',
                            fontSize: inferno ? '22px' : '18px',
                        }}
                    >
                        🔥
                    </span>
                )}
                <span className={`text-4xl font-black tabular-nums ${hot ? 'text-warning-base' : 'text-text-main'}`}>
                    {value}
                </span>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest mt-1 text-center ${hot ? 'text-warning-light' : 'text-text-dim'}`}>
                {isMax ? 'Best Streak' : 'Current Streak'}
            </span>
        </div>
    );
}
const MODE_DEFINITIONS: Record<string, { title: string; icon: string }> = {
    daily: { title: "Daily Challenge", icon: "📅" },
    practice: { title: "Endless Mode", icon: "🔄" },
    trivia: { title: "Trivia Mode (Beta)", icon: "🧠" },
};



// --- Overview panel: single page scrolling ---
function OverviewPanel({ allStats, getWinRate, difficulty, onDifficultyChange, miles }: {
    allStats: GameStats;
    getWinRate: (m: string) => number;
    difficulty?: string;
    onDifficultyChange?: (level: any) => void;
    miles: number;
}) {
    // Sort modes using our definitions, pushing unknown modes to the end
    const entries = Object.entries(allStats).filter(([key, stats]) => {
        return Object.keys(MODE_DEFINITIONS).includes(key) || stats.played > 0;
    }).sort((a, b) => {
        const orderA = Object.keys(MODE_DEFINITIONS).indexOf(a[0]);
        const orderB = Object.keys(MODE_DEFINITIONS).indexOf(b[0]);
        return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });

    return (
        <div className="max-h-[70vh] overflow-y-auto pb-4 no-scrollbar">
            {/* Global Currency */}
            <div className="mt-2 mb-10 px-7">
                <MilesProgress miles={miles} tiers={TIERS} />
            </div>

            {/* Mode Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 px-7">
                {entries.map(([key, s]) => {
                    const wr = getWinRate(key);
                    const def = MODE_DEFINITIONS[key] || { title: key, icon: '✈️' };

                    return (
                        <div key={key} className="space-y-4">
                            <h3 className="text-xl font-black text-text-header flex items-center gap-2">
                                <span className="text-2xl">{def.icon}</span> {def.title}
                            </h3>

                            <div className="bg-bg-muted rounded-2xl p-4 border border-border-muted">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Win Rate</span>
                                    <span className="text-2xl font-black text-text-main tabular-nums">{wr}%</span>
                                </div>
                                <AnimatedBar
                                    value={wr}
                                    max={100}
                                    color={wr >= 70 ? 'var(--success-stats)' : wr >= 40 ? 'var(--brand-light)' : 'var(--warning-base)'}
                                    delay="0.1s"
                                />
                                <div className="flex justify-between mt-2 text-xs text-text-dim font-medium">
                                    <span>Last 100 games</span>
                                    <span>{s.played} played</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StreakBadge value={s.currentStreak} />
                                <StreakBadge value={s.maxStreak} isMax />
                            </div>

                            {/* Mode-specific settings */}
                            {key === 'practice' && onDifficultyChange && (
                                <div className="pt-2">
                                    <span className="block text-xs font-bold uppercase tracking-widest text-text-dim mb-2">Difficulty Settings</span>
                                    <div className="flex bg-bg-subtle p-1 rounded-xl w-full">
                                        {['Economy', 'Business', 'First Class'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => onDifficultyChange(level as any)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${difficulty === level
                                                    ? 'bg-bg-main text-brand-base shadow-sm'
                                                    : 'text-text-secondary hover:text-text-main'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-text-dim mt-2 text-center">
                                        Higher difficulty gives you more miles!
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function StatsModal({ stats, allStats, winRate, getWinRate, hasWon, isOpen, guessCount, maxAttempts, answer, gameMode = 'practice', variant = 'postgame', difficulty, miles = 0, milesEarned = 0, onClose, onNext, onDifficultyChange, nextLabel }: Props) {
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
                        <div className="pt-7 pb-4 px-7 text-center">
                            <h2 className="text-3xl font-black text-text-main tracking-tight">Statistics</h2>
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
                    <>
                        {/* Header */}
                        <div className="pt-7 pb-3 px-7 text-center relative">
                            {/* Close button top right */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-text-dim hover:text-text-main hover:bg-bg-subtle p-2 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div
                                className="text-4xl mb-2 inline-block"
                                style={{ animation: 'header-pop 0.5s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
                            >
                                {hasWon ? '🎉' : '✈️'}
                            </div>
                            <h2 className="text-2xl font-black text-text-main tracking-tight">
                                {hasWon ? 'Nailed it!' : 'Better luck next time!'}
                            </h2>
                            <p className="text-sm text-text-dim mt-1 font-medium">
                                {hasWon
                                    ? <>Identified in <span className="font-bold text-text-muted">{guessCount} {guessCount === 1 ? 'guess' : 'guesses'}</span> / {maxAttempts}</>
                                    : <>Out of guesses!</>}
                            </p>
                        </div>

                        {/* Miles earned banner */}
                        {hasWon && milesEarned > 0 && (
                            <div className="relative overflow-hidden mx-7 mb-3 flex items-center justify-between px-4 py-2.5 bg-warning-muted border border-warning-light rounded-2xl">
                                <span className="relative z-10 text-sm font-bold text-warning-dark">Miles earned</span>
                                <span className="relative z-10 flex items-center gap-1.5 text-sm font-black text-warning-base">
                                    {milesEarned.toLocaleString()} mi
                                </span>

                                {/* Flying Plane Effect */}
                                <div
                                    className="absolute pointer-events-none z-20 overflow-visible"
                                    style={{
                                        top: '50%',
                                        left: '-15%',
                                        transform: 'translateY(-50%)',
                                        animation: 'plane-fly-across 1.2s 0.4s ease-in both',
                                        width: '56px',
                                        height: '56px',
                                        filter: 'drop-shadow(0 12px 8px rgba(0,0,0,0.3))'
                                    }}
                                >
                                    <img
                                        src="/images/plane-top.png"
                                        alt="plane"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Aircraft Reveal */}
                        {answer && (
                            <div className="mx-7 mb-4 rounded-2xl overflow-hidden border border-border-muted">
                                <div className="bg-bg-muted px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-dim">It was…</div>
                                <div className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div>
                                        {answer.manufacturer && answer.type ? (
                                            <>
                                                <p className="text-lg font-black text-text-main leading-tight">{answer.manufacturer} {answer.type}</p>
                                                <p className="text-sm text-text-secondary font-medium mt-0.5">{answer.airline}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-black text-text-main leading-tight">{Object.values(answer).join(' • ')}</p>
                                        )}
                                    </div>
                                    <span className="text-3xl">✈️</span>
                                </div>
                            </div>
                        )}

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 px-7 pb-1">
                            {/* Win Rate Bar */}
                            <div className="bg-bg-muted rounded-2xl p-4 mb-4 md:mb-6">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Win Rate</span>
                                    <span className="text-2xl font-black text-text-main tabular-nums">{winRate}%</span>
                                </div>
                                <AnimatedBar value={winRate} max={100} color={winRate >= 70 ? 'var(--success-stats)' : winRate >= 40 ? 'var(--brand-light)' : 'var(--warning-base)'} delay="0.15s" />
                                <div className="flex justify-between mt-2 text-xs text-text-dim font-medium">
                                    <span>Last 100 games</span>
                                    <span>{stats.played} played</span>
                                </div>
                            </div>

                            {/* Streak Cards */}
                            <div className="grid grid-cols-2 gap-3 pb-6">
                                <StreakBadge value={stats.currentStreak} />
                                <StreakBadge value={stats.maxStreak} isMax />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-7 pb-7 flex justify-center">
                            {gameMode === 'practice' && onNext ? (
                                <button
                                    onClick={() => { onNext(); onClose(); }}
                                    className={`w-full md:max-w-xs py-4 rounded-2xl font-bold text-lg tracking-wide active:scale-95 transition-all shadow-lg ${hasWon
                                        ? 'bg-brand-base hover:opacity-90 text-white'
                                        : 'bg-bg-inverse hover:opacity-90 text-white'
                                        }`}
                                >
                                    {nextLabel || 'Next Aircraft'}
                                </button>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="w-full md:max-w-xs py-4 rounded-2xl font-bold text-lg tracking-wide bg-bg-inverse hover:opacity-90 text-white active:scale-95 transition-all shadow-lg"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes confetti-fall {
                    0%   { transform: translateY(0)   rotate(0deg)   scaleX(1); opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateY(95vh) rotate(720deg) scaleX(-1); opacity: 0; }
                }
                @keyframes flame-wobble {
                    from { transform: rotate(-8deg) scale(1);    }
                    to   { transform: rotate(8deg)  scale(1.15); }
                }
                @keyframes flame-inferno {
                    from { transform: rotate(-12deg) scale(1.1);  }
                    to   { transform: rotate(12deg)  scale(1.35); }
                }
                @keyframes header-pop {
                    from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
                    to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
                }
                @keyframes plane-fly-across {
                    0%   { left: -15%; transform: translateY(-50%); }
                    100% { left: 115%; transform: translateY(-50%); }
                }
            `}</style>
        </div>
    );
}
