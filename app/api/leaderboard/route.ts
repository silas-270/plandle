import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '5', 10);
        const userId = searchParams.get('userId');

        // 1. Fetch Top N players
        const topPlayers = await prisma.user.findMany({
            take: limit,
            orderBy: {
                miles: 'desc',
            },
            select: {
                id: true,
                name: true,
                miles: true,
            },
        });

        let ownRank = null;

        // 2. If userId provided, calculate own rank
        if (userId) {
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { miles: true, name: true },
            });

            if (currentUser) {
                // Count how many users have more miles than me
                const countHigher = await prisma.user.count({
                    where: {
                        miles: {
                            gt: currentUser.miles,
                        },
                    },
                });

                ownRank = {
                    position: countHigher + 1,
                    miles: currentUser.miles,
                    name: currentUser.name,
                };
            }
        }

        return NextResponse.json({
            topPlayers,
            ownRank,
        });

    } catch (err) {
        console.error('[API /leaderboard] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
