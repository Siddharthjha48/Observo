import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { dispatchUserAlerts } from '@/lib/alerts';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Locate the CronJob by its unique slug
    const cronJob = await prisma.cronJob.findUnique({
      where: { slug },
    });

    if (!cronJob) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    if (!cronJob.isActive) {
      return NextResponse.json({ error: 'This cron job is currently paused/inactive' }, { status: 400 });
    }

    const previousStatus = cronJob.status;
    const now = new Date();

    // 2. Log the ping in database
    await prisma.cronPing.create({
      data: {
        cronJobId: cronJob.id,
        pingAt: now,
      },
    });

    // 3. Resolve missed incident if recovery
    if (previousStatus === 'MISSED') {
      const openIncident = await prisma.incident.findFirst({
        where: {
          cronJobId: cronJob.id,
          status: 'OPEN',
        },
        orderBy: { startedAt: 'desc' },
      });

      if (openIncident) {
        const duration = Math.round((now.getTime() - openIncident.startedAt.getTime()) / 1000);

        await prisma.incident.update({
          where: { id: openIncident.id },
          data: {
            status: 'RESOLVED',
            resolvedAt: now,
            duration,
          },
        });

        // Fire recovery alert
        const alert = {
          type: 'RESOLVED',
          title: `💚 RECOVERY: Cron Job "${cronJob.name}" is healthy`,
          description: `Received a heartbeat ping! Heartbeat recovered after being missed for ${Math.round(duration / 60)} minutes.`,
          fields: [
            { name: 'Cron Job', value: cronJob.name },
            { name: 'Current Status', value: 'HEALTHY' },
            { name: 'Recovery Ping Time', value: now.toUTCString() },
            { name: 'Outage Duration', value: `${Math.round(duration / 60)} min` }
          ],
        };

        await dispatchUserAlerts(cronJob.userId, alert as any);
      }
    }

    // 4. Update the CronJob record in DB
    const updatedCronJob = await prisma.cronJob.update({
      where: { id: cronJob.id },
      data: {
        lastPingAt: now,
        status: 'HEALTHY',
      },
    });

    // 5. Reset Redis TTL expiration key
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const ttlSeconds = (updatedCronJob.expectedInterval + updatedCronJob.gracePeriod) * 60;
        await redis.set(`cron:${cronJob.id}`, '1', { ex: ttlSeconds });
      } catch (redisErr) {
        console.error('Failed to reset Redis TTL inside POST ping:', redisErr);
      }
    }

    return NextResponse.json({ ok: true, message: 'Ping recorded successfully', status: 'HEALTHY' });
  } catch (error) {
    console.error('Heartbeat ping ingestion failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
