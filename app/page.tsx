'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import StatsModal from "@/components/stats";
import LeaderboardModal from "@/components/leaderboard/LeaderboardModal";
import { useStats } from "@/hooks/useStats";
import { useMiles } from "@/hooks/useMiles";
import { getOrCreateUserProfile, updateUsername } from "@/utils/user";

/** Fire-and-forget sync to DB — client is always source of truth */
const syncUserToDb = (id: string, name: string, miles: number) => {
    fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, miles }),
    }).catch(err => console.warn('[Sync] Failed to sync user to DB:', err));
};

export default function HomePage() {
    const { stats, getWinRate } = useStats();
    const { miles } = useMiles();
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [username, setUsername] = useState("Aviation Cadet");
    const [isEditingName, setIsEditingName] = useState(false);

    // --- DEBUG LOCALSTORAGE ---
    useEffect(() => {
        const profile = getOrCreateUserProfile();
        setUsername(profile.name);
    }, []);

    const handleSaveName = () => {
        setIsEditingName(false);
        const trimmed = username.trim();
        const finalName = trimmed || "Aviation Cadet";
        setUsername(finalName);
        updateUsername(finalName);
        const profile = getOrCreateUserProfile();
        syncUserToDb(profile.id, finalName, miles);
    };

    // --------------------------

    return (
        <div className="min-h-screen bg-bg-subtle flex flex-col items-center justify-center px-4 py-8 sm:py-16">



            <LeaderboardModal
                isOpen={isLeaderboardOpen}
                onClose={() => setIsLeaderboardOpen(false)}
            />

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

                {/* Pilot Profile Card */}
                <div
                    className="col-span-1 sm:col-span-2 lg:col-span-3 relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-5 flex items-center justify-between hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden group"
                >
                    {/* SVG Light Gray Background - Left aligned User icon */}
                    <div className="absolute inset-0 flex items-center justify-start pointer-events-none px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[8rem] h-[8rem] text-text-main opacity-[0.04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col px-2 w-full">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-base mb-0.5">Pilot Profile</span>
                        {isEditingName ? (
                            <input
                                autoFocus
                                type="text"
                                className="text-lg font-black text-text-main bg-transparent border-b-2 border-brand-base focus:outline-none w-full max-w-[200px]"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <h2 className="text-lg font-black text-text-main tracking-wide">
                                {username}
                            </h2>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            isEditingName ? handleSaveName() : setIsEditingName(true);
                        }}
                        className="relative z-10 p-2 text-text-dim group-hover:text-brand-base transition-colors"
                    >
                        {isEditingName ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success-stats" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        )}
                    </button>
                </div>

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

                    <div className="relative z-10 flex flex-col px-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim mb-0.5 text-left">Career Overview</span>
                        <h2 className="text-lg font-black text-text-main tracking-wide uppercase">
                            Your Career Stats
                        </h2>
                    </div>
                </button>

                {/* Global Rankings Card */}
                <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="col-span-1 sm:col-span-2 lg:col-span-3 relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-5 flex items-center justify-start hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden"
                >
                    {/* SVG Light Gray Background - Globe icon */}
                    <div className="absolute inset-0 flex items-center justify-start pointer-events-none px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[8rem] h-[8rem] text-text-main opacity-[0.04]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col px-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim mb-0.5 text-left">Community</span>
                        <h2 className="text-lg font-black text-text-main tracking-wide uppercase">
                            Global Rankings
                        </h2>
                    </div>
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

                {/* Military Mode */}
                <Link
                    href="/military"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-700 to-green-800 rounded-t-3xl" />
                    <div className="text-4xl">🪖</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Military Mode</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            Identify military aircraft from minimal data. No airlines, just intense knowledge.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                        <span className="text-xs font-bold text-yellow-700 bg-bg-muted px-2.5 py-1 rounded-full">Economy / Business / First</span>
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