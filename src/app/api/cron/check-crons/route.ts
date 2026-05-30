import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { dispatchUserAlerts, AlertPayload } from '@/lib/alerts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    // 1. Secure the cron endpoint
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      console.warn('Unauthorized attempt to trigger cron check misses.');
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Fetch all active cron jobs
    const activeCrons = await prisma.cronJob.findMany({
      where: { isActive: true },
    });

    if (activeCrons.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, message: 'No active background crons found.' });
    }

    let missedCount = 0;
    const now = new Date();

    for (const cron of activeCrons) {
      let isMissed = false;

      // Try Upstash Redis TTL check first
      if (process.env.UPSTASH_REDIS_REST_URL) {
        try {
          const key = await redis.get(`cron:${cron.id}`);
          if (!key && cron.status === 'HEALTHY') {
            isMissed = true;
          }
        } catch (redisErr) {
          console.error(`Redis query failed for cron ${cron.name}, falling back to DB check:`, redisErr);
          isMissed = checkMissViaDatabase(cron, now);
        }
      } else {
        // Local fallback check using database timestamp comparison
        isMissed = checkMissViaDatabase(cron, now);
      }

      if (isMissed) {
        missedCount++;
        // Update cron job status to MISSED
        await prisma.cronJob.update({
          where: { id: cron.id },
          data: { status: 'MISSED' },
        });

        // Trigger incident log & alert dispatch
        await createCronIncidentAndAlert(cron);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: activeCrons.length,
      missedCount,
      message: `Successfully processed ${activeCrons.length} active cron heartbeats. Detected ${missedCount} missed runs.`
    });
  } catch (error) {
    console.error('CRON check-crons failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Database-driven miss calculation helper (Fallback)
function checkMissViaDatabase(cron: any, now: Date): boolean {
  if (cron.status !== 'HEALTHY' || !cron.lastPingAt) {
    return false;
  }
  const lastPing = new Date(cron.lastPingAt);
  const thresholdMs = (cron.expectedInterval + cron.gracePeriod) * 60 * 1000;
  return now.getTime() - lastPing.getTime() > thresholdMs;
}

// Create incident log and dispatch notifications
async function createCronIncidentAndAlert(cron: any) {
  try {
    const title = `CRON MISSED: ${cron.name} failed to report!`;
    const description = `No heartbeat ping was received from background job "${cron.name}" within the expected window of ${cron.expectedInterval} minutes plus the ${cron.gracePeriod} minutes grace buffer.`;

    // 1. Double check outstanding open incident to avoid duplicate logs
    const existingOpenIncident = await prisma.incident.findFirst({
      where: {
        cronJobId: cron.id,
        status: 'OPEN',
      },
    });

    if (existingOpenIncident) return;

    // 2. Save Incident log in PostgreSQL
    await prisma.incident.create({
      data: {
        userId: cron.userId,
        cronJobId: cron.id,
        type: 'CRON_MISSED',
        title,
        description,
        status: 'OPEN',
        startedAt: new Date(),
      },
    });

    // 3. Dispatch alert payload
    const alert: AlertPayload = {
      type: 'CRON_MISSED',
      title: `🔴 ALERT: ${title}`,
      description,
      fields: [
        { name: 'Cron Heartbeat', value: cron.name },
        { name: 'Expected Run Interval', value: `${cron.expectedInterval} mins` },
        { name: 'Grace Period Allotted', value: `+${cron.gracePeriod} mins` },
        { name: 'Last Successful Ping', value: cron.lastPingAt ? new Date(cron.lastPingAt).toUTCString() : 'NEVER PINGED' }
      ],
    };

    await dispatchUserAlerts(cron.userId, alert);
  } catch (err) {
    console.error(`Failed to register incident or alert for cron ${cron.name}:`, err);
  }
}
