import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/ping/(.*)',
  '/api/webhooks/(.*)',
  '/api/cron/(.*)',
  '/admin-login(.*)',
  '/api/admin/(.*)'
]);

export default function middleware(req: any, event: any) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const isPlaceholder = !secretKey || secretKey.startsWith('sk_test_...') || secretKey === '...';

  // Developer Preview Mode Bypass
  if (isPlaceholder) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/static|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
