'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Upload, Database, Key, Users, BookOpen, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/marketplace', label: 'Browse', icon: Search },
  { href: '/marketplace/upload', label: 'Upload', icon: Upload },
  { href: '/marketplace/my-datasets', label: 'My Uploads', icon: Database },
  { href: '/marketplace/api-keys', label: 'API Keys', icon: Key },
  { href: '/marketplace/users', label: 'Users', icon: Users },
  { href: '/marketplace/docs', label: 'API Docs', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3 right-4 z-50 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-40 top-0 left-0 h-full w-56
        border-r border-[var(--border)] p-4 flex flex-col gap-1
        bg-[var(--bg-primary)] transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="md:hidden h-12" /> {/* Spacer for mobile nav */}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
