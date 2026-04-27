import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, miles, difficulty, stats, dailyLog } = body;

        if (!user || typeof user.id !== 'string') {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        // Build all operations upfront so we can validate before touching the DB
        type StatEntry = { played?: number; wins?: number; currentStreak?: number; maxStreak?: number; recentResults?: boolean[] };
        const statEntries: Array<{ mode: string; data: StatEntry }> = [];
        if (stats && typeof stats === 'object') {
            for (const [mode, statData] of Object.entries(stats)) {
                if (typeof statData !== 'object' || statData === null) continue;
                statEntries.push({ mode, data: statData as StatEntry });
            }
        }

        type DailyEntry = { date: Date; status: string };
        const dailyEntries: DailyEntry[] = [];
        if (dailyLog && typeof dailyLog === 'object') {
            for (const [dateStr, status] of Object.entries(dailyLog)) {
                if (typeof status !== 'string') continue;
                // Parse YYYY-MM-DD using Date.UTC to avoid timezone off-by-one-day errors
                const parts = dateStr.split('-').map(Number);
                if (parts.length !== 3 || parts.some(isNaN)) continue;
                const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
                dailyEntries.push({ date, status });
            }
        }

        // Run everything inside a single transaction — all-or-nothing
        await prisma.$transaction(async (tx) => {
            await tx.user.upsert({
                where: { id: user.id },
                update: {
                    name: user.name || 'Passenger',
                    miles: typeof miles === 'number' ? miles : 0,
                    difficulty: typeof difficulty === 'string' ? difficulty : 'Business',
                },
                create: {
                    id: user.id,
                    name: user.name || 'Passenger',
                    miles: typeof miles === 'number' ? miles : 0,
                    difficulty: typeof difficulty === 'string' ? difficulty : 'Business',
                },
            });

            for (const { mode, data } of statEntries) {
                await tx.gameStat.upsert({
                    where: { userId_mode: { userId: user.id, mode } },
                    update: {
                        played: Number(data.played) || 0,
                        wins: Number(data.wins) || 0,
                        currentStreak: Number(data.currentStreak) || 0,
                        maxStreak: Number(data.maxStreak) || 0,
                        recentResults: Array.isArray(data.recentResults)
                            ? data.recentResults.map(String).map((s: string) => s === 'true')
                            : [],
                    },
                    create: {
                        userId: user.id,
                        mode,
                        played: Number(data.played) || 0,
                        wins: Number(data.wins) || 0,
                        currentStreak: Number(data.currentStreak) || 0,
                        maxStreak: Number(data.maxStreak) || 0,
                        recentResults: Array.isArray(data.recentResults)
                            ? data.recentResults.map(String).map((s: string) => s === 'true')
                            : [],
                    },
                });
            }

            for (const { date, status } of dailyEntries) {
                await tx.dailyLog.upsert({
                    where: { userId_date: { userId: user.id, date } },
                    update: { status },
                    create: { userId: user.id, date, status },
                });
            }
        });

        // Fetch the verified state after the transaction has committed
        const verifiedUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { stats: true },
        });

        return NextResponse.json({ success: true, verifiedUser });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
    }
}
