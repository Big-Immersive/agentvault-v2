import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/middleware';

interface UserStatsRow {
  id: number;
  username: string;
  email: string;
  created_at: string;
  keys_count: number;
  datasets_count: number;
}

/** GET /api/users — list all registered users with stats */
export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const db = getDb();
  const rows = db.prepare(`
    SELECT
      u.id, u.username, u.email, u.created_at,
      (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id) as keys_count,
      (SELECT COUNT(*) FROM datasets WHERE user_id = u.id) as datasets_count
    FROM users u
    ORDER BY u.created_at DESC
  `).all() as UserStatsRow[];

  return NextResponse.json({
    users: rows.map(r => ({
      id: r.id,
      username: r.username,
      email: r.email,
      createdAt: r.created_at,
      keysCount: r.keys_count,
      datasetsCount: r.datasets_count,
    })),
  });
}
