import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const channel = await prisma.alertChannel.findUnique({
      where: { id },
    });

    if (!channel || channel.userId !== user.id) {
      return NextResponse.json({ error: 'Alert channel not found' }, { status: 404 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { isActive, name } = body;

    const updatedChannel = await prisma.alertChannel.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        name: name !== undefined ? name : undefined,
      },
    });

    return NextResponse.json({ alertChannel: updatedChannel });
  } catch (error) {
    console.error('Failed to update alert channel:', error);
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
    const channel = await prisma.alertChannel.findUnique({
      where: { id },
    });

    if (!channel || channel.userId !== user.id) {
      return NextResponse.json({ error: 'Alert channel not found' }, { status: 404 });
    }

    await prisma.alertChannel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Alert channel deleted successfully' });
  } catch (error) {
    console.error('Failed to delete alert channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
