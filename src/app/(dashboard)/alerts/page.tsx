import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AlertsClient from './AlertsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AlertsConfigPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Load alert channels for the logged-in user
  const channels = await prisma.alertChannel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const formattedChannels = channels.map((c: any) => ({
    id: c.id,
    type: c.type as 'DISCORD' | 'SLACK' | 'EMAIL',
    name: c.name,
    config: c.config,
    isActive: c.isActive,
  }));

  return (
    <AlertsClient
      initialChannels={formattedChannels}
      plan={user.plan}
    />
  );
}
