'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import StatsModal from "@/components/stats";
import LeaderboardModal from "@/components/leaderboard/LeaderboardModal";
import PilotPanel from "@/components/home/PilotPanel";
import { useStats } from "@/hooks/useStats";
import { useMiles } from "@/hooks/useMiles";
import { getOrCreateUserProfile, updateUsername } from "@/utils/user";
import GameModeCard from "@/components/home/GameModeCard";

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
    const [globalRank, setGlobalRank] = useState<number | null>(null);

    // Load profile + fetch global rank
    useEffect(() => {
        const profile = getOrCreateUserProfile();
        setUsername(profile.name);

        if (profile.id) {
            fetch(`/api/leaderboard?userId=${profile.id}&limit=1`)
                .then(r => r.json())
                .then(data => {
                    if (data?.ownRank?.position) {
                        setGlobalRank(data.ownRank.position);
                    }
                })
                .catch(() => { });
        }
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
            <div className="text-center mt-8 mb-8">
                <h1 className="text-5xl sm:text-6xl font-black text-text-main tracking-tight mb-6 flex items-center justify-center gap-3">
                    <span>✈️</span>
                    <span>Plandle</span>
                </h1>
                <p className="text-text-secondary text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    How well do you know your aircraft? Guess the plane from the photo.
                </p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">

                {/* Daily Challenge Hero */}
                <Link
                    href="/daily"
                    className="col-span-1 sm:col-span-2 lg:col-span-3 group relative bg-[#e0f2fe] rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-[#bae6fd]/50 hover:shadow-md hover:bg-[#bae6fd]/40 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[22px] font-bold text-[#0f172a] tracking-tight">
                            Daily Challenge
                        </h2>
                        <div className="text-[15px] font-medium text-[#475569] leading-snug">
                            <p>One aircraft, same for everyone.</p>
                            <p>Come back daily to keep your streak.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white bg-brand-base px-5 py-2.5 rounded-xl group-hover:bg-brand-dark group-hover:shadow-md transition-all duration-200 order-first">
                            Play Now
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#475569] bg-[#0f172a]/5 px-3 py-1.5 rounded-full">
                                6 attempts
                            </span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-500/15 px-3 py-1.5 rounded-full">
                                +2,000 mi
                            </span>
                        </div>
                    </div>
                </Link>

                <PilotPanel
                    username={username}
                    isEditingName={isEditingName}
                    setIsEditingName={setIsEditingName}
                    onSaveName={handleSaveName}
                    onUsernameChange={setUsername}
                    dailyStreak={stats['daily']?.currentStreak ?? 0}
                    globalRank={globalRank}
                    onOpenStats={() => setIsStatsOpen(true)}
                    onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                />

                {/* Section Separator */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 pt-2 pb-0 px-2 flex items-center gap-3">
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-dim">Other modes</span>
                    <div className="flex-1 h-px bg-border-muted/60"></div>
                </div>

                <GameModeCard
                    href="/endless"
                    emoji="🔄"
                    title="Endless mode"
                    description="Sky's the Limit - where is yours?"
                    badgeLabel="+125–500 mi"
                />

                <GameModeCard
                    href="/military"
                    emoji="🪖"
                    title="Military mode"
                    description="Can you beat Maverick?"
                    badgeLabel="+125–500 mi"
                />

                <GameModeCard
                    href="/trivia"
                    emoji="🧠"
                    title="Trivia"
                    description="Test your aviation knowledge!"
                    badgeLabel="+250 mi"
                />

            </div>

            {/* Footer tagline */}
            <p className="mt-12 text-xs text-text-dim font-medium tracking-wide uppercase">
                Earn miles · Build streaks · Master aviation Hehehehheheheheh
            </p>
        </div>
    );
}