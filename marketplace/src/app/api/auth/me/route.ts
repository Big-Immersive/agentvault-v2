import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/middleware';

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ id: user.sub, username: user.username, email: user.email });
}
