import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-bg-subtle flex flex-col items-center justify-center px-4 py-16">

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

                {/* Daily Challenge */}
                <Link
                    href="/daily"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    {/* Background accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-light to-accent-teal rounded-t-3xl" />

                    <div className="text-4xl">📅</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Daily Challenge</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            One aircraft per day, same for everyone. Come back daily to keep your streak alive.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2">
                        <span className="text-xs font-bold text-brand-base bg-brand-muted px-2.5 py-1 rounded-full">Economy · 6 attempts</span>
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+400 mi</span>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-bg-soft group-hover:text-brand-muted transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 12H7m10 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>
                </Link>

                {/* Endless Mode */}
                <Link
                    href="/endless"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    {/* Background accent */}
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
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+150–600 mi</span>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-bg-soft group-hover:text-accent-pink transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 12H7m10 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>
                </Link>

                {/* Trivia Mode */}
                <Link
                    href="/trivia"
                    className="group relative bg-bg-main rounded-3xl shadow-lg border border-border-muted p-7 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                    {/* Background accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success-stats to-accent-teal rounded-t-3xl" />

                    <div className="text-4xl">🧠</div>
                    <div>
                        <h2 className="text-xl font-black text-text-main tracking-tight">Trivia (Beta)</h2>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                            Think you know aviation history? Guess the airline based on these facts.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                        <span className="text-xs font-bold text-success-stats bg-bg-muted px-2.5 py-1 rounded-full">3 attempts</span>
                        <span className="text-xs font-bold text-warning-dark bg-warning-muted px-2.5 py-1 rounded-full">+100 mi</span>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-bg-soft group-hover:text-success-base transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 12H7m10 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
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