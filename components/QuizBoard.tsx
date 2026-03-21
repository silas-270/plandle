"use client";

import { useState, useEffect } from 'react';
import { useQuestionQueue } from '../hooks/useQuestionQueue';
import { useGameState } from '../hooks/useGameState';
import { getManufacturers, getTypes, getAirlines } from '@/data/aircraft';
import GridTile from './GridTile';

export default function QuizBoard() {
    const { currentCard, status, nextQuestion } = useQuestionQueue();
    const {
        guesses,
        isGameOver,
        hasWon,
        submitGuess,
        resetGame
    } = useGameState();

    // 1. Fetch data FIRST so we can use it for default states
    const manufacturers = getManufacturers();
    const airlines = getAirlines();

    // 2. Initialize with the first item in the array (using || '' as a safe fallback)
    const [selectedManufacturer, setSelectedManufacturer] = useState(manufacturers[0] || '');
    const [selectedAirline, setSelectedAirline] = useState(airlines[0] || '');

    // 3. To default the Type, we need to know what the default Manufacturer was
    const initialTypes = manufacturers[0] ? getTypes(manufacturers[0]) : [];
    const [selectedType, setSelectedType] = useState(initialTypes[0] || '');

    // 4. Keep calculating available types dynamically for the render
    const availableTypes = selectedManufacturer ? getTypes(selectedManufacturer) : [];

    // 5. UX Trick: When manufacturer changes, auto-select the first type of the new manufacturer
    useEffect(() => {
        if (selectedManufacturer) {
            const newTypes = getTypes(selectedManufacturer);
            setSelectedType(newTypes[0] || '');
        }
    }, [selectedManufacturer]);

    const handleGuess = () => {
        if (!currentCard) return;

        // 1. Submit the current selection to the game engine
        submitGuess(
            {
                manufacturer: selectedManufacturer,
                type: selectedType,
                airline: selectedAirline
            },
            currentCard.answer
        );
    };

    const handleNextAircraft = () => {
        // 1. Clear the 5-row grid and game status
        resetGame();

        // 2. Pull the next preloaded image from the queue
        nextQuestion();

        setSelectedManufacturer(manufacturers[0]);
        setSelectedType(initialTypes[0]);
        setSelectedAirline(airlines[0]);
    };

    // --- Loading & Error States ---
    if (status === 'initializing') {
        return <div className="flex h-screen items-center justify-center font-mono animate-pulse">Warming up engines...</div>;
    }

    if (status === 'error' || !currentCard) {
        return <div className="flex h-screen items-center justify-center text-red-500 font-bold text-xl">Flight cancelled (Connection error).</div>;
    }

    // --- Main Game UI ---
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 sm:px-6">

            {/* Main Game Container - Wider now to accommodate horizontal selects */}
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* 1. The Big Image */}
                <div className="w-full h-64 sm:h-96 bg-gray-200 relative">
                    {status === 'buffering' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10 text-blue-600 font-bold animate-pulse">
                            Loading next aircraft...
                        </div>
                    ) : null}

                    {currentCard.image?.src && (
                        <img
                            key={currentCard.image.src}
                            src={currentCard.image.src}
                            alt="Guess the aircraft"
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>

                {/* 2. The Interactive UI Area */}
                <div className="p-6 sm:p-8">

                    {/* Horizontal Select Layout (Stacks on mobile, row on md+ screens) */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">

                        {/* Manufacturer Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Manufacturer</label>
                            <select
                                value={selectedManufacturer}
                                onChange={(e) => setSelectedManufacturer(e.target.value)}
                                disabled={status === 'buffering'}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            >
                                <option value="" disabled>Select Manufacturer</option>
                                {manufacturers.map(mfr => (
                                    <option key={mfr} value={mfr}>{mfr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Aircraft Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                disabled={!selectedManufacturer || status === 'buffering'}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>Select Type</option>
                                {availableTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Airline Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Airline</label>
                            <select
                                value={selectedAirline}
                                onChange={(e) => setSelectedAirline(e.target.value)}
                                disabled={status === 'buffering'}
                                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            >
                                <option value="" disabled>Select Airline</option>
                                {airlines.map(airline => (
                                    <option key={airline} value={airline}>{airline}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* 3. The Guess Button */}
                    <div className="mt-6">
                        {isGameOver ? (
                            <div className="space-y-4">
                                {/* Win/Loss Message */}
                                <div className={`p-4 rounded-lg text-center font-bold ${hasWon ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {hasWon ? "Correct! You're a pro." : `Game Over! It was the ${currentCard.answer.type}`}
                                </div>

                                <button
                                    onClick={handleNextAircraft}
                                    className="w-full py-4 text-lg font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg transition-transform active:scale-95"
                                >
                                    Next Aircraft →
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGuess}
                                disabled={status === 'buffering'}
                                className="w-full py-4 text-lg font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-sm"
                            >
                                {status === 'buffering' ? 'Loading Next...' : 'Make Guess'}
                            </button>
                        )}
                    </div>

                    {/* 3. HISTORY ZONE - Pushes down as you play */}
                    <div className="space-y-2 border-t pt-4 border-gray-100">
                        {guesses.map((guess, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2 h-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                <GridTile text={guess.manufacturer} status={guess.results.manufacturer} />
                                <GridTile text={guess.type} status={guess.results.type} />
                                <GridTile text={guess.airline} status={guess.results.airline} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}