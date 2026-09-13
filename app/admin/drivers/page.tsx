'use client';

import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { SearchIcon, StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { initials } from '@/lib/utils';

function DriversAdmin() {
  const { drivers, setDriverVerified, setUserStatus } = useApp();
  const [query, setQuery] = useState('');

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.plate.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="shell">
      <PageHeader title="Drivers" />
      <div className="page-body">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            className="input pl-10"
            placeholder="Search by name or plate"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.map((d) => (
          <div key={d.id} className="panel">
            <div className="flex items-center gap-3">
              <div className="avatar">{initials(d.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{d.name}</p>
                <p className="flex items-center gap-1 text-[12px] text-ink/55">
                  <StarIcon width={12} height={12} className="text-gold" /> {d.rating.toFixed(1)} ·{' '}
                  {d.completedTrips} trips
                </p>
              </div>
              <span className={d.status === 'active' ? 'badge-success' : 'badge-danger'}>{d.status}</span>
            </div>
            <div className="row">
              <span className="text-[13px] text-ink/60">{d.tricycle}</span>
              <span className="ml-auto data-chip">{d.plate}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setDriverVerified(d.id, !d.verified)}
                className={`btn-sm flex-1 ${d.verified ? 'btn-outline' : 'btn-primary'}`}
              >
                {d.verified ? 'Verified ✓' : 'Verify driver'}
              </button>
              <button
                onClick={() => setUserStatus(d.id, d.status === 'active' ? 'suspended' : 'active')}
                className="btn-outline btn-sm flex-1"
              >
                {d.status === 'active' ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <DriversAdmin />
    </RequireRole>
  );
}
