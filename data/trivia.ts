import triviaData from './trivia_questions.json';

export type TriviaQuestion = {
    fact: string;
    answer: { airline: string };
};

export const TRIVIA_QUESTIONS: TriviaQuestion[] = triviaData;

/**
 * Returns a unique, sorted list of all airlines that appear in the trivia database.
 * This ensures the select dropdown always has the correct set of options.
 */
export const getTriviaAirlines = (): string[] => {
    return Array.from(new Set(TRIVIA_QUESTIONS.map(q => q.answer.airline))).sort();
};
