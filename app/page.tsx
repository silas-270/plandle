'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import StatsModal from "@/components/stats";
import { useStats } from "@/hooks/useStats";
import { useMiles } from "@/hooks/useMiles";

export default function HomePage() {
    const { stats, getWinRate } = useStats();
    const { miles } = useMiles();
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    // --- DEBUG LOCALSTORAGE ---
    const [debugStats, setDebugStats] = useState("");
    const [debugMiles, setDebugMiles] = useState("");

    useEffect(() => {
        setDebugStats(localStorage.getItem('plandle_stats_v2') || "");
        setDebugMiles(localStorage.getItem('plandle_miles_v1') || "");
    }, []);

    const handleSaveDebug = () => {
        localStorage.setItem('plandle_stats_v2', debugStats);
        localStorage.setItem('plandle_miles_v1', debugMiles);
        window.location.reload();
    };
    // --------------------------

    return (
        <div className="min-h-screen bg-bg-subtle flex flex-col items-center justify-center px-4 py-8 sm:py-16">

            {/* Quick Debug Panel (Delete layer) */}
            <div className="w-full max-w-5xl bg-red-100/20 border border-red-500 p-4 mb-8 rounded-lg">
                <p className="text-red-500 font-bold mb-2">DEBUG: LocalStorage Editor (Delete after use)</p>
                <p className="text-xs text-text-dim">plandle_stats_v2:</p>
                <textarea
                    className="w-full h-32 text-xs font-mono p-2 bg-bg-main text-text-main border border-border-muted rounded mb-2"
                    value={debugStats}
                    onChange={e => setDebugStats(e.target.value)}
                />
                <p className="text-xs text-text-dim">plandle_miles_v1:</p>
                <input
                    type="text"
                    className="w-full text-xs font-mono p-2 bg-bg-main text-text-main border border-border-muted rounded mb-2"
                    value={debugMiles}
                    onChange={e => setDebugMiles(e.target.value)}
                />
                <button
                    onClick={handleSaveDebug}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                    Save & Reload
                </button>
            </div>

            <StatsModal
                stats={stats['practice'] || { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, guessDistribution: [] }}
                allStats={stats}
                winRate={getWinRate('practice')}
                getWinRate={getWinRate}
                hasWon={false}
                isOpen={isStatsOpen}
                variant="overview"
                guessCount={0}
                maxAttempts={0}
                miles={miles}
                onClose={() => setIsStatsOpen(false)}
            />

            {/* Hero */}
            <div className="text-center mb-12">
                <div className="text-6xl mb-4">✈️</div>
                <h1 className="text-5xl sm:text-6xl font-black text-text-main tracking-tight mb-3">
                    Plandle
                </h1>
                <p className="text-text-secondary text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    How well do you know your aircraft? Guess the plane from the photo.
                </p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">

                {/* Player Stats Card - Compact minimalist design */}
                <button
                    onClick={() => setIsStatsOpen(true)}
                    className="col-span-1 sm:col-span-2 lg:col-span-3 relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-5 flex items-center justify-start hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden"
                >
                    {/* SVG Light Gray Background - Left aligned */}
                    <div className="absolute inset-0 flex items-center justify-start pointer-events-none px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[8rem] h-[8rem] text-text-main opacity-[0.04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>

                    <h2 className="relative z-10 text-lg font-black text-text-main tracking-wide uppercase px-2">
                        Your Career Stats
                    </h2>
                </button>

                {/* Daily Challenge */}
                <Link
                    href="/daily"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-light to-accent-teal rounded-t-3xl" />
                    <div className="text-4xl">📅</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Daily Challenge</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            One aircraft per day, same for everyone. Come back daily to keep your streak alive.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                        <span className="text-xs font-bold text-brand-base bg-brand-muted px-2.5 py-1 rounded-full">Economy · 6 attempts</span>
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+2000 mi</span>
                    </div>

                </Link>

                {/* Endless Mode */}
                <Link
                    href="/endless"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-violet to-brand-light rounded-t-3xl" />
                    <div className="text-4xl">🔄</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Endless Mode</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            Practice at your own pace. Choose your difficulty and identify as many aircraft as you can.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                        <span className="text-xs font-bold text-accent-violet bg-bg-muted px-2.5 py-1 rounded-full">Economy / Business / First</span>
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+125–500 mi</span>
                    </div>

                </Link>

                {/* Trivia Mode */}
                <Link
                    href="/trivia"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success-stats to-accent-teal rounded-t-3xl" />
                    <div className="text-4xl">🧠</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Trivia</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            Think you know aviation history? Guess the airline based on these facts.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                        <span className="text-xs font-bold text-success-stats bg-bg-muted px-2.5 py-1 rounded-full">3 attempts</span>
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+250 mi</span>
                    </div>

                </Link>

            </div>

            {/* Footer tagline */}
            <p className="mt-12 text-xs text-text-dim font-medium tracking-wide uppercase">
                Earn miles · Build streaks · Master aviation
            </p>
        </div>
    );
}