import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CronJobsClient from './CronJobsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CronJobsPage() {
  const user = await getOrCreateDbUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Load cron jobs for the logged-in user
  const cronJobs = await prisma.cronJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Map backend structure to the format needed by the client component
  const formattedCronJobs = cronJobs.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    expectedInterval: c.expectedInterval,
    gracePeriod: c.gracePeriod,
    status: c.status as 'HEALTHY' | 'MISSED' | 'WAITING',
    lastPingAt: c.lastPingAt,
    isActive: c.isActive,
  }));

  return (
    <CronJobsClient
      initialCronJobs={formattedCronJobs}
      plan={user.plan}
    />
  );
}
