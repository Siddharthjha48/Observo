import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  const formattedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan as 'FREE' | 'PRO',
    apiKey: user.apiKey,
  };

  return <SettingsClient user={formattedUser} />;
}
