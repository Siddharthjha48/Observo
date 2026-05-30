import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a fresh random CUID or equivalent string
    const newApiKey = 'obs_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { apiKey: newApiKey },
    });

    return NextResponse.json({ apiKey: updatedUser.apiKey, success: true });
  } catch (error) {
    console.error('Failed to regenerate API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
