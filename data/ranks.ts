export interface Tier {
    name: string;
    emoji: string; // Now contains image path
    threshold: number;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    cssColor: string;
}

export const TIERS: Tier[] = [
    { name: "Paper Plane", emoji: "/assets/rank-icons/rank-01.png", threshold: 0,       colorClass: "text-neutral-400", bgClass: "bg-neutral-400/10", borderClass: "border-neutral-400/30", cssColor: "#a3a3a3" },
    { name: "Bronze",      emoji: "/assets/rank-icons/rank-02.png", threshold: 5000,    colorClass: "text-amber-600",   bgClass: "bg-amber-600/10",   borderClass: "border-amber-600/30",   cssColor: "#d97706" },
    { name: "Silver",      emoji: "/assets/rank-icons/rank-03.png", threshold: 15000,   colorClass: "text-slate-400",   bgClass: "bg-slate-400/10",   borderClass: "border-slate-400/30",   cssColor: "#94a3b8" },
    { name: "Gold",        emoji: "/assets/rank-icons/rank-04.png", threshold: 35000,   colorClass: "text-yellow-500",  bgClass: "bg-yellow-500/10",  borderClass: "border-yellow-500/30",  cssColor: "#eab308" },
    { name: "Platinum",    emoji: "/assets/rank-icons/rank-05.png", threshold: 65000,   colorClass: "text-cyan-400",    bgClass: "bg-cyan-400/10",    borderClass: "border-cyan-400/30",    cssColor: "#22d3ee" },
    { name: "Diamond",     emoji: "/assets/rank-icons/rank-06.png", threshold: 100000,  colorClass: "text-blue-400",    bgClass: "bg-blue-400/10",    borderClass: "border-blue-400/30",    cssColor: "#60a5fa" },
    { name: "Master",      emoji: "/assets/rank-icons/rank-07.png", threshold: 200000,  colorClass: "text-purple-500",  bgClass: "bg-purple-500/10",  borderClass: "border-purple-500/30",  cssColor: "#a855f7" },
    { name: "Grandmaster", emoji: "/assets/rank-icons/rank-08.png", threshold: 400000,  colorClass: "text-pink-500",    bgClass: "bg-pink-500/10",    borderClass: "border-pink-500/30",    cssColor: "#ec4899" },
    { name: "Legend",      emoji: "/assets/rank-icons/rank-09.png", threshold: 700000,  colorClass: "text-rose-500",    bgClass: "bg-rose-500/10",    borderClass: "border-rose-500/30",    cssColor: "#f43f5e" },
    { name: "Top Gun",     emoji: "/assets/rank-icons/rank-10.png", threshold: 1000000, colorClass: "text-indigo-500",  bgClass: "bg-indigo-500/10",  borderClass: "border-indigo-500/30",  cssColor: "#6366f1" },
];

export function getCurrentTier(miles: number): Tier {
    const sorted = [...TIERS].sort((a, b) => a.threshold - b.threshold);
    return [...sorted].reverse().find((t) => miles >= t.threshold) ?? sorted[0];
}

export function getNextTier(miles: number): Tier | null {
    const sorted = [...TIERS].sort((a, b) => a.threshold - b.threshold);
    return sorted.find((t) => miles < t.threshold) ?? null;
}
