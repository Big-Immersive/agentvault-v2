import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/** GET /api/datasets/[id] — get a single dataset (public) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = await getDb();
  const { rows } = await pool.query(
    'SELECT d.*, u.username FROM datasets d JOIN users u ON d.user_id = u.id WHERE d.id = $1 AND d.is_public = TRUE',
    [Number(id)]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  const row = rows[0];
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
