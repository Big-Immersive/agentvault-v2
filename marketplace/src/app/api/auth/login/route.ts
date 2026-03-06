import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { signJwt } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare('SELECT id, username, email FROM users WHERE email = ?').get(
    body.email.trim().toLowerCase()
  ) as { id: number; username: string; email: string } | undefined;

  if (!user) {
    return NextResponse.json({ error: 'Email not found. Please register first.' }, { status: 401 });
  }

  const token = await signJwt({ sub: user.id, username: user.username, email: user.email });

  const cookieStore = await cookies();
  cookieStore.set('av_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return NextResponse.json({ id: user.id, username: user.username, email: user.email });
}
