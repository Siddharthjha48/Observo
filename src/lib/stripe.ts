import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-01-27-pre.0' as any, // standard server compatibility
});

export default stripe;
