import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const monitor = await prisma.monitor.findUnique({
      where: { id },
      include: {
        checks: {
          take: 50,
          orderBy: { checkedAt: 'desc' },
        },
        incidents: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!monitor || monitor.userId !== user.id) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    return NextResponse.json({ monitor });
  } catch (error) {
    console.error('Failed to fetch monitor details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const monitor = await prisma.monitor.findUnique({
      where: { id },
    });

    if (!monitor || monitor.userId !== user.id) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, url, method, interval, timeout, expectedStatus, maxResponseTime, isActive } = body;

    // Enforce FREE limits for updating interval if provided
    if (interval !== undefined && user.plan === 'FREE' && Number(interval) < 10) {
      return NextResponse.json({
        error: 'Free plan is limited to a minimum check interval of 10 minutes.'
      }, { status: 403 });
    }

    const updatedMonitor = await prisma.monitor.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        url: url !== undefined ? url : undefined,
        method: method !== undefined ? method : undefined,
        interval: interval !== undefined ? Number(interval) : undefined,
        timeout: timeout !== undefined ? Number(timeout) : undefined,
        expectedStatus: expectedStatus !== undefined ? Number(expectedStatus) : undefined,
        maxResponseTime: maxResponseTime !== undefined ? Number(maxResponseTime) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ monitor: updatedMonitor });
  } catch (error) {
    console.error('Failed to update monitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const monitor = await prisma.monitor.findUnique({
      where: { id },
    });

    if (!monitor || monitor.userId !== user.id) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    await prisma.monitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error('Failed to delete monitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
