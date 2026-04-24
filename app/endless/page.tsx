'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuestionQueue } from '@/hooks/useQuestionQueue';
import { useGenericGameState, Grader } from '@/hooks/useGenericGameState';
import { useStats } from '@/hooks/useStats';
import { useMiles, SKIP_COST } from '@/hooks/useMiles';
import { getManufacturers, getTypes, getAirlines } from '@/data/aircraft';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '@/types/difficulty';
import GameShell from '@/components/game/GameShell';
import GameNavbar from '@/components/game/GameNavbar';
import GameImage from '@/components/game/GameImage';
import GameForm from '@/components/game/GameForm';
import GameHistory from '@/components/game/GameHistory';
import StatsModal from '@/components/stats';
import { FieldConfig } from '@/types/genericGame';

const aircraftGrader: Grader = (selection, actual) => {
    return {
        manufacturer: selection.manufacturer === actual.manufacturer ? 'correct' : 'incorrect',
        type: selection.type === actual.type ? 'correct' : (selection.manufacturer === actual.manufacturer ? 'partial' : 'incorrect'),
        airline: selection.airline === actual.airline ? 'correct' : 'incorrect',
    };
};

export default function EndlessPage() {
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('Business');
    const config = DIFFICULTY_CONFIGS[difficulty];

    const { currentCard, status, nextQuestion } = useQuestionQueue('practice');
    const { guesses, isGameOver, hasWon, remainingAttempts, submitGuess, resetGame } = useGenericGameState(config.maxAttempts, aircraftGrader);
    const { stats, getWinRate, updateStats } = useStats();
    const { miles, addMiles, spendMiles, canAfford } = useMiles();

    const [statsView, setStatsView] = useState<'postgame' | 'overview' | null>(null);

    const manufacturers = getManufacturers();
    const airlines = getAirlines();
    const initialTypes = manufacturers[0] ? getTypes(manufacturers[0]) : [];

    const [selectedManufacturer, setSelectedManufacturer] = useState(manufacturers[0] || '');
    const [selectedType, setSelectedType] = useState(initialTypes[0] || '');
    const [selectedAirline, setSelectedAirline] = useState(airlines[0] || '');
    const availableTypes = selectedManufacturer ? getTypes(selectedManufacturer) : [];

    // Load persisted difficulty
    useEffect(() => {
        const saved = localStorage.getItem('plandle_difficulty') as DifficultyLevel;
        if (saved && DIFFICULTY_CONFIGS[saved]) setDifficulty(saved);
    }, []);

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

    // Record stats + award miles once per game
    const statsUpdatedRef = useRef(false);
    useEffect(() => {
        if (isGameOver && !statsUpdatedRef.current) {
            statsUpdatedRef.current = true;
            updateStats(hasWon, 'practice');
            if (hasWon) addMiles(config.milesPerWin);
            setStatsView('postgame');
        }
    }, [isGameOver, hasWon, updateStats, addMiles, config.milesPerWin]);

    const handleGuess = () => {
        if (!currentCard) return;
        submitGuess(currentSelection, currentCard.answer);
    };

    const handleNext = () => {
        resetGame();
        statsUpdatedRef.current = false;
        nextQuestion();
        setSelectedManufacturer(manufacturers[0]);
        setSelectedType(initialTypes[0]);
        setSelectedAirline(airlines[0]);
    };

    const handleDifficultyChange = (level: DifficultyLevel) => {
        if (guesses.length > 0 && !isGameOver) {
            if (!confirm('Changing difficulty will reset your current game. Continue?')) return;
        }
        setDifficulty(level);
        localStorage.setItem('plandle_difficulty', level);
        handleNext();
    };

    // --- Loading / Error states ---
    if (status === 'initializing') {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Warming up engines...</div>;
    }
    if (status === 'error' || !currentCard) {
        return <div className="flex h-screen items-center justify-center text-error-base font-bold text-xl">Flight cancelled (Connection error).</div>;
    }

    const imageScale = isGameOver ? 1 : Math.max(1, config.initialZoom - (guesses.length * config.zoomStep));

    // Skip button — Endless-only, only visible when affordable and 2+ guesses in
    const skipButton = !isGameOver && guesses.length >= 2 && canAfford(SKIP_COST) ? (
        <button
            onClick={() => { spendMiles(SKIP_COST); handleNext(); }}
            disabled={status === 'buffering'}
            className="w-full py-3 text-sm font-bold text-warning-dark bg-warning-muted border border-warning-light rounded-xl hover:opacity-90 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
            <span>✈️</span> Skip bad image (−{SKIP_COST.toLocaleString()} mi)
        </button>
    ) : null;

    const nextButton = isGameOver ? (
        <button
            onClick={handleNext}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide active:scale-95 transition-all shadow-lg ${hasWon
                ? 'bg-brand-base hover:opacity-90 text-white'
                : 'bg-bg-inverse hover:opacity-90 text-white'
                }`}
        >
            Next Aircraft
        </button>
    ) : null;

    return (
        <>
            <StatsModal
                stats={stats['practice']}
                allStats={stats}
                winRate={getWinRate('practice')}
                getWinRate={getWinRate}
                hasWon={hasWon}
                isOpen={statsView !== null}
                variant={statsView === 'overview' ? 'overview' : 'postgame'}
                guessCount={guesses.length}
                maxAttempts={config.maxAttempts}
                answer={currentCard?.answer}
                gameMode="practice"
                miles={miles}
                milesEarned={hasWon ? config.milesPerWin : 0}
                onNext={handleNext}
                onClose={() => setStatsView(null)}
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
            />
            <GameShell>
                <GameNavbar
                    miles={miles}
                    modeLabel="🔄 Endless Mode"
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
                        extraActions={<>{skipButton}{nextButton}</>}
                    />
                    <GameHistory guesses={guesses} fields={fields} />
                </div>
            </GameShell>
        </>
    );
}
