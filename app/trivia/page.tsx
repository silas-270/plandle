'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useGenericGameState, exactMatchGrader } from '@/hooks/useGenericGameState';
import { useStats } from '@/hooks/useStats';
import { useMiles } from '@/hooks/useMiles';
import { TRIVIA_QUESTIONS } from '@/data/trivia';
import { getManufacturers, getTypes, getAirlines } from '@/data/aircraft';
import { FieldConfig, GenericAnswer } from '@/types/genericGame';

import GameShell from '@/components/game/GameShell';
import GameNavbar from '@/components/game/GameNavbar';
import GameTextCard from '@/components/game/GameTextCard';
import GameForm from '@/components/game/GameForm';
import GameHistory from '@/components/game/GameHistory';
import StatsModal from '@/components/stats';

export default function TriviaPage() {
    const [qIndex, setQIndex] = useState(() => Math.floor(Math.random() * TRIVIA_QUESTIONS.length));
    const question = TRIVIA_QUESTIONS[qIndex];

    const { guesses, isGameOver, hasWon, remainingAttempts, submitGuess, resetGame } = useGenericGameState(3, exactMatchGrader);
    const { stats, getWinRate, updateStats } = useStats();
    const { miles, addMiles } = useMiles();
    const [statsView, setStatsView] = useState<'postgame' | 'overview' | null>(null);

    // Dynamic selection state
    const [selection, setSelection] = useState<GenericAnswer>({});

    const manufacturers = useMemo(() => getManufacturers(), []);
    const airlines = useMemo(() => getAirlines(), []);

    // Initialize selection when question changes
    useEffect(() => {
        const initial: GenericAnswer = {};
        Object.keys(question.answer).forEach(key => {
            if (key === 'manufacturer') initial[key] = manufacturers[0];
            else if (key === 'type') initial[key] = getTypes(initial['manufacturer'] || manufacturers[0])[0];
            else if (key === 'airline') initial[key] = airlines[0];
        });
        setSelection(initial);
    }, [qIndex, question.answer, manufacturers, airlines]);

    const handleFieldChange = (key: string, value: string) => {
        setSelection(prev => {
            const next = { ...prev, [key]: value };
            // Handle dependent fields (manufacturer -> type)
            if (key === 'manufacturer') {
                next['type'] = getTypes(value)[0] || '';
            }
            return next;
        });
    };

    const fields: FieldConfig[] = useMemo(() => {
        return Object.keys(question.answer).map(key => {
            if (key === 'manufacturer') return { key, label: 'Manufacturer', options: manufacturers };
            if (key === 'type') return { key, label: 'Aircraft Type', options: getTypes(selection['manufacturer'] || manufacturers[0]) };
            if (key === 'airline') return { key, label: 'Airline', options: airlines };
            return { key, label: key, options: [] };
        });
    }, [question.answer, selection, manufacturers, airlines]);

    const handleGuess = () => {
        submitGuess(selection, question.answer);
    };

    const statsUpdatedRef = useRef(false);
    useEffect(() => {
        if (isGameOver && !statsUpdatedRef.current) {
            statsUpdatedRef.current = true;
            updateStats(hasWon, 'trivia');
            if (hasWon) addMiles(250);
            setStatsView('postgame');
        }
    }, [isGameOver, hasWon, updateStats, addMiles]);

    const handleNext = () => {
        resetGame();
        statsUpdatedRef.current = false;
        setStatsView(null);

        // Pick a new random index different from the current one
        setQIndex((prev) => {
            if (TRIVIA_QUESTIONS.length <= 1) return prev;
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
            } while (nextIndex === prev);
            return nextIndex;
        });
    };

    return (
        <>
            <StatsModal
                stats={stats['trivia'] || { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 }}
                allStats={stats}
                winRate={getWinRate('trivia')}
                getWinRate={getWinRate}
                hasWon={hasWon}
                isOpen={statsView !== null}
                variant={statsView === 'overview' ? 'overview' : 'postgame'}
                guessCount={guesses.length}
                maxAttempts={3}
                answer={question.answer}
                miles={miles}
                milesEarned={hasWon ? 250 : 0}
                onNext={handleNext}
                onClose={() => setStatsView(null)}
                nextLabel="Next Question"
                gameMode="trivia"
            />
            <GameShell>
                <GameNavbar
                    miles={miles}
                    modeLabel="🧠 Trivia Mode"
                    onStatsClick={() => setStatsView('overview')}
                />

                <GameTextCard text={question.fact} isBuffering={false} />

                <div className="p-4 sm:p-8 pb-28 sm:pb-8">
                    <GameForm
                        fields={fields}
                        selected={selection}
                        onFieldChange={handleFieldChange}
                        isBuffering={false}
                        isGameOver={isGameOver}
                        remainingAttempts={remainingAttempts}
                        onGuess={handleGuess}
                        extraActions={isGameOver ? (
                            <button
                                onClick={handleNext}
                                className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide active:scale-95 transition-all shadow-lg ${hasWon
                                    ? 'bg-brand-base hover:opacity-90 text-white'
                                    : 'bg-bg-inverse hover:opacity-90 text-white'
                                    }`}
                            >
                                Next Question ✈️
                            </button>
                        ) : null}
                    />

                    <GameHistory guesses={guesses} fields={fields} />
                </div>
            </GameShell>
        </>
    );
}
