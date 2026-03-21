import { useState, useEffect, useRef, useCallback } from 'react';
import { QuizCard, QueueStatus } from '../types/quiz';
import { getRandomPlane, aircraft } from '@/data/aircraft';

const QUEUE_TARGET_LENGTH = 5;

// This forces the browser to download and cache the image in the background.
const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
};

export function useQuestionQueue() {
    const [queue, setQueue] = useState<QuizCard[]>([]);
    const [status, setStatus] = useState<QueueStatus>('initializing');
    const hasInitialized = useRef(false);

    // 1. The Helper: Fetches a single card with a built-in retry loop
    const fetchWithRetry = async (maxRetries = 3): Promise<QuizCard | null> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const airplane: aircraft = getRandomPlane();
                const params = new URLSearchParams(airplane);

                const res = await fetch(`/api/plane-images?${params}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                const newCard: QuizCard = {
                    image: { src: data.imageUrl },
                    answer: airplane
                }

                if (newCard.image?.src) {
                    await preloadImage(newCard.image.src);
                }

                return newCard;
            } catch (error) {
                if (attempt === maxRetries) {
                    return null;
                }

                const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return null;
    };

    // 2. The Refill: Fetches one card and appends it to the queue
    const enqueueCard = useCallback(async () => {
        const newCard = await fetchWithRetry(3); // Try up to 3 times

        setQueue(prevQueue => {
            if (newCard) {
                const updatedQueue = [...prevQueue, newCard];
                // Wake up the UI if it was buffering
                if (updatedQueue.length > 0) {
                    setStatus(prevStatus => prevStatus === 'buffering' ? 'ready' : prevStatus);
                }
                return updatedQueue;
            } else {
                // THE APP GIVES UP HAHA:
                // If we failed to get a card AND the queue is empty, trigger the error state
                if (prevQueue.length === 0) {
                    setStatus('error');
                }
                return prevQueue; // Queue stays exactly as it was
            }
        });
    }, []);

    // 3. The Cold Start: Fires exactly once on mount
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        setStatus('initializing');

        // Instead of waiting for all 5 to finish (which blocks the fast ones),
        // we fire 5 independent workers. As soon as ONE finishes its image download, 
        // the game starts!
        for (let i = 0; i < QUEUE_TARGET_LENGTH; i++) {
            fetchWithRetry(3).then(newCard => {
                if (newCard) {
                    setQueue(prevQueue => {
                        const updatedQueue = [...prevQueue, newCard];
                        // If this is the very first card to arrive, wake up the UI immediately!
                        if (updatedQueue.length === 1) {
                            setStatus('ready');
                        }
                        return updatedQueue;
                    });
                }
            });
        }
    }, []);

    // 4. The Action
    const nextQuestion = useCallback(() => {
        setQueue(prevQueue => {
            const newQueue = prevQueue.slice(1);
            if (newQueue.length === 0) setStatus('buffering');
            return newQueue;
        });
        enqueueCard();
    }, [enqueueCard]);

    // Expose only what the UI needs
    return {
        currentCard: queue[0] || null,
        status,
        nextQuestion,
        cardsRemaining: queue.length // Helpful for debugging!
    };
}