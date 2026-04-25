'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuestionQueue } from '@/hooks/useQuestionQueue';
import { useGenericGameState, Grader } from '@/hooks/useGenericGameState';
import { useStats } from '@/hooks/useStats';
import { useMiles, DAILY_MILES } from '@/hooks/useMiles';
import { getManufacturers, getTypes, getAirlines } from '@/data/aircraft';
import { shareText } from '@/utils/share';
import { DIFFICULTY_CONFIGS } from '@/types/difficulty';
import GameShell from '@/components/game/GameShell';
import GameNavbar from '@/components/game/GameNavbar';
import GameImage from '@/components/game/GameImage';
import GameForm from '@/components/game/GameForm';
import GameHistory from '@/components/game/GameHistory';
import StatsModal from '@/components/stats';
import { FieldConfig } from '@/types/genericGame';

// Daily is always Economy difficulty
const config = DIFFICULTY_CONFIGS['Business'];

const aircraftGrader: Grader = (selection, actual) => {
    return {
        manufacturer: selection.manufacturer === actual.manufacturer ? 'correct' : 'incorrect',
        type: selection.type === actual.type ? 'correct' : (selection.manufacturer === actual.manufacturer ? 'partial' : 'incorrect'),
        airline: selection.airline === actual.airline ? 'correct' : 'incorrect',
    };
};

export default function DailyPage() {
    const { currentCard, status, nextQuestion } = useQuestionQueue('daily');
    const { guesses, isGameOver, hasWon, remainingAttempts, submitGuess, resetGame } = useGenericGameState(config.maxAttempts, aircraftGrader);
    const { stats, getWinRate, updateStats } = useStats();
    const { miles, addMiles } = useMiles();

    const [statsView, setStatsView] = useState<'postgame' | 'overview' | null>(null);
    const [dailyStatus, setDailyStatus] = useState<'solved' | 'played' | null>(null);

    const manufacturers = getManufacturers();
    const airlines = getAirlines();
    const initialTypes = manufacturers[0] ? getTypes(manufacturers[0]) : [];

    const [selectedManufacturer, setSelectedManufacturer] = useState(manufacturers[0] || '');
    const [selectedType, setSelectedType] = useState(initialTypes[0] || '');
    const [selectedAirline, setSelectedAirline] = useState(airlines[0] || '');
    const availableTypes = selectedManufacturer ? getTypes(selectedManufacturer) : [];

    // Auto-select first type when manufacturer changes
    useEffect(() => {
        if (selectedManufacturer) {
            setSelectedType(getTypes(selectedManufacturer)[0] || '');
        }
    }, [selectedManufacturer]);

    const fields: FieldConfig[] = [
        { key: 'manufacturer', label: 'Manufacturer', options: manufacturers },
        { key: 'type', label: 'Aircraft Type', options: availableTypes },
        { key: 'airline', label: 'Airline', options: airlines },
    ];

    const currentSelection = {
        manufacturer: selectedManufacturer,
        type: selectedType,
        airline: selectedAirline,
    };

    // Load today's daily completion status
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`plandle_daily_${today}`) as 'solved' | 'played' | null;
        if (saved) setDailyStatus(saved);
    }, []);

    // Persist daily status when game ends
    useEffect(() => {
        if (isGameOver) {
            const today = new Date().toISOString().split('T')[0];
            const s = hasWon ? 'solved' : 'played';
            localStorage.setItem(`plandle_daily_${today}`, s);
            setDailyStatus(s);
        }
    }, [isGameOver, hasWon]);

    // Record stats + award miles once per game
    const statsUpdatedRef = useRef(false);
    useEffect(() => {
        if (isGameOver && !statsUpdatedRef.current) {
            statsUpdatedRef.current = true;
            updateStats(hasWon, 'daily');
            if (hasWon) addMiles(DAILY_MILES);
            setStatsView('postgame');
        }
    }, [isGameOver, hasWon, updateStats, addMiles]);

    const handleGuess = () => {
        if (!currentCard) return;
        submitGuess(currentSelection, currentCard.answer);
    };

    // --- Loading / Error states ---
    if (status === 'initializing') {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Warming up engines...</div>;
    }
    if (status === 'error' || !currentCard) {
        return <div className="flex h-screen items-center justify-center text-error-base font-bold text-xl">Flight cancelled (Connection error).</div>;
    }

    const imageScale = isGameOver ? 1 : Math.max(1, config.initialZoom - (guesses.length * config.zoomStep));

    // ── Already played today: show completion panel ──
    if (dailyStatus && !isGameOver) {
        return (
            <GameShell>
                <GameNavbar miles={miles} modeLabel="📅 Daily Challenge" onStatsClick={() => setStatsView('overview')} />
                <div className="flex flex-col items-center justify-center px-8 py-16 text-center gap-4">
                    <div className="text-6xl">{dailyStatus === 'solved' ? '✅' : '❌'}</div>
                    <h3 className="text-2xl font-black text-text-main">
                        {dailyStatus === 'solved' ? 'Daily Challenge Complete!' : 'Better luck tomorrow!'}
                    </h3>
                    <p className="text-text-secondary max-w-xs leading-relaxed">
                        {dailyStatus === 'solved'
                            ? "You've already identified today's aircraft. Come back tomorrow for a new challenge!"
                            : "You've already played today's aircraft. Come back tomorrow!"}
                    </p>
                    <Link href="/endless" className="mt-2 px-8 py-3 bg-brand-base text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95">
                        Go to Endless Mode
                    </Link>
                    <Link href="/" className="text-sm text-text-dim hover:text-text-muted transition-colors font-medium">
                        ← Back to home
                    </Link>
                </div>
            </GameShell>
        );
    }

    const handleShareChallenge = () => {
        const url = `${window.location.origin}/daily`;
        const resultText = hasWon 
            ? `I solved today's Daily Challenge in ${guesses.length}/${config.maxAttempts} attempts! 🎯`
            : `I couldn't solve today's Daily Challenge... 😵`;

        const shareMsg = `✈️ Plandle Daily ✈️\n━━━━━━━━━━━━━━\n${resultText}\n\nCan you do better?\n👉 ${url}`;
        
        shareText('Plandle Daily', shareMsg);
    };

    // ── Normal game ──
    return (
        <>
            <StatsModal
                stats={stats['daily']}
                allStats={stats}
                winRate={getWinRate('daily')}
                getWinRate={getWinRate}
                hasWon={hasWon}
                isOpen={statsView !== null}
                variant={statsView === 'overview' ? 'overview' : 'postgame'}
                guessCount={guesses.length}
                maxAttempts={config.maxAttempts}
                answer={currentCard?.answer}
                gameMode="daily"
                miles={miles}
                milesEarned={hasWon ? DAILY_MILES : 0}
                onNext={() => {}}
                onClose={() => setStatsView(null)}
                onShareChallenge={handleShareChallenge}
            />
            <GameShell>
                <GameNavbar
                    miles={miles}
                    modeLabel="📅 Daily Challenge"
                    onStatsClick={() => setStatsView('overview')}
                />
                <GameImage
                    src={currentCard.image?.src ?? ''}
                    scale={imageScale}
                    isBuffering={status === 'buffering'}
                />
                <div className="p-4 sm:p-8 pb-28 sm:pb-8">
                    <GameForm
                        fields={fields}
                        selected={currentSelection}
                        onFieldChange={(key, value) => {
                            if (key === 'manufacturer') setSelectedManufacturer(value);
                            if (key === 'type') setSelectedType(value);
                            if (key === 'airline') setSelectedAirline(value);
                        }}
                        isBuffering={status === 'buffering'}
                        isGameOver={isGameOver}
                        remainingAttempts={remainingAttempts}
                        onGuess={handleGuess}
                        extraActions={isGameOver ? (
                            <Link
                                href="/endless"
                                className="w-full py-4 text-center rounded-xl font-bold text-lg tracking-wide active:scale-95 transition-all shadow-lg bg-brand-base hover:opacity-90 text-white"
                            >
                                Play Endless Mode 🔄
                            </Link>
                        ) : null}
                    />
                    <GameHistory guesses={guesses} fields={fields} />
                </div>
            </GameShell>
        </>
    );
}
