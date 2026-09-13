'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';

function Requests() {
  const { currentUser, drivers, bookings, acceptBooking } = useApp();
  const router = useRouter();
  const driver = drivers.find((d) => d.id === currentUser?.id);
  const requests = bookings.filter((b) => b.status === 'searching');
  const hasActiveTrip = bookings.some(
    (b) => b.driverId === currentUser?.id && ['accepted', 'verified', 'started'].includes(b.status),
  );

  function accept(bookingId: string) {
    if (!currentUser) return;
    acceptBooking(bookingId, currentUser.id);
    router.push('/driver/trip');
  }

  return (
    <div className="shell">
      <PageHeader title="Ride requests" />
      <div className="page-body">
        {!driver?.online && (
          <div className="panel !mt-0 bg-warning/10 text-[13px] text-warning">
            You&apos;re offline. Go online from your home tab to accept requests.
          </div>
        )}
        {hasActiveTrip && (
          <div className="panel !mt-0 bg-brand/5 text-[13px] text-brand">
            Finish your current trip before accepting a new one.
          </div>
        )}

        {requests.length === 0 ? (
          <div className="empty-state">
            <p className="font-semibold text-ink">No requests right now</p>
            <p className="text-[13px]">New commuter bookings will show up here.</p>
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="panel">
              <p className="text-[14px] font-semibold">
                {r.pickup.name} → {r.destination.name}
              </p>
              <div className="row">
                <span className="text-[13px] text-ink/60">{r.passengerName}</span>
                <span className="ml-auto text-[13px] text-ink/60">{r.distance.toFixed(1)} km</span>
              </div>
              <div className="row">
                <span className="text-[13px] text-ink/60">Fare</span>
                <span className="ml-auto font-display text-[16px] font-bold text-brand">
                  {formatPeso(r.fare)}
                </span>
              </div>
              <button
                onClick={() => accept(r.id)}
                disabled={!driver?.online || hasActiveTrip}
                className="btn-primary mt-2"
              >
                Accept request
              </button>
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
      <Requests />
    </RequireRole>
  );
}
