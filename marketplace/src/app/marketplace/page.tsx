'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import DatasetCard from '@/components/DatasetCard';

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

const CATEGORIES = ['all', 'knowledge', 'skills', 'operational', 'query_cache'];

export default function BrowsePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category !== 'all') params.set('category', category);

    setLoading(true);
    fetch(`/api/datasets?${params}`)
      .then(r => r.ok ? r.json() : { datasets: [] })
      .then(data => setDatasets(data.datasets))
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, [query, category]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Browse Datasets</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                category === cat
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {cat === 'query_cache' ? 'Cache' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading...</p>
      ) : datasets.length === 0 ? (
        <p className="text-[var(--text-secondary)]">No datasets found. Be the first to upload one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map(d => <DatasetCard key={d.id} {...d} />)}
        </div>
      )}
    </div>
  );
}
