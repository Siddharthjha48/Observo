import { currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function getOrCreateDbUser() {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    const isPlaceholder = !secretKey || secretKey.startsWith('sk_test_...') || secretKey === '...';

    // Local Developer Preview Mode: Auto-provision Mock Developer
    if (isPlaceholder) {
      let mockUser = await prisma.user.findUnique({
        where: { clerkId: 'mock_developer_clerk_id' },
      });

      if (!mockUser) {
        mockUser = await prisma.user.create({
          data: {
            clerkId: 'mock_developer_clerk_id',
            email: 'developer@observo.dev',
            name: 'Mock Developer',
            plan: 'FREE',
          },
        });
      }
      return mockUser;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error('No email address found for Clerk user:', clerkUser.id);
      return null;
    }

    // Try to find the user in our DB
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Fallback: If webhook didn't sync yet, auto-provision
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error fetching or creating DB user:', error);
    return null;
  }
}
