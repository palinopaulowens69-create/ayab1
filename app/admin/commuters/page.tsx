'use client';

import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { SearchIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { initials } from '@/lib/utils';

function CommutersAdmin() {
  const { users, bookings, setUserStatus } = useApp();
  const [query, setQuery] = useState('');

  const commuters = users
    .filter((u) => u.role === 'commuter')
    .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="shell">
      <PageHeader title="Commuters" />
      <div className="page-body">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            className="input pl-10"
            placeholder="Search commuters"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {commuters.map((c) => {
          const trips = bookings.filter((b) => b.passengerId === c.id && b.status === 'completed').length;
          return (
            <div key={c.id} className="panel">
              <div className="flex items-center gap-3">
                <div className="avatar">{initials(c.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{c.name}</p>
                  <p className="truncate text-[12px] text-ink/55">{c.email}</p>
                </div>
                <span className={c.status === 'active' ? 'badge-success' : 'badge-danger'}>{c.status}</span>
              </div>
              <div className="row">
                <span className="text-[13px] text-ink/60">{trips} completed trips</span>
                <button
                  onClick={() => setUserStatus(c.id, c.status === 'active' ? 'suspended' : 'active')}
                  className="btn-outline btn-sm ml-auto"
                >
                  {c.status === 'active' ? 'Suspend' : 'Reactivate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <CommutersAdmin />
    </RequireRole>
  );
}
