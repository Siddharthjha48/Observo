import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === 'siddharth' && password === '@password') {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'siddharth_admin_active_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Something went wrong', details: error.message }, { status: 500 });
  }
}
