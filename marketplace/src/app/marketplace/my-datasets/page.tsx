'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Plus } from 'lucide-react';

interface Dataset {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  entryCount: number;
  author: string;
  createdAt: string;
}

export default function MyDatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/datasets')
      .then(r => r.ok ? r.json() : { datasets: [] })
      .then(data => setDatasets(data.datasets))
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Uploads</h1>
        <Link
          href="/marketplace/upload"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] text-sm"
        >
          <Plus className="w-4 h-4" /> New Upload
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading...</p>
      ) : datasets.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No uploads yet. Publish your first dataset or skill!</p>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-card)]">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Entries</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(d => (
                <tr key={d.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                  <td className="px-4 py-3">
                    <Link href={`/marketplace/dataset/${d.id}`} className="text-[var(--accent)] hover:underline">{d.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] capitalize">{d.category}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{d.entryCount}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
