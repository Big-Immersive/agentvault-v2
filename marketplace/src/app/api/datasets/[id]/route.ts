import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireUser } from '@/lib/middleware';
import { getUserFromApiKey } from '@/lib/middleware';

interface DatasetRow {
  id: number;
  user_id: number;
  name: string;
  description: string;
  category: string;
  content: string;
  tags: string;
  entry_count: number;
  created_at: string;
  updated_at: string;
  username: string;
}

/** GET /api/datasets/[id] — get a single dataset (JWT or API key auth) */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Try JWT auth first, then API key
  const user = await requireUser();
  const apiKeyUser = user instanceof NextResponse ? getUserFromApiKey(request) : null;

  if (user instanceof NextResponse && !apiKeyUser) {
    return user; // 401
  }

  const { id } = await params;
  const db = getDb();
  const row = db.prepare(
    'SELECT d.*, u.username FROM datasets d JOIN users u ON d.user_id = u.id WHERE d.id = ?'
  ).get(Number(id)) as DatasetRow | undefined;

  if (!row) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    content: row.content,
    tags: JSON.parse(row.tags),
    entryCount: row.entry_count,
    author: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
