export type QuizCard = {
    image: { src: string };
    imageIndex: number;
    answer: {
        manufacturer: string;
        type: string;
        airline: string;
    }
}

export type QueueStatus = 'initializing' | 'ready' | 'buffering' | 'error';


export type AttributeResult = 'correct' | 'incorrect' | 'partial';

export type Guess = {
    manufacturer: string;
    type: string;
    airline: string;
    results: {
        manufacturer: AttributeResult;
        type: AttributeResult;
        airline: AttributeResult;
    };
};