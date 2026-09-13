'use client';

import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import type { Incident, IncidentStatus } from '@/lib/types';

const STATUSES: IncidentStatus[] = ['Pending', 'Investigating', 'Resolved', 'Closed'];

function badgeClass(status: IncidentStatus) {
  if (status === 'Resolved' || status === 'Closed') return 'badge-success';
  if (status === 'Investigating') return 'badge-brand';
  return 'badge-warning';
}

function IncidentRow({ incident }: { incident: Incident }) {
  const { updateIncidentStatus } = useApp();
  const [notes, setNotes] = useState(incident.notes);

  return (
    <div className="panel">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold">{incident.title}</p>
          <p className="text-[12px] text-ink/50">{formatDate(incident.date)}</p>
        </div>
        <span className={badgeClass(incident.status)}>{incident.status}</span>
      </div>
      <p className="mt-2 text-[13px] text-ink/70">{incident.description}</p>
      <p className="mt-1 text-[12px] text-ink/50">
        Passenger: {incident.passenger} · Driver: {incident.driver}
      </p>

      <label className="field-label mt-3">Status</label>
      <select
        className="input"
        value={incident.status}
        onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus, notes)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="field-label mt-3">Internal notes</label>
      <textarea
        className="input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => updateIncidentStatus(incident.id, incident.status, notes)}
        placeholder="Add resolution notes…"
      />
    </div>
  );
}

function IncidentsAdmin() {
  const { incidents } = useApp();
  const sorted = [...incidents].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="shell">
      <PageHeader title="Incident reports" />
      <div className="page-body">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <p className="font-semibold text-ink">No incidents reported</p>
          </div>
        ) : (
          sorted.map((i) => <IncidentRow key={i.id} incident={i} />)
        )}
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <IncidentsAdmin />
    </RequireRole>
  );
}
