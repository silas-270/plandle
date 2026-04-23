export interface Tier {
    name: string;
    emoji: string;
    threshold: number;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}

export const TIERS: Tier[] = [
    { name: "Paper Plane", emoji: "📄", threshold: 0, colorClass: "text-neutral-400", bgClass: "bg-neutral-400/10", borderClass: "border-neutral-400/30" },
    { name: "Bronze", emoji: "🥉", threshold: 5000, colorClass: "text-amber-600", bgClass: "bg-amber-600/10", borderClass: "border-amber-600/30" },
    { name: "Silver", emoji: "🥈", threshold: 15000, colorClass: "text-slate-400", bgClass: "bg-slate-400/10", borderClass: "border-slate-400/30" },
    { name: "Gold", emoji: "🥇", threshold: 35000, colorClass: "text-yellow-500", bgClass: "bg-yellow-500/10", borderClass: "border-yellow-500/30" },
    { name: "Platinum", emoji: "💎", threshold: 65000, colorClass: "text-cyan-400", bgClass: "bg-cyan-400/10", borderClass: "border-cyan-400/30" },
    { name: "Diamond", emoji: "✨", threshold: 100000, colorClass: "text-blue-400", bgClass: "bg-blue-400/10", borderClass: "border-blue-400/30" },
    { name: "Master", emoji: "👑", threshold: 200000, colorClass: "text-purple-500", bgClass: "bg-purple-500/10", borderClass: "border-purple-500/30" },
    { name: "Grandmaster", emoji: "🌟", threshold: 400000, colorClass: "text-pink-500", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/30" },
    { name: "Legend", emoji: "🔥", threshold: 700000, colorClass: "text-rose-500", bgClass: "bg-rose-500/10", borderClass: "border-rose-500/30" },
    { name: "Top Gun", emoji: "🚀", threshold: 1000000, colorClass: "text-indigo-500", bgClass: "bg-indigo-500/10", borderClass: "border-indigo-500/30" },
];

export function getCurrentTier(miles: number): Tier {
    const sorted = [...TIERS].sort((a, b) => a.threshold - b.threshold);
    return [...sorted].reverse().find((t) => miles >= t.threshold) ?? sorted[0];
}

export function getNextTier(miles: number): Tier | null {
    const sorted = [...TIERS].sort((a, b) => a.threshold - b.threshold);
    return sorted.find((t) => miles < t.threshold) ?? null;
}
