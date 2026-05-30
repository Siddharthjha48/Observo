import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CronJobDetailClient from './CronJobDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CronJobDetailPage({ params }: PageProps) {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
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
    notFound();
  }

  // Format backend records into the format expected by the client component
  const formattedCronJob = {
    id: cronJob.id,
    name: cronJob.name,
    slug: cronJob.slug,
    expectedInterval: cronJob.expectedInterval,
    gracePeriod: cronJob.gracePeriod,
    status: cronJob.status as 'HEALTHY' | 'MISSED' | 'WAITING',
    lastPingAt: cronJob.lastPingAt ? cronJob.lastPingAt.toISOString() : null,
    isActive: cronJob.isActive,
    createdAt: cronJob.createdAt.toISOString(),
  };

  const formattedPings = cronJob.pings.map((p: any) => ({
    id: p.id,
    pingAt: p.pingAt.toISOString(),
    note: p.note,
  }));

  const formattedIncidents = cronJob.incidents.map((i: any) => ({
    id: i.id,
    type: i.type as 'DOWN' | 'DEGRADED' | 'CRON_MISSED',
    title: i.title,
    description: i.description,
    status: i.status as 'OPEN' | 'RESOLVED',
    startedAt: i.startedAt.toISOString(),
    resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null,
    duration: i.duration,
  }));

  return (
    <CronJobDetailClient
      cronJob={formattedCronJob}
      pings={formattedPings}
      incidents={formattedIncidents}
    />
  );
}
