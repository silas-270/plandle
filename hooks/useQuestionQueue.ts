import { useState, useEffect, useRef, useCallback } from 'react';
import { QuizCard, QueueStatus } from '../types/quiz';
import { getRandomPlane, getPlaneBySeed, getPlaneByIndices, decodeChallenge, aircraft } from '@/data/aircraft';

const QUEUE_TARGET_LENGTH = 5;

const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
};

export function useQuestionQueue(mode: 'daily' | 'practice' = 'practice') {
    const [queue, setQueue] = useState<QuizCard[]>([]);
    const [status, setStatus] = useState<QueueStatus>('initializing');
    const hasInitialized = useRef(false);
    const modeRef = useRef(mode);
    // Challenge seed parsed from URL on mount (practice mode only)
    const challengeSeedRef = useRef<{ aircraftIndex: number; airlineIndex: number; imageIndex: number } | null>(null);

    useEffect(() => {
        if (modeRef.current !== mode) {
            modeRef.current = mode;
            setQueue([]);
            hasInitialized.current = false;
        }
    }, [mode]);

    // 1. The Helper: Fetches a single card with a built-in retry loop
    const fetchWithRetry = async (
        maxRetries = 3,
        isDaily = false,
        challengeSeed?: { aircraftIndex: number; airlineIndex: number; imageIndex: number } | null
    ): Promise<QuizCard | null> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                let airplane: aircraft;
                let imageIndex: number | undefined;

                if (challengeSeed) {
                    // Challenge mode: load exact aircraft from seed
                    const plane = getPlaneByIndices(challengeSeed.aircraftIndex, challengeSeed.airlineIndex);
                    if (!plane) throw new Error('Invalid challenge seed indices');
                    airplane = plane;
                    imageIndex = challengeSeed.imageIndex;
                } else if (isDaily) {
                    const today = new Date().toISOString().split('T')[0];
                    airplane = getPlaneBySeed(today);
                } else {
                    airplane = getRandomPlane();
                }

                const params = new URLSearchParams(airplane as any);
                if (imageIndex !== undefined) {
                    params.set('imageIndex', String(imageIndex));
                }

                const res = await fetch(`/api/plane-images?${params}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                const newCard: QuizCard = {
                    image: { src: data.imageUrl },
                    imageIndex: data.imageIndex ?? 0,
                    answer: airplane,
                };

                if (newCard.image?.src) {
                    await preloadImage(newCard.image.src);
                }

                return newCard;
            } catch (error) {
                if (attempt === maxRetries) return null;
                const delay = 1000 * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return null;
    };

    // 2. The Refill: Fetches one card and appends it to the queue (only for practice)
    const enqueueCard = useCallback(async () => {
        if (modeRef.current === 'daily') return;

        const newCard = await fetchWithRetry(3, false);

        setQueue(prevQueue => {
            if (newCard) {
                const updatedQueue = [...prevQueue, newCard];
                if (updatedQueue.length > 0) {
                    setStatus(prevStatus => prevStatus === 'buffering' ? 'ready' : prevStatus);
                }
                return updatedQueue;
            } else {
                if (prevQueue.length === 0) setStatus('error');
                return prevQueue;
            }
        });
    }, []);

    // 3. The Cold Start: Fires on mount or mode change
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        setStatus('initializing');

        if (mode === 'daily') {
            fetchWithRetry(3, true).then(newCard => {
                if (newCard) {
                    setQueue([newCard]);
                    setStatus('ready');
                } else {
                    setStatus('error');
                }
            });
        } else {
            // Check for a challenge seed in the URL (client-side only)
            let challengeSeed: typeof challengeSeedRef.current = null;
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const encoded = params.get('c');
                if (encoded) {
                    challengeSeed = decodeChallenge(encoded);
                    challengeSeedRef.current = challengeSeed;
                }
            }

            // If a challenge seed exists, load that first, then fill the rest randomly
            const firstFetch = challengeSeed
                ? fetchWithRetry(3, false, challengeSeed)
                : fetchWithRetry(3, false);

            firstFetch.then(firstCard => {
                if (firstCard) {
                    setQueue([firstCard]);
                    setStatus('ready');
                } else {
                    setStatus('error');
                }
            });

            // Fill the rest of the queue randomly (regardless of challenge)
            for (let i = 1; i < QUEUE_TARGET_LENGTH; i++) {
                fetchWithRetry(3, false).then(newCard => {
                    if (newCard) {
                        setQueue(prevQueue => [...prevQueue, newCard]);
                    }
                });
            }
        }
    }, [mode]);

    // 4. The Action
    const nextQuestion = useCallback(() => {
        if (mode === 'daily') return;

        setQueue(prevQueue => {
            const newQueue = prevQueue.slice(1);
            if (newQueue.length === 0) setStatus('buffering');
            return newQueue;
        });
        enqueueCard();
    }, [mode, enqueueCard]);

    return {
        currentCard: queue[0] || null,
        status,
        nextQuestion,
        cardsRemaining: queue.length,
    };
}