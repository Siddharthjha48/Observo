import { NextResponse } from 'next/server';
import { getOrCreateDbUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDbUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fallback: If Stripe is not configured, simulate upgrade directly for testing
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRO_PRICE_ID) {
      console.warn('Stripe keys are missing. Simulating upgrade directly in PostgreSQL.');
      
      const newPlan = user.plan === 'FREE' ? 'PRO' : 'FREE';

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: newPlan },
      });

      return NextResponse.json({
        url: `${appUrl}/settings?simulated_upgrade=true&plan=${newPlan}`,
        simulated: true,
      });
    }

    // 1. Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/settings?success=true`,
      cancel_url: `${appUrl}/settings?canceled=true`,
      customer_email: user.email,
      client_reference_id: user.id,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout route failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
