'use client';

import { GameStats } from '@/hooks/useStats';
import { TIERS, getCurrentTier } from '@/data/ranks';
import MilesProgress from '@/components/Milesprogress';
import { AnimatedBar, StreakBadge, MODE_DEFINITIONS } from './StatElements';

interface OverviewPanelProps {
    allStats: GameStats;
    getWinRate: (m: string) => number;
    difficulty?: string;
    onDifficultyChange?: (level: any) => void;
    miles: number;
}

export default function OverviewPanel({ allStats, getWinRate, difficulty, onDifficultyChange, miles }: OverviewPanelProps) {
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
            <div className="mt-2 mb-6 px-7">
                <MilesProgress miles={miles} tiers={TIERS} />
            </div>

            {/* Global Settings */}
            {onDifficultyChange && (
                <div className="px-7 mb-10">
                    <span className="block text-xs font-bold uppercase tracking-widest text-text-dim mb-2">Game Difficulty</span>
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

                            {/* Removed Mode-specific settings */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
