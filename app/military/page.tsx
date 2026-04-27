'use client';

import { useState, useEffect, useRef } from 'react';
import { useMilitaryQueue } from '@/hooks/useMilitaryQueue';
import { useGenericGameState, Grader } from '@/hooks/useGenericGameState';
import { useUser } from '@/contexts/UserContext';
import { getMilitaryManufacturers, getMilitaryTypes, getMilitaryIndex, encodeMilitaryChallenge } from '@/data/military';
import { shareText } from '@/utils/share';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '@/types/difficulty';
import GameShell from '@/components/game/GameShell';
import GameNavbar from '@/components/game/GameNavbar';
import GameImage from '@/components/game/GameImage';
import GameForm from '@/components/game/GameForm';
import GameHistory from '@/components/game/GameHistory';
import StatsModal from '@/components/stats';
import { FieldConfig } from '@/types/genericGame';

const SKIP_COST = 250;

const militaryGrader: Grader = (selection, actual) => {
    return {
        manufacturer: selection.manufacturer === actual.manufacturer ? 'correct' : 'incorrect',
        type: selection.type === actual.type
            ? 'correct'
            : (selection.manufacturer === actual.manufacturer ? 'partial' : 'incorrect'),
    };
};

export default function MilitaryPage() {
    const { stats, getWinRate, updateStats, miles, addMiles, spendMiles, canAfford, difficulty: savedDifficulty, setDifficulty: saveDifficulty } = useUser();

    const [difficulty, setDifficulty] = useState<DifficultyLevel>((savedDifficulty as DifficultyLevel) || 'Business');
    const config = DIFFICULTY_CONFIGS[difficulty];

    // Sync from context once loaded
    useEffect(() => {
        if (savedDifficulty && DIFFICULTY_CONFIGS[savedDifficulty as DifficultyLevel]) {
            setDifficulty(savedDifficulty as DifficultyLevel);
        }
    }, [savedDifficulty]);

    const { currentCard, status, nextQuestion } = useMilitaryQueue();
    const { guesses, isGameOver, hasWon, isSkipped, remainingAttempts, submitGuess, skipGame, resetGame } = useGenericGameState(config.maxAttempts, militaryGrader);

    const [statsView, setStatsView] = useState<'postgame' | 'overview' | null>(null);

    const manufacturers = getMilitaryManufacturers();
    const initialTypes = manufacturers[0] ? getMilitaryTypes(manufacturers[0]) : [];

    const [selectedManufacturer, setSelectedManufacturer] = useState(manufacturers[0] || '');
    const [selectedType, setSelectedType] = useState(initialTypes[0] || '');
    const availableTypes = selectedManufacturer ? getMilitaryTypes(selectedManufacturer) : [];

    // Auto-select first type when manufacturer changes
    useEffect(() => {
        if (selectedManufacturer) {
            setSelectedType(getMilitaryTypes(selectedManufacturer)[0] || '');
        }
    }, [selectedManufacturer]);

    const fields: FieldConfig[] = [
        { key: 'manufacturer', label: 'Manufacturer', options: manufacturers },
        { key: 'type', label: 'Aircraft Type', options: availableTypes },
    ];

    const currentSelection = {
        manufacturer: selectedManufacturer,
        type: selectedType,
    };

    // Record stats + award miles once per game (skipped rounds are excluded)
    const statsUpdatedRef = useRef(false);
    useEffect(() => {
        if (isGameOver && !statsUpdatedRef.current) {
            statsUpdatedRef.current = true;
            if (!isSkipped) {
                updateStats(hasWon, 'military');
                if (hasWon) addMiles(config.milesPerWin);
            }
            setStatsView('postgame');
        }
    }, [isGameOver, hasWon, isSkipped, updateStats, addMiles, config.milesPerWin]);

    const handleGuess = () => {
        if (!currentCard) return;
        submitGuess(currentSelection, currentCard.answer as unknown as Record<string, string>);
    };

    const handleNext = () => {
        resetGame();
        statsUpdatedRef.current = false;
        nextQuestion();
        setSelectedManufacturer(manufacturers[0] || '');
        setSelectedType(initialTypes[0] || '');
        // Remove challenge param so subsequent questions are random
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('c');
            window.history.replaceState({}, '', url.toString());
        }
    };

    const handleShareChallenge = () => {
        if (!currentCard) return;
        const aircraftIndex = getMilitaryIndex(
            currentCard.answer.manufacturer,
            currentCard.answer.type
        );
        if (aircraftIndex === -1) return;

        const encoded = encodeMilitaryChallenge(aircraftIndex, currentCard.imageIndex);
        const url = `${window.location.origin}/military?c=${encoded}`;

        const resultText = isSkipped
            ? `I skipped this one after ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}. ⏭️`
            : hasWon
                ? `I identified this military aircraft in ${guesses.length}/${config.maxAttempts} attempts! 🎯`
                : `I couldn't identify this military aircraft... 😵`;
        const shareMsg = `🪖 Plandle Military Challenge 🪖\n━━━━━━━━━━━━━━\n${resultText}\n\nThink you know your jets?\n👉 ${url}`;
        shareText('Plandle Military Challenge', shareMsg);
    };

    const handleDifficultyChange = (level: DifficultyLevel) => {
        if (guesses.length > 0 && !isGameOver) {
            if (!confirm('Changing difficulty will reset your current game. Continue?')) return;
        }
        setDifficulty(level);
        saveDifficulty(level);
        handleNext();
    };

    // --- Loading / Error states ---
    if (status === 'initializing') {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Warming up engines...</div>;
    }
    // Buffering between questions (queue temporarily empty) — show loading, not error
    if (status === 'buffering' && !currentCard) {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Loading next target...</div>;
    }
    if (status === 'error') {
        return <div className="flex h-screen items-center justify-center text-error-base font-bold text-xl">Flight cancelled (Connection error).</div>;
    }
    if (!currentCard) {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Loading next target...</div>;
    }

    const imageScale = isGameOver ? 1 : Math.max(1, config.initialZoom - (guesses.length * config.zoomStep));

    const skipButton = !isGameOver && guesses.length >= 2 && canAfford(SKIP_COST) ? (
        <button
            onClick={() => { spendMiles(SKIP_COST); skipGame(); }}
            disabled={status === 'buffering'}
            className="w-full py-3 text-sm font-bold text-warning-dark bg-warning-muted border border-warning-light rounded-xl hover:opacity-90 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
            <span>⏭️</span> Skip bad image (−{SKIP_COST.toLocaleString()} mi)
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
                stats={stats['military'] || { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 }}
                allStats={stats}
                winRate={getWinRate('military')}
                getWinRate={getWinRate}
                hasWon={hasWon}
                isSkipped={isSkipped}
                isOpen={statsView !== null}
                variant={statsView === 'overview' ? 'overview' : 'postgame'}
                guessCount={guesses.length}
                maxAttempts={config.maxAttempts}
                answer={currentCard?.answer as unknown as Record<string, string>}
                gameMode="military"
                miles={miles}
                milesEarned={hasWon ? config.milesPerWin : 0}
                onNext={handleNext}
                onClose={() => setStatsView(null)}
                onShareChallenge={handleShareChallenge}
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
            />
            <GameShell>
                <GameNavbar
                    miles={miles}
                    modeLabel="🪖 Military Mode"
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
