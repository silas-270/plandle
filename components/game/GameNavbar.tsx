type Props = {
    miles: number;
    modeLabel: string;
    onStatsClick: () => void;
};

export default function GameNavbar({ miles, modeLabel, onStatsClick }: Props) {
    return (
        <div className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-border-muted">

            {/* Miles Badge */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-warning-muted border border-warning-light rounded-full">
                <span className="text-sm sm:text-base">✈️</span>
                <span className="text-xs font-black text-warning-dark tabular-nums">{miles.toLocaleString()}</span>
                <span className="text-xs font-semibold text-warning-base">mi</span>
            </div>

            {/* Mode Label */}
            <span className="text-xs font-bold text-text-dim uppercase tracking-widest">
                {modeLabel}
            </span>

            {/* Stats Button */}
            <button
                onClick={onStatsClick}
                title="View Stats"
                className="p-1.5 sm:p-2 rounded-full text-text-dim hover:text-text-muted hover:bg-bg-subtle transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </button>
        </div>
    );
}
