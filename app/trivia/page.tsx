'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useGenericGameState, exactMatchGrader } from '@/hooks/useGenericGameState';
import { useStats } from '@/hooks/useStats';
import { useMiles } from '@/hooks/useMiles';
import { TRIVIA_QUESTIONS, getTriviaAirlines } from '@/data/trivia';
import { FieldConfig } from '@/types/genericGame';

import GameShell from '@/components/game/GameShell';
import GameNavbar from '@/components/game/GameNavbar';
import GameTextCard from '@/components/game/GameTextCard';
import GameForm from '@/components/game/GameForm';
import GameHistory from '@/components/game/GameHistory';
import StatsModal from '@/components/stats';

export default function TriviaPage() {
    const [qIndex, setQIndex] = useState(0);
    const question = TRIVIA_QUESTIONS[qIndex];
    
    // Trivia mode allows 3 guesses
    const { guesses, isGameOver, hasWon, remainingAttempts, submitGuess, resetGame } = useGenericGameState(3, exactMatchGrader);
    const { stats, getWinRate, updateStats } = useStats();
    const { miles, addMiles } = useMiles();
    const [statsView, setStatsView] = useState<'postgame' | 'overview' | null>(null);

    const triviaAirlines = getTriviaAirlines();
    const [selectedAirline, setSelectedAirline] = useState(triviaAirlines[0] || '');

    // The form definition: just one select field for "Airline"
    const fields: FieldConfig[] = [
        { key: 'airline', label: 'Airline Guess', options: triviaAirlines },
    ];
    const currentSelection = { airline: selectedAirline };

    const handleGuess = () => {
        submitGuess(currentSelection, question.answer);
    };

    // When the game ends, show stats and award miles if they won.
    const statsUpdatedRef = useRef(false);
    useEffect(() => {
        if (isGameOver && !statsUpdatedRef.current) {
            statsUpdatedRef.current = true;
            updateStats(hasWon, 'trivia');
            if (hasWon) addMiles(100);
            setStatsView('postgame');
        }
    }, [isGameOver, hasWon, updateStats, addMiles]);

    const handleNext = () => {
        resetGame();
        statsUpdatedRef.current = false;
        setStatsView(null);
        setQIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
        setSelectedAirline(getTriviaAirlines()[0] || '');
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
                milesEarned={hasWon ? 100 : 0}
                onNext={handleNext}
                onClose={() => setStatsView(null)}
                nextLabel="Next Question ✈️"
                gameMode="trivia"
            />
            <GameShell>
                <GameNavbar
                    miles={miles}
                    modeLabel="🧠 Trivia Mode (Beta)"
                    onStatsClick={() => setStatsView('overview')}
                />
                
                {/* Swap the Image viewer for a Text viewer */}
                <GameTextCard text={question.fact} isBuffering={false} />
                
                <div className="p-4 sm:p-8 pb-28 sm:pb-8">
                    {/* The same GameForm, but it auto-adapts to 1 column and renders only 'airline' */}
                    <GameForm
                        fields={fields}
                        selected={currentSelection}
                        onFieldChange={(key, value) => setSelectedAirline(value)}
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
                    
                    {/* The same History viewer, but auto-adapts to 1 column */}
                    <GameHistory guesses={guesses} fields={fields} />
                </div>
            </GameShell>
        </>
    );
}
