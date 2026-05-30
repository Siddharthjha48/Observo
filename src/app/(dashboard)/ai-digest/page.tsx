import React from 'react';
import { redirect } from 'next/navigation';
import { getOrCreateDbUser } from '@/lib/auth';
import AiDigestClient from './AiDigestClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AiDigestPage() {
  const user = await getOrCreateDbUser();
  if (!user) {
    redirect('/sign-in');
  }

  return <AiDigestClient />;
}
