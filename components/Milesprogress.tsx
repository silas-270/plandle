interface Tier {
    name: string;
    emoji: string;
    threshold: number;
}

interface MilesProgressProps {
    miles: number;
    tiers: Tier[];
}

function fmtK(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
}

export default function MilesProgress({ miles, tiers }: MilesProgressProps) {

    const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);

    const currentTier = [...sorted].reverse().find((t) => miles >= t.threshold) ?? null;
    const nextTier = sorted.find((t) => miles < t.threshold) ?? null;

    const rangeStart = currentTier?.threshold ?? 0;
    const rangeEnd = nextTier?.threshold ?? (sorted.length > 0 ? sorted[sorted.length - 1].threshold : 100000);

    const fillPct = nextTier
        ? Math.min(100, ((miles - rangeStart) / (rangeEnd - rangeStart)) * 100)
        : 100;

    return (
        <div className="relative font-sans w-full transition-all duration-300">
            {/* Header section */}
            <div className="flex flex-col mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim mb-1">
                    Total Distance
                </span>
                <div className="flex items-baseline gap-2">
                    <p className="text-[50px] leading-none font-black text-text-main tracking-tight">
                        {miles.toLocaleString()}
                    </p>
                    <span className="text-xl font-bold text-text-dim">mi</span>
                </div>
            </div>

            {/* Current tier badge */}
            {currentTier && (
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 bg-brand-muted text-brand-dark text-xs font-bold tracking-widest rounded-full px-3 py-1.5 border border-brand-border">
                        <span>{currentTier.emoji}</span>
                        <span>{currentTier.name.toUpperCase()}</span>
                    </span>
                </div>
            )}

            {/* Tier labels */}
            <div className="flex justify-between items-end mb-2">
                {/* Left = current tier */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-text-dim uppercase">
                        {currentTier ? currentTier.name : "Start"}
                    </span>
                    <span className="font-mono text-xs font-bold text-text-dim">
                        {fmtK(rangeStart)}
                    </span>
                </div>

                {/* Right = next tier */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                        {nextTier ? nextTier.name : "Peak"}
                    </span>
                    <span className="font-mono text-xs font-bold text-text-secondary">
                        {nextTier ? fmtK(rangeEnd) : "MAX"}
                    </span>
                </div>
            </div>

            {/* Progress track */}
            <div className="h-2.5 bg-bg-subtle rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand-base rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${fillPct}%` }}
                />
            </div>

            {/* Remaining miles callout */}
            <div className="mt-8 bg-brand-muted rounded-2xl p-5 flex items-center justify-between">
                {nextTier ? (
                    <>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-text-dim uppercase">
                                Next Milestone
                            </span>
                            <span className="text-xs font-bold text-text-muted">
                                {nextTier.emoji} {nextTier.name.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-text-main tracking-tight">
                                +{(nextTier.threshold - miles).toLocaleString()}
                            </span>
                            <span className="ml-1 text-xs font-bold text-text-dim">mi</span>
                        </div>
                    </>
                ) : (
                    <div className="w-full text-center">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-text-secondary">
                            TOP TIER REACHED
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}