import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import { generateWeeklyDigest } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const digest = await generateWeeklyDigest(user.id);

    return NextResponse.json({ digest });
  } catch (error) {
    console.error('Failed to generate AI weekly digest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
