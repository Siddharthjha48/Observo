import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const cronJob = await prisma.cronJob.findUnique({
      where: { id },
      include: {
        pings: {
          take: 50,
          orderBy: { pingAt: 'desc' },
        },
        incidents: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!cronJob || cronJob.userId !== user.id) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    return NextResponse.json({ cronJob });
  } catch (error) {
    console.error('Failed to fetch cron job details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cronJob = await prisma.cronJob.findUnique({
      where: { id },
    });

    if (!cronJob || cronJob.userId !== user.id) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, expectedInterval, gracePeriod, isActive } = body;

    const updatedCronJob = await prisma.cronJob.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        expectedInterval: expectedInterval !== undefined ? Number(expectedInterval) : undefined,
        gracePeriod: gracePeriod !== undefined ? Number(gracePeriod) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    // If changing active states or intervals, update the Redis keys correspondingly
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const key = `cron:${cronJob.id}`;
        if (isActive === false) {
          await redis.del(key);
        } else {
          const ttlSeconds = (updatedCronJob.expectedInterval + updatedCronJob.gracePeriod) * 60;
          await redis.set(key, '1', { ex: ttlSeconds });
        }
      } catch (redisErr) {
        console.error('Failed to synchronize Redis state in PATCH cron job:', redisErr);
      }
    }

    return NextResponse.json({ cronJob: updatedCronJob });
  } catch (error) {
    console.error('Failed to update cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const cronJob = await prisma.cronJob.findUnique({
      where: { id },
    });

    if (!cronJob || cronJob.userId !== user.id) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    // Delete Redis key first
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        await redis.del(`cron:${cronJob.id}`);
      } catch (redisErr) {
        console.error('Failed to clear Redis key for deleted cron job:', redisErr);
      }
    }

    await prisma.cronJob.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Cron job deleted successfully' });
  } catch (error) {
    console.error('Failed to delete cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
