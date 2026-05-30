import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MonitorsClient from './MonitorsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MonitorsPage() {
  const user = await getOrCreateDbUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Load monitors for the logged-in user
  const monitors = await prisma.monitor.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Map to the format needed by the client
  const formattedMonitors = monitors.map((m: any) => ({
    id: m.id,
    name: m.name,
    url: m.url,
    method: m.method,
    interval: m.interval,
    status: m.status as 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN',
    uptimePercent: m.uptimePercent,
    lastResponseTime: m.lastResponseTime,
    lastCheckedAt: m.lastCheckedAt,
    isActive: m.isActive,
  }));

  return (
    <MonitorsClient
      initialMonitors={formattedMonitors}
      plan={user.plan}
    />
  );
}
