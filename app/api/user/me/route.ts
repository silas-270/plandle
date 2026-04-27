import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get('id');

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
        }

        const fallbackName = req.nextUrl.searchParams.get('fallbackName') || 'Passenger';
        
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                name: fallbackName,
            },
            include: {
                stats: true,
                dailyLogs: true,
            },
        });

        // Transform dailyLogs from array into the { "YYYY-MM-DD": "solved" } map the client expects
        const dailyLog: Record<string, string> = {};
        for (const log of user.dailyLogs) {
            const dateStr = log.date.toISOString().split('T')[0];
            dailyLog[dateStr] = log.status;
        }

        // Transform stats from array into the { mode: stats } map the client expects
        const stats: Record<string, {
            played: number;
            wins: number;
            currentStreak: number;
            maxStreak: number;
            recentResults: boolean[];
        }> = {};
        for (const stat of user.stats) {
            stats[stat.mode] = {
                played: stat.played,
                wins: stat.wins,
                currentStreak: stat.currentStreak,
                maxStreak: stat.maxStreak,
                recentResults: stat.recentResults,
            };
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                miles: user.miles,
                difficulty: user.difficulty,
            },
            stats,
            dailyLog,
        });
    } catch (error) {
        console.error('[API /user/me] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
