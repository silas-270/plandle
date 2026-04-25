'use client';

import { useEffect, useState } from 'react';

// --- Confetti Particle Component ---
export function ConfettiPiece({ index }: { index: number }) {
    const colors = ['var(--brand-light)', 'var(--warning-base)', 'var(--success-stats)', 'var(--error-base)', 'var(--accent-violet)', 'var(--accent-pink)', 'var(--accent-teal)'];
    const color = colors[index % colors.length];
    const left = `${(index * 37 + 11) % 100}%`;
    const delay = `${(index * 0.13) % 1.2}s`;
    const duration = `${1.2 + (index * 0.07) % 0.8}s`;
    const size = 6 + (index % 5);

    return (
        <div
            style={{
                position: 'absolute',
                top: '-20px',
                left,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: index % 3 === 0 ? '50%' : '2px',
                transform: `rotate(${index * 47}deg)`,
                animation: `confetti-fall ${duration} ${delay} ease-in forwards`,
            }}
        />
    );
}

// --- Animated Bar for streaks / win rate ---
export function AnimatedBar({ value, max, color = 'var(--brand-light)', delay = '0s' }: {
    value: number;
    max: number;
    color?: string;
    delay?: string;
}) {
    const [width, setWidth] = useState(0);
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;

    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 100);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div className="w-full h-2.5 bg-bg-subtle rounded-full overflow-hidden relative">
            <div
                style={{
                    width: `${width}%`,
                    backgroundColor: color,
                    height: '100%',
                    borderRadius: '9999px',
                    transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                }}
            />
        </div>
    );
}

import StreakElement from './StreakElement';

// --- Streak display with animated engine/fan ---
export function StreakBadge({ value, isMax }: { value: number; isMax?: boolean }) {
    const level = value >= 40 ? 3 : value >= 20 ? 2 : value >= 7 ? 1 : 0;
    const isHot = level > 0;

    return (
        <div className={`flex flex-col items-center justify-center px-4 py-4 rounded-2xl bg-bg-subtle border transition-all duration-300 ${isHot && !isMax ? 'border-border-main shadow-sm' : 'border-transparent'}`}>
            <div className="flex items-center gap-3">
                <StreakElement level={level} size={36} />
                <span className={`text-4xl font-black tabular-nums transition-colors duration-300 ${level === 3 ? 'text-red-500' :
                    level === 2 ? 'text-orange-500' :
                        level === 1 ? 'text-yellow-500' :
                            'text-text-main'
                    }`}>
                    {value}
                </span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest mt-2.5 text-center text-text-dim">
                {isMax ? 'Best Streak' : 'Streak'}
            </span>
        </div>
    );
}

export const MODE_DEFINITIONS: Record<string, { title: string; icon: string }> = {
    daily: { title: "Daily Challenge", icon: "📅" },
    practice: { title: "Endless Mode", icon: "🔄" },
    military: { title: "Military Mode", icon: "🪖" },
    trivia: { title: "Trivia Mode", icon: "🧠" },
};
