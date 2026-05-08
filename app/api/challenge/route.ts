import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ── In-memory rate limiter (per-IP sliding window) ─────────
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;  // 30 requests per window

const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const hits = ipHits.get(ip) || [];

    // Remove timestamps outside the window
    const recent = hits.filter(t => now - t < WINDOW_MS);

    if (recent.length >= MAX_REQUESTS) {
        ipHits.set(ip, recent);
        return true;
    }

    recent.push(now);
    ipHits.set(ip, recent);
    return false;
}

// ── Periodic cleanup of the IP map to prevent memory leaks ──
setInterval(() => {
    const now = Date.now();
    for (const [ip, hits] of ipHits.entries()) {
        const recent = hits.filter(t => now - t < WINDOW_MS);
        if (recent.length === 0) {
            ipHits.delete(ip);
        } else {
            ipHits.set(ip, recent);
        }
    }
}, WINDOW_MS);

// ── Token TTL ──────────────────────────────────────────────
const TOKEN_TTL_MS = 60_000; // 60 seconds

export async function GET(req: NextRequest) {
    try {
        // 1. Extract client IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        // 2. Rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Try again later.' },
                { status: 429 }
            );
        }

        // 3. Validate userId
        const userId = req.nextUrl.searchParams.get('userId');
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. Generate token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

        await prisma.challengeToken.create({
            data: { token, userId, expiresAt },
        });

        // 5. Opportunistic cleanup: delete expired tokens (cap to avoid slow queries)
        await prisma.challengeToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });

        return NextResponse.json({ token });

    } catch (err) {
        console.error('[API /challenge] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
