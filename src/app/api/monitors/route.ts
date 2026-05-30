import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const monitors = await prisma.monitor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ monitors });
  } catch (error) {
    console.error('Failed to fetch monitors:', error);
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

    const { name, url, method = 'GET', interval = 10, timeout = 30, expectedStatus = 200, maxResponseTime = 2000 } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    // Plan-based limitations enforcement
    const currentMonitorsCount = await prisma.monitor.count({
      where: { userId: user.id },
    });

    if (user.plan === 'FREE') {
      if (currentMonitorsCount >= 3) {
        return NextResponse.json({
          error: 'Free plan is limited to 3 monitors. Please upgrade to Pro for unlimited monitors!'
        }, { status: 403 });
      }
      if (interval < 10) {
        return NextResponse.json({
          error: 'Free plan is limited to a minimum check interval of 10 minutes. Upgrade to Pro for 1-minute intervals!'
        }, { status: 403 });
      }
    } else {
      // Pro plan limits
      if (interval < 1) {
        return NextResponse.json({
          error: 'Minimum check interval is 1 minute.'
        }, { status: 400 });
      }
    }

    const monitor = await prisma.monitor.create({
      data: {
        userId: user.id,
        name,
        url,
        method,
        interval: Number(interval),
        timeout: Number(timeout),
        expectedStatus: Number(expectedStatus),
        maxResponseTime: Number(maxResponseTime),
        status: 'UNKNOWN',
      },
    });

    return NextResponse.json({ monitor }, { status: 201 });
  } catch (error) {
    console.error('Failed to create monitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
