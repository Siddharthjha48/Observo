import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is missing from environment variables');
    return new Response('Webhook secret is not configured', { status: 500 });
  }

  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get('stripe-signature');

  if (!signature) {
    return new Response('stripe-signature header is missing', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = session.client_reference_id || session.subscription_data?.metadata?.userId;
        const stripeCustomerId = session.customer;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PRO',
              stripeCustomerId: stripeCustomerId as string,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeCustomerId = session.customer;
        const status = session.status;

        // If active, trialing, or past_due, give access. If unpaid or canceled, downgrade
        const isAccessAllowed = ['active', 'trialing', 'past_due'].includes(status);

        await prisma.user.updateMany({
          where: { stripeCustomerId: stripeCustomerId as string },
          data: {
            plan: isAccessAllowed ? 'PRO' : 'FREE',
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeCustomerId = session.customer;
        await prisma.user.updateMany({
          where: { stripeCustomerId: stripeCustomerId as string },
          data: {
            plan: 'FREE',
          },
        });
        break;
      }

      default:
        console.log(`Unhandled Stripe Webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (dbErr) {
    console.error('Database update failed inside Stripe Webhook:', dbErr);
    return NextResponse.json({ error: 'Database sync failure' }, { status: 500 });
  }
}
