import { useState, useCallback } from 'react';
import { QuizCard, Guess, AttributeResult } from '../types/quiz';

export function useGameState() {
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const submitGuess = useCallback((selection: QuizCard['answer'], actual: QuizCard['answer']) => {
        if (isGameOver || guesses.length >= 5) return;

        // 1. Grade the guess
        const results = {
            manufacturer: (selection.manufacturer === actual.manufacturer ? 'correct' : 'incorrect') as AttributeResult,
            type: (selection.type === actual.type ? 'correct' : 'incorrect') as AttributeResult,
            airline: (selection.airline === actual.airline ? 'correct' : 'incorrect') as AttributeResult,
        };

        const newGuess: Guess = { ...selection, results };
        const newGuesses = [...guesses, newGuess];
        
        setGuesses(prev => [newGuess, ...prev]);

        // 2. Check Win Condition
        const won = Object.values(results).every(res => res === 'correct');
        
        if (won) {
            setHasWon(true);
            setIsGameOver(true);
        } else if (newGuesses.length >= 5) {
            // 3. Check Loss Condition
            setIsGameOver(true);
        }
    }, [isGameOver, guesses.length]);

    const resetGame = useCallback(() => {
        setGuesses([]);
        setIsGameOver(false);
        setHasWon(false);
    }, []);

    return {
        guesses,
        isGameOver,
        hasWon,
        submitGuess,
        resetGame,
        remainingAttempts: 5 - guesses.length
    };
}