import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cronJobs = await prisma.cronJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cronJobs });
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, expectedInterval, gracePeriod = 10 } = body;

    if (!name || expectedInterval === undefined) {
      return NextResponse.json({ error: 'Name and expectedInterval are required' }, { status: 400 });
    }

    // Plan-based limitations enforcement
    const currentCronCount = await prisma.cronJob.count({
      where: { userId: user.id },
    });

    if (user.plan === 'FREE' && currentCronCount >= 2) {
      return NextResponse.json({
        error: 'Free plan is limited to 2 background heartbeat cron jobs. Upgrade to Pro for unlimited crons!'
      }, { status: 403 });
    }

    const cronJob = await prisma.cronJob.create({
      data: {
        userId: user.id,
        name,
        expectedInterval: Number(expectedInterval),
        gracePeriod: Number(gracePeriod),
        status: 'WAITING',
      },
    });

    // Set a Redis placeholder key with standard TTL to boot the heartbeat state in Redis
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const ttlSeconds = (cronJob.expectedInterval + cronJob.gracePeriod) * 60;
        await redis.set(`cron:${cronJob.id}`, '1', { ex: ttlSeconds });
      } catch (redisErr) {
        console.error('Failed to set initial Redis state for cron job:', redisErr);
      }
    }

    return NextResponse.json({ cronJob }, { status: 201 });
  } catch (error) {
    console.error('Failed to create cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
