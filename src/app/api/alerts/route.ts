import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alertChannels = await prisma.alertChannel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alertChannels });
  } catch (error) {
    console.error('Failed to fetch alert channels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { type, name, config } = body;

    if (!type || !name || !config) {
      return NextResponse.json({ error: 'Type, Name, and Config are required' }, { status: 400 });
    }

    // 1. Enforce Free vs Pro plan limits
    const currentChannelsCount = await prisma.alertChannel.count({
      where: { userId: user.id },
    });

    if (user.plan === 'FREE') {
      if (currentChannelsCount >= 1) {
        return NextResponse.json({
          error: 'Free plan is limited to 1 alert channel. Please upgrade to Pro for unlimited channels!'
        }, { status: 403 });
      }

      if (type !== 'DISCORD') {
        return NextResponse.json({
          error: 'Free plan alert channels are restricted to Discord Webhooks only. Upgrade to Pro to enable Slack and Email alerts!'
        }, { status: 403 });
      }
    }

    // Validate config shape based on type
    if (type === 'DISCORD' || type === 'SLACK') {
      if (!config.webhookUrl || !config.webhookUrl.startsWith('http')) {
        return NextResponse.json({ error: 'A valid HTTP webhook URL is required.' }, { status: 400 });
      }
    } else if (type === 'EMAIL') {
      if (!config.email || !config.email.includes('@')) {
        return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid alert channel type.' }, { status: 400 });
    }

    const alertChannel = await prisma.alertChannel.create({
      data: {
        userId: user.id,
        type,
        name,
        config,
      },
    });

    return NextResponse.json({ alertChannel }, { status: 201 });
  } catch (error) {
    console.error('Failed to create alert channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
