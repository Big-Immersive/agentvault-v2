import Link from 'next/link';
import { Database } from 'lucide-react';

interface DatasetCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  entryCount: number;
  priceUsdc: number | null;
  author: string;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  knowledge: 'bg-blue-500/20 text-blue-400',
  skills: 'bg-green-500/20 text-green-400',
  operational: 'bg-orange-500/20 text-orange-400',
  query_cache: 'bg-purple-500/20 text-purple-400',
};

export default function DatasetCard({ id, name, description, category, tags, entryCount, priceUsdc, author, createdAt }: DatasetCardProps) {
  return (
    <Link href={`/marketplace/dataset/${id}`} className="block p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-medium truncate">{name}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] ?? 'bg-gray-500/20 text-gray-400'}`}>
          {category}
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
        {description || 'No description'}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 5).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)]">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span>{entryCount} entries</span>
          {priceUsdc != null && priceUsdc > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-medium">${priceUsdc.toFixed(2)} USDC</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">Free</span>
          )}
        </div>
        <span>{author} &middot; {new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
