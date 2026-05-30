import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Load all components in parallel for the user
  const [monitors, cronJobs, incidents] = await Promise.all([
    prisma.monitor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cronJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.incident.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      include: {
        monitor: { select: { name: true } },
        cronJob: { select: { name: true } },
      },
    }),
  ]);

  // Calculate metrics
  const totalMonitors = monitors.length;
  const monitorsUp = monitors.filter((m: any) => m.status === 'UP').length;
  const openIncidents = incidents.filter((i: any) => i.status === 'OPEN').length;
  const cronJobsHealthy = cronJobs.filter((c: any) => c.status === 'HEALTHY').length;

  const stats = {
    totalMonitors,
    monitorsUp,
    openIncidents,
    cronJobsHealthy,
  };

  const formattedRecentIncidents = incidents.slice(0, 10).map((i: any) => ({
    id: i.id,
    title: i.title,
    type: i.type as 'DOWN' | 'DEGRADED' | 'CRON_MISSED',
    status: i.status as 'OPEN' | 'RESOLVED',
    startedAt: i.startedAt.toISOString(),
  }));

  const allMonitors = monitors.map((m: any) => ({
    id: m.id,
    name: m.name,
    url: m.url,
    status: m.status as 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN',
  }));

  const allCrons = cronJobs.map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status as 'HEALTHY' | 'MISSED' | 'WAITING',
  }));

  return (
    <DashboardClient
      stats={stats}
      recentIncidents={formattedRecentIncidents}
      allMonitors={allMonitors}
      allCrons={allCrons}
    />
  );
}
