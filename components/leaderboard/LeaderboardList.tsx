'use client';

import { UserProfile } from "@/utils/user";

import { getCurrentTier } from "@/data/ranks";

type LeaderboardEntry = {
    id: string;
    name: string;
    miles: number;
};

type RankInfo = {
    position: number;
    name: string;
    miles: number;
};

type Props = {
    topPlayers: LeaderboardEntry[];
    ownRank: RankInfo | null;
    currentUserId: string | null;
};

export default function LeaderboardList({ topPlayers, ownRank, currentUserId }: Props) {
    const getRankIcon = (pos: number) => {
        if (pos === 1) return '🥇';
        if (pos === 2) return '🥈';
        if (pos === 3) return '🥉';
        return pos;
    };

    const renderEntry = (entry: LeaderboardEntry | RankInfo, isUser: boolean, rankPos?: number) => {
        const tier = getCurrentTier(entry.miles);
        const position = rankPos || (entry as any).position;

        return (
            <div 
                key={(entry as any).id || 'own-rank'}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isUser 
                    ? 'bg-brand-muted border-brand-light shadow-sm' 
                    : 'bg-bg-subtle border-border-muted'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-black text-text-dim text-sm">
                        {position ? getRankIcon(position) : '-'}
                    </span>
                    
                    {/* Rank Tier Icon */}
                    <div className={`p-1.5 rounded-lg ${tier.bgClass} flex items-center justify-center shrink-0`}>
                        <img src={tier.emoji} alt={tier.name} className="w-5 h-5 object-contain" />
                    </div>

                    <span className={`font-black tracking-tight line-clamp-1 ${isUser ? 'text-brand-base' : 'text-text-main'}`}>
                        {entry.name}{isUser && ' (You)'}
                    </span>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-sm font-black text-text-main">
                        {entry.miles.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-text-dim tracking-wider">miles</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full gap-2 pb-2">
            {/* Top Players List */}
            <div className="flex flex-col gap-2">
                {topPlayers.map((player, idx) => renderEntry(player, player.id === currentUserId, idx + 1))}
            </div>

            {/* Own Rank Divider (if not in top) */}
            {ownRank && !topPlayers.some(p => p.id === currentUserId) && (
                <>
                    <div className="flex items-center justify-center py-4">
                        <div className="h-[2px] w-12 bg-border-muted rounded-full opacity-50" />
                    </div>
                    {renderEntry(ownRank, true)}
                </>
            )}
        </div>
    );
}
