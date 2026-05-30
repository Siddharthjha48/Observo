import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import IncidentsClient from './IncidentsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IncidentsPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Load all incidents history for the user
  const incidents = await prisma.incident.findMany({
    where: { userId: user.id },
    include: {
      monitor: { select: { name: true } },
      cronJob: { select: { name: true } },
    },
    orderBy: { startedAt: 'desc' },
  });

  const formattedIncidents = incidents.map((i: any) => ({
    id: i.id,
    monitorId: i.monitorId,
    cronJobId: i.cronJobId,
    monitorName: i.monitor?.name || null,
    cronJobName: i.cronJob?.name || null,
    type: i.type as 'DOWN' | 'DEGRADED' | 'CRON_MISSED',
    title: i.title,
    description: i.description,
    status: i.status as 'OPEN' | 'RESOLVED',
    startedAt: i.startedAt.toISOString(),
    resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null,
    duration: i.duration,
  }));

  return <IncidentsClient initialIncidents={formattedIncidents} />;
}
