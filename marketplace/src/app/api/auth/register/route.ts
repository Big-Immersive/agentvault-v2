import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.email) {
    return NextResponse.json({ error: 'Display name and email are required' }, { status: 400 });
  }

  const { username, email } = body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const result = db.prepare('INSERT INTO users (username, email) VALUES (?, ?)').run(
    username.trim(), email.trim().toLowerCase()
  );

  return NextResponse.json(
    { id: result.lastInsertRowid, username: username.trim(), email: email.trim().toLowerCase() },
    { status: 201 }
  );
}
