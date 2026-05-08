import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SyncType = 'miles' | 'stats' | 'daily' | 'difficulty' | 'name';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, type, token } = body as { id: string; type: SyncType; token?: string };

        if (!id || typeof id !== 'string' || !type) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // ── Challenge token validation ─────────────────────────
        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Missing challenge token' }, { status: 403 });
        }

        const challenge = await prisma.challengeToken.findUnique({
            where: { token },
        });

        if (!challenge) {
            return NextResponse.json({ error: 'Invalid challenge token' }, { status: 403 });
        }

        if (challenge.userId !== id) {
            // Token was issued for a different user
            await prisma.challengeToken.delete({ where: { token } });
            return NextResponse.json({ error: 'Token mismatch' }, { status: 403 });
        }

        if (challenge.expiresAt < new Date()) {
            // Token has expired
            await prisma.challengeToken.delete({ where: { token } });
            return NextResponse.json({ error: 'Challenge token expired' }, { status: 403 });
        }

        // Consume the token (one-time use)
        await prisma.challengeToken.delete({ where: { token } });

        // ── Existing logic continues ───────────────────────────

        // Ensure user exists
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        switch (type) {
            case 'miles': {
                const { miles } = body as { miles: number };
                await prisma.user.update({
                    where: { id },
                    data: { miles: typeof miles === 'number' ? miles : 0 },
                });
                return NextResponse.json({ ok: true });
            }

            case 'stats': {
                const { mode, played, wins, currentStreak, maxStreak, recentResults } = body;
                if (!mode || typeof mode !== 'string') {
                    return NextResponse.json({ error: 'Missing mode' }, { status: 400 });
                }
                await prisma.gameStat.upsert({
                    where: { userId_mode: { userId: id, mode } },
                    update: {
                        played: Number(played) || 0,
                        wins: Number(wins) || 0,
                        currentStreak: Number(currentStreak) || 0,
                        maxStreak: Number(maxStreak) || 0,
                        recentResults: Array.isArray(recentResults) ? recentResults : [],
                    },
                    create: {
                        userId: id,
                        mode,
                        played: Number(played) || 0,
                        wins: Number(wins) || 0,
                        currentStreak: Number(currentStreak) || 0,
                        maxStreak: Number(maxStreak) || 0,
                        recentResults: Array.isArray(recentResults) ? recentResults : [],
                    },
                });
                return NextResponse.json({ ok: true });
            }

            case 'daily': {
                const { date, status } = body as { date: string; status: string };
                if (!date || !status) {
                    return NextResponse.json({ error: 'Missing date/status' }, { status: 400 });
                }
                const parts = date.split('-').map(Number);
                if (parts.length !== 3 || parts.some(isNaN)) {
                    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
                }
                const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
                await prisma.dailyLog.upsert({
                    where: { userId_date: { userId: id, date: dateObj } },
                    update: { status },
                    create: { userId: id, date: dateObj, status },
                });
                return NextResponse.json({ ok: true });
            }

            case 'difficulty': {
                const { difficulty } = body as { difficulty: string };
                if (!difficulty || typeof difficulty !== 'string') {
                    return NextResponse.json({ error: 'Missing difficulty' }, { status: 400 });
                }
                await prisma.user.update({
                    where: { id },
                    data: { difficulty },
                });
                return NextResponse.json({ ok: true });
            }

            case 'name': {
                const { name } = body as { name: string };
                if (!name || typeof name !== 'string') {
                    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
                }
                await prisma.user.update({
                    where: { id },
                    data: { name },
                });
                return NextResponse.json({ ok: true });
            }

            default:
                return NextResponse.json({ error: `Unknown sync type: ${type}` }, { status: 400 });
        }
    } catch (err) {
        console.error('[API /user/sync] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
