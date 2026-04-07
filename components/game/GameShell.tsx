import Link from 'next/link';

export default function GameShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-subtle flex flex-col items-center py-8 px-4 sm:px-6">

            {/* Page Header / Wordmark */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <Link
                    href="/"
                    className="p-2 rounded-full text-text-dim hover:text-text-muted hover:bg-bg-soft transition-colors bg-bg-main shadow-sm border border-border-muted"
                    title="Go Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <span className="text-2xl font-black text-text-header tracking-tight">
                    Plandle <span className="text-brand-light">✈️</span>
                </span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-4xl bg-bg-main rounded-2xl shadow-xl overflow-hidden">
                {children}
            </div>
        </div>
    );
}
