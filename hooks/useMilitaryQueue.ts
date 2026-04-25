import { useState, useEffect, useRef, useCallback } from 'react';
import { QueueStatus } from '../types/quiz';
import { MilitaryAircraft, getRandomMilitaryPlane, getMilitaryByIndex, decodeMilitaryChallenge } from '@/data/military';

const QUEUE_TARGET_LENGTH = 5;

type MilitaryCard = {
    image: { src: string };
    imageIndex: number;
    answer: MilitaryAircraft;
};

const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
};

export function useMilitaryQueue() {
    const [queue, setQueue] = useState<MilitaryCard[]>([]);
    const [status, setStatus] = useState<QueueStatus>('initializing');
    const hasInitialized = useRef(false);
    const challengeSeedRef = useRef<{ aircraftIndex: number; imageIndex: number } | null>(null);

    const fetchWithRetry = async (
        maxRetries = 3,
        challengeSeed?: { aircraftIndex: number; imageIndex: number } | null
    ): Promise<MilitaryCard | null> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                let aircraft: MilitaryAircraft;
                let forcedImageIndex: number | undefined;

                if (challengeSeed) {
                    const plane = getMilitaryByIndex(challengeSeed.aircraftIndex);
                    if (!plane) throw new Error('Invalid challenge seed index');
                    aircraft = plane;
                    forcedImageIndex = challengeSeed.imageIndex;
                } else {
                    aircraft = getRandomMilitaryPlane();
                }

                const params = new URLSearchParams({
                    manufacturer: aircraft.manufacturer,
                    type: aircraft.type,
                });
                if (forcedImageIndex !== undefined) {
                    params.set('imageIndex', String(forcedImageIndex));
                }

                const res = await fetch(`/api/military-images?${params}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                const newCard: MilitaryCard = {
                    image: { src: data.imageUrl },
                    imageIndex: data.imageIndex ?? 0,
                    answer: aircraft,
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

    const enqueueCard = useCallback(async () => {
        const newCard = await fetchWithRetry(3);

        setQueue(prevQueue => {
            if (newCard) {
                const updatedQueue = [...prevQueue, newCard];
                setStatus(prevStatus => prevStatus === 'buffering' ? 'ready' : prevStatus);
                return updatedQueue;
            } else {
                if (prevQueue.length === 0) setStatus('error');
                return prevQueue;
            }
        });
    }, []);

    // Cold start: check for challenge seed in URL, then fill queue
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        setStatus('initializing');

        // Check for a challenge seed in the URL (client-side only)
        let challengeSeed: typeof challengeSeedRef.current = null;
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get('c');
            if (encoded) {
                challengeSeed = decodeMilitaryChallenge(encoded);
                challengeSeedRef.current = challengeSeed;
            }
        }

        // Load first card: from challenge seed if present, otherwise random
        const firstFetch = challengeSeed
            ? fetchWithRetry(3, challengeSeed)
            : fetchWithRetry(3);

        firstFetch.then(firstCard => {
            if (firstCard) {
                setQueue([firstCard]);
                setStatus('ready');
            } else {
                setStatus('error');
            }
        });

        // Pre-fill remaining queue slots randomly (regardless of challenge)
        for (let i = 1; i < QUEUE_TARGET_LENGTH; i++) {
            fetchWithRetry(3).then(card => {
                if (card) {
                    setQueue(prev => [...prev, card]);
                }
            });
        }
    }, []);

    const nextQuestion = useCallback(() => {
        setQueue(prevQueue => {
            const newQueue = prevQueue.slice(1);
            if (newQueue.length === 0) setStatus('buffering');
            return newQueue;
        });
        enqueueCard();
    }, [enqueueCard]);

    return {
        currentCard: queue[0] || null,
        status,
        nextQuestion,
        cardsRemaining: queue.length,
    };
}
