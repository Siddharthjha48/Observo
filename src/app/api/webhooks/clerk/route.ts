import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing from env');
    return new Response('CLERK_WEBHOOK_SECRET is missing', { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return new Response('Invalid body', { status: 400 });
  }
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured during verification', {
      status: 400
    });
  }

  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data as any;
      const email = email_addresses[0]?.email_address || email_addresses[0]?.emailAddress;

      if (!email) {
        return new Response('No email address provided', { status: 400 });
      }

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        },
        create: {
          clerkId: id,
          email,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        },
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (id) {
        await prisma.user.deleteMany({
          where: { clerkId: id },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database sync error in Clerk webhook:', error);
    return NextResponse.json({ error: 'Internal database error' }, { status: 500 });
  }
}
