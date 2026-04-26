'use client';

import { useState } from 'react';

interface PilotPanelProps {
    username: string;
    isEditingName: boolean;
    setIsEditingName: (v: boolean) => void;
    onSaveName: () => void;
    onUsernameChange: (v: string) => void;
    dailyStreak: number;
    globalRank: number | null;
    onOpenStats: () => void;
    onOpenLeaderboard: () => void;
}

export default function PilotPanel({
    username,
    isEditingName,
    setIsEditingName,
    onSaveName,
    onUsernameChange,
    dailyStreak,
    globalRank,
    onOpenStats,
    onOpenLeaderboard,
}: PilotPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col gap-2">

            {/* ── Hero Card (toggle trigger) ── */}
            <button
                onClick={() => setIsExpanded(v => !v)}
                className="w-full relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-4 flex items-center justify-between overflow-hidden hover:shadow-md hover:bg-bg-subtle transition-all duration-200 cursor-pointer group"
            >
                {/* Left: name + streak */}
                <div className="relative z-10 flex flex-col gap-0.5 text-left">
                    <span className="text-sm font-semibold text-text-dim tracking-wide">{username}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-md leading-none">🔥</span>
                        <span className="text-lg font-black text-text-main leading-none">
                            {dailyStreak}-day streak
                        </span>
                    </div>
                </div>

                {/* Right: rank badge + chevron */}
                <div className="relative z-10 flex items-center gap-2.5">
                    {globalRank !== null ? (
                        <div className="bg-[#dbeafe] rounded-full px-2.5 py-1">
                            <span className="text-xs font-bold text-[#1e3a8a] whitespace-nowrap">
                                #{globalRank} global
                            </span>
                        </div>
                    ) : (
                        <div className="bg-bg-subtle border border-border-muted rounded-full px-2.5 py-1 opacity-50">
                            <span className="text-xs font-bold text-text-dim whitespace-nowrap">
                                — global
                            </span>
                        </div>
                    )}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 text-text-dim transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* ── Collapsible sub-cards ── */}
            <div
                className={`flex flex-col gap-2 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Pilot Profile Card */}
                <div className="relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-4 flex items-center justify-between hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden group">
                    {/* Background icon */}
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
                                onChange={e => onUsernameChange(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && onSaveName()}
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <h2 className="text-lg font-black text-text-main tracking-wide">{username}</h2>
                        )}
                    </div>

                    <button
                        onClick={e => {
                            e.stopPropagation();
                            isEditingName ? onSaveName() : setIsEditingName(true);
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

                {/* minimalist Stats & Rankings Row */}
                <div className="flex flex-row gap-2 mb-1">
                    {/* Career Stats Button */}
                    <button
                        onClick={onOpenStats}
                        className="flex-1 relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-4 flex items-center justify-center hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-text-main opacity-40 group-hover:opacity-100 group-hover:text-brand-base transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </button>

                    {/* Global Rankings Button */}
                    <button
                        onClick={onOpenLeaderboard}
                        className="flex-1 relative bg-bg-main rounded-2xl shadow-sm border border-border-muted p-4 flex items-center justify-center hover:shadow-md hover:bg-bg-subtle transition-all duration-200 overflow-hidden group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-text-main opacity-40 group-hover:opacity-100 group-hover:text-brand-base transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
