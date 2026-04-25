import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { id, name, miles } = await req.json();

        if (!id || typeof id !== 'string' || !name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Upsert: create if not exists, update name and miles if exists
        const user = await prisma.user.upsert({
            where: { id },
            update: { name, miles: Number(miles) || 0 },
            create: { id, name, miles: Number(miles) || 0 },
        });

        return NextResponse.json({ ok: true, user });
    } catch (err) {
        console.error('[API /user/sync] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
