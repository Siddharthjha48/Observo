import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkMonitor } from '@/lib/monitor-checker';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    // Secure the cron endpoint
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      console.warn('Unauthorized attempt to trigger monitors check cron.');
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch all active monitors that need checking
    const activeMonitors = await prisma.monitor.findMany({
      where: { isActive: true },
    });

    if (activeMonitors.length === 0) {
      return NextResponse.json({ ok: true, checked: 0, message: 'No active monitors found to check.' });
    }

    // Ping active monitors concurrently
    const checkTasks = activeMonitors.map((monitor: any) => checkMonitor(monitor as any));
    await Promise.all(checkTasks);

    return NextResponse.json({
      ok: true,
      checked: activeMonitors.length,
      message: `Successfully checked ${activeMonitors.length} active monitors.`
    });
  } catch (error) {
    console.error('CRON check-monitors failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
