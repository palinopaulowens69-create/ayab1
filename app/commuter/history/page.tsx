'use client';

import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatDate, formatPeso } from '@/lib/utils';

function statusBadgeClass(status: string) {
  if (status === 'completed') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-brand';
}

function History() {
  const { currentUser, bookings, drivers } = useApp();
  const trips = bookings
    .filter((b) => b.passengerId === currentUser?.id && (b.status === 'completed' || b.status === 'cancelled'))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="shell">
      <PageHeader title="Trip history" />
      <div className="page-body">
        {trips.length === 0 ? (
          <div className="empty-state">
            <p className="font-semibold text-ink">No trips yet</p>
            <p className="text-[13px]">Your completed and cancelled trips will show up here.</p>
          </div>
        ) : (
          trips.map((trip) => {
            const driver = drivers.find((d) => d.id === trip.driverId);
            return (
              <div key={trip.id} className="panel">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">
                      {trip.pickup.name} → {trip.destination.name}
                    </p>
                    <p className="text-[12px] text-ink/50">{formatDate(trip.createdAt)}</p>
                  </div>
                  <span className={statusBadgeClass(trip.status)}>{trip.status}</span>
                </div>
                <div className="row">
                  <span className="text-[13px] text-ink/60">{driver?.name ?? 'Unassigned'}</span>
                  <span className="ml-auto font-semibold text-brand">{formatPeso(trip.fare)}</span>
                </div>
                {trip.rating && (
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-ink/60">
                    <StarIcon width={14} height={14} className="text-gold" /> You rated {trip.rating}/5
                    {trip.review ? ` — “${trip.review}”` : ''}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
      <BottomTabs role="commuter" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <History />
    </RequireRole>
  );
}
