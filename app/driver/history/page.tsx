'use client';

import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { useApp } from '@/lib/store';
import { formatDate, formatPeso } from '@/lib/utils';

function statusBadgeClass(status: string) {
  if (status === 'completed') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-brand';
}

function DriverHistory() {
  const { currentUser, bookings } = useApp();
  const trips = bookings
    .filter((b) => b.driverId === currentUser?.id && (b.status === 'completed' || b.status === 'cancelled'))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="shell">
      <PageHeader title="Trip history" />
      <div className="page-body">
        {trips.length === 0 ? (
          <div className="empty-state">
            <p className="font-semibold text-ink">No trips yet</p>
            <p className="text-[13px]">Trips you complete will show up here.</p>
          </div>
        ) : (
          trips.map((trip) => (
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
                <span className="text-[13px] text-ink/60">{trip.passengerName}</span>
                <span className="ml-auto font-semibold text-brand">{formatPeso(trip.fare)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomTabs role="driver" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverHistory />
    </RequireRole>
  );
}
