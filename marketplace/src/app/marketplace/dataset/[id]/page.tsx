'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

interface DatasetDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  entryCount: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function DatasetDetailPage() {
  const { id } = useParams();
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/datasets/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setDataset)
      .catch(() => setError('Dataset not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[var(--text-secondary)]">Loading...</p>;
  if (error || !dataset) return <p className="text-[var(--danger)]">{error}</p>;

  return (
    <div className="max-w-4xl">
      <Link href="/marketplace" className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to browse
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--accent)]" />
            {dataset.name}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{dataset.description || 'No description'}</p>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-[var(--accent)]/20 text-[var(--accent)] capitalize">
          {dataset.category}
        </span>
      </div>

      <div className="flex gap-4 text-sm text-[var(--text-secondary)] mb-4">
        <span>{dataset.entryCount} entries</span>
        <span>By {dataset.author}</span>
        <span>Created {new Date(dataset.createdAt).toLocaleDateString()}</span>
      </div>

      {dataset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {dataset.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)]">{tag}</span>
          ))}
        </div>
      )}

      <div className="border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--border)] text-sm text-[var(--text-secondary)]">Content</div>
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto">
          {dataset.content}
        </pre>
      </div>
    </div>
  );
}
