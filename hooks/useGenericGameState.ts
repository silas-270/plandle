import { useState, useCallback } from 'react';
import { GenericAnswer, GenericGuess, AttributeResult } from '@/types/genericGame';

export type Grader = (selection: GenericAnswer, actual: GenericAnswer) => Record<string, AttributeResult>;

/** Default grader: exact match on every key, no partials */
export const exactMatchGrader: Grader = (selection, actual) =>
    Object.fromEntries(
        Object.keys(actual).map(key => [key, selection[key] === actual[key] ? 'correct' : 'incorrect'])
    );

/**
 * A game state hook that works with any answer shape.
 * Pass a custom `grader` to implement partial-match logic (e.g. aircraft type hints).
 */
export function useGenericGameState(maxAttempts: number, grader: Grader = exactMatchGrader) {
    const [guesses, setGuesses] = useState<GenericGuess[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);

    const submitGuess = useCallback((selection: GenericAnswer, actual: GenericAnswer) => {
        if (isGameOver || guesses.length >= maxAttempts) return;

        const results = grader(selection, actual);
        const newGuess: GenericGuess = { selection, results };
        const newGuesses = [...guesses, newGuess];

        setGuesses(prev => [newGuess, ...prev]);

        const won = Object.values(results).every(r => r === 'correct');
        if (won) {
            setHasWon(true);
            setIsGameOver(true);
        } else if (newGuesses.length >= maxAttempts) {
            setIsGameOver(true);
        }
    }, [isGameOver, maxAttempts, guesses, grader]);

    /** Trigger the postgame screen without counting as a win or loss. */
    const skipGame = useCallback(() => {
        setIsSkipped(true);
        setIsGameOver(true);
    }, []);

    const resetGame = useCallback(() => {
        setGuesses([]);
        setIsGameOver(false);
        setHasWon(false);
        setIsSkipped(false);
    }, []);

    return { guesses, isGameOver, hasWon, isSkipped, submitGuess, skipGame, resetGame, remainingAttempts: maxAttempts - guesses.length };
}
