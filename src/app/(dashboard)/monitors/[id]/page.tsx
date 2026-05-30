import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MonitorDetailClient from './MonitorDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MonitorDetailPage({ params }: PageProps) {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;

  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: {
      checks: {
        take: 100,
        orderBy: { checkedAt: 'desc' },
      },
      incidents: {
        take: 10,
        orderBy: { startedAt: 'desc' },
      },
    },
  });

  if (!monitor || monitor.userId !== user.id) {
    notFound();
  }

  // 1. Prepare Chart Data (latency checks over the last 24h, reversed to chronological order)
  const last24hChecks = monitor.checks
    .slice(0, 24)
    .reverse()
    .map((check: any) => {
      const timeString = new Date(check.checkedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        time: timeString,
        latency: check.responseTime ?? 0,
      };
    });

  // 2. Prepare 7-day daily health grid blocks
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const uptimeHistory = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    const dayLabel = daysOfWeek[targetDate.getDay()];
    
    // Start & End range for target day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Filter checks belonging to this day range
    const dayChecks = monitor.checks.filter((check: any) => {
      const checkedTime = new Date(check.checkedAt);
      return checkedTime >= startOfDay && checkedTime <= endOfDay;
    });

    const isHealthy = dayChecks.length > 0 ? !dayChecks.some((c: any) => c.status === 'DOWN') : true;

    uptimeHistory.push({
      day: dayLabel,
      isHealthy,
      count: dayChecks.length,
    });
  }

  // Map backend structures to client format
  const formattedMonitor = {
    id: monitor.id,
    name: monitor.name,
    url: monitor.url,
    method: monitor.method,
    interval: monitor.interval,
    timeout: monitor.timeout,
    expectedStatus: monitor.expectedStatus,
    maxResponseTime: monitor.maxResponseTime,
    status: monitor.status as 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN',
    uptimePercent: monitor.uptimePercent,
    lastResponseTime: monitor.lastResponseTime,
    lastCheckedAt: monitor.lastCheckedAt ? monitor.lastCheckedAt.toISOString() : null,
    isActive: monitor.isActive,
    createdAt: monitor.createdAt.toISOString(),
  };

  const formattedChecks = monitor.checks.slice(0, 50).map((c: any) => ({
    id: c.id,
    status: c.status as 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN',
    responseTime: c.responseTime,
    statusCode: c.statusCode,
    error: c.error,
    checkedAt: c.checkedAt.toISOString(),
  }));

  const formattedIncidents = monitor.incidents.map((i: any) => ({
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
    <MonitorDetailClient
      monitor={formattedMonitor}
      checks={formattedChecks}
      incidents={formattedIncidents}
      chartData={last24hChecks}
      uptimeHistory={uptimeHistory}
    />
  );
}
