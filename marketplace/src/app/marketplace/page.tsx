'use client';

import { useEffect, useState } from 'react';
import { Search, Database, Zap, Upload } from 'lucide-react';
import Link from 'next/link';
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

const DATASET_CATEGORIES = ['all', 'knowledge', 'operational', 'query_cache'];

export default function BrowsePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'dataset' | 'skill'>('dataset');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (query) params.set('q', query);
    if (type === 'dataset' && category !== 'all') params.set('category', category);

    setLoading(true);
    fetch(`/api/datasets?${params}`)
      .then(r => r.ok ? r.json() : { datasets: [] })
      .then(data => setDatasets(data.datasets))
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, [query, type, category]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Browse Marketplace</h1>

      {/* Main type toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => { setType('dataset'); setCategory('all'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === 'dataset'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Database className="w-4 h-4" /> Datasets
        </button>
        <button
          onClick={() => { setType('skill'); setCategory('all'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === 'skill'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Zap className="w-4 h-4" /> Skills
        </button>
      </div>

      {/* Search + category filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={`Search ${type === 'skill' ? 'skills' : 'datasets'}...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {type === 'dataset' && (
          <div className="flex gap-1">
            {DATASET_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                  category === cat
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {cat === 'query_cache' ? 'Cache' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading...</p>
      ) : datasets.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)] mb-4">
            No {type === 'skill' ? 'skills' : 'datasets'} found. Be the first to upload one!
          </p>
          <Link
            href="/marketplace/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Upload {type === 'skill' ? 'Skill' : 'Dataset'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map(d => <DatasetCard key={d.id} {...d} />)}
        </div>
      )}
    </div>
  );
}
