'use client';

import { ModeStats } from '@/hooks/useStats';
import { AnimatedBar, StreakBadge } from './StatElements';
import { getCurrentTier, getNextTier } from '@/data/ranks';

interface PostgameSectionProps {
    hasWon: boolean;
    guessCount: number;
    maxAttempts: number;
    milesEarned: number;
    winRate: number;
    miles: number;
    stats: ModeStats;
    answer?: Record<string, string>;
    gameMode: string;
    nextLabel?: string;
    onClose: () => void;
    onNext?: () => void;
}

export default function PostgameSection({
    hasWon,
    guessCount,
    maxAttempts,
    milesEarned,
    winRate,
    miles,
    stats,
    answer,
    gameMode,
    nextLabel,
    onClose,
    onNext,
}: PostgameSectionProps) {
    const currentTier = getCurrentTier(miles);
    const nextTier = getNextTier(miles);
    const milesIntoCurrentTier = miles - currentTier.threshold;
    const milesForNextTier = nextTier ? nextTier.threshold - currentTier.threshold : 1;
    const progressPct = nextTier ? Math.round((milesIntoCurrentTier / milesForNextTier) * 100) : 100;
    const milesRemaining = nextTier ? nextTier.threshold - miles : 0;
    return (
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
                {/* Rank Progress Bar */}
                <div className="bg-bg-muted rounded-2xl p-4 mb-4 md:mb-6 relative overflow-hidden group">
                    {/* Rank Up Detection logic */}
                    {(() => {
                        const milesBefore = miles - milesEarned;
                        const tierBefore = getCurrentTier(milesBefore);
                        const isRankUp = hasWon && milesEarned > 0 && currentTier.threshold > tierBefore.threshold;

                        return (
                            <>
                                {/* Full Widget Sun-Shimmer Effect */}
                                {isRankUp && (
                                    <div 
                                        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                                        style={{ opacity: 0.8 }}
                                    >
                                        <div 
                                            className="absolute top-0 h-full w-[150%] skew-x-[-25deg]"
                                            style={{
                                                background: `linear-gradient(90deg, transparent 0%, ${currentTier.cssColor}44 45%, ${currentTier.cssColor}aa 50%, ${currentTier.cssColor}44 55%, transparent 100%)`,
                                                animation: 'rank-shimmer-sweep 2.5s ease-in-out infinite',
                                                left: '-150%'
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between items-baseline mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isRankUp ? '' : 'text-text-dim'}`}
                                            style={isRankUp ? { color: currentTier.cssColor } : {}}
                                        >
                                            {isRankUp ? 'Rank up!' : 'Rank Progress'}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold tabular-nums text-text-main">
                                        {nextTier ? `${milesRemaining.toLocaleString()} mi` : 'MAX'}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <AnimatedBar 
                                        value={progressPct} 
                                        max={100} 
                                        color="var(--brand-base)" 
                                        delay="0.15s" 
                                    />
                                </div>
                            </>
                        );
                    })()}
                    <div className="flex justify-between mt-2 text-[10px] text-text-dim font-black uppercase tracking-widest relative z-10">
                        <span className="flex items-center gap-1.5 grayscale brightness-125">
                            <img src={currentTier.emoji} alt="" className="w-3.5 h-3.5 object-contain" />
                            {currentTier.name}
                        </span>
                        <span>
                            {nextTier ? (
                                <span className="flex items-center gap-1.5 grayscale brightness-125">
                                    <img src={nextTier.emoji} alt="" className="w-3.5 h-3.5 object-contain" />
                                    {nextTier.name}
                                </span>
                            ) : '🏆 Max Rank'}
                        </span>
                    </div>

                    <style jsx global>{`
                        @keyframes rank-shimmer-sweep {
                            0%   { left: -150%; }
                            40%  { left: 150%;  }
                            100% { left: 150%;  }
                        }
                    `}</style>
                </div>

                {/* Streak + Win Rate */}
                <div className="grid grid-cols-2 gap-3 pb-6">
                    <StreakBadge value={stats.currentStreak} />
                    {/* Win Rate Badge replacing Best Streak */}
                    <div className="flex flex-col items-center justify-center px-4 py-4 rounded-2xl bg-bg-subtle">
                        <span className="text-4xl font-black tabular-nums text-text-main">{winRate}%</span>
                        <span className="text-xs font-bold uppercase tracking-widest mt-1 text-center text-text-dim">Win Rate</span>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="px-7 pb-7 flex justify-center">
                {(gameMode === 'practice' || gameMode === 'trivia') && onNext ? (
                    <button
                        onClick={() => { onNext(); onClose(); }}
                        className={`w-full md:max-w-xs py-4 rounded-2xl font-bold text-lg tracking-wide active:scale-95 transition-all shadow-lg ${hasWon
                            ? 'bg-brand-base hover:opacity-90 text-white'
                            : 'bg-bg-inverse hover:opacity-90 text-white'
                            }`}
                    >
                        {nextLabel || (gameMode === 'trivia' ? 'Next Question' : 'Next Aircraft')}
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
    );
}
