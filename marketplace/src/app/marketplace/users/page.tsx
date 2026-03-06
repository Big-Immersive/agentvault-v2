'use client';

import { useEffect, useState } from 'react';
import { Users, Key, Database } from 'lucide-react';

interface UserStats {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  keysCount: number;
  datasetsCount: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : { users: [] })
      .then(data => setUsers(data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-[var(--accent)]" /> Registered Users
      </h1>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-[var(--text-secondary)]">No users registered yet.</p>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-card)]">
                <th className="text-left px-4 py-3 font-medium">Display Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-center px-4 py-3 font-medium">
                  <span className="flex items-center justify-center gap-1"><Key className="w-3 h-3" /> Keys</span>
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <span className="flex items-center justify-center gap-1"><Database className="w-3 h-3" /> Datasets</span>
                </th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-secondary)] rounded-full text-xs">
                      {u.keysCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-secondary)] rounded-full text-xs">
                      {u.datasetsCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--text-secondary)]">{users.length} total users</p>
    </div>
  );
}
