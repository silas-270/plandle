import { GenericAnswer } from '@/types/genericGame';
import triviaData from './trivia_questions.json';

export type TriviaQuestion = {
    fact: string;
    answer: GenericAnswer;
};

export const TRIVIA_QUESTIONS: TriviaQuestion[] = triviaData;
