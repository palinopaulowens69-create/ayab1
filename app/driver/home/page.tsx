'use client';

import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';

function DriverHome() {
  const { currentUser, drivers, bookings, toggleDriverOnline } = useApp();
  const driver = drivers.find((d) => d.id === currentUser?.id);
  const openRequests = bookings.filter((b) => b.status === 'searching').length;
  const activeTrip = bookings.find(
    (b) => b.driverId === currentUser?.id && ['accepted', 'verified', 'started'].includes(b.status),
  );
  const earningsToday = bookings
    .filter((b) => b.driverId === currentUser?.id && b.status === 'completed')
    .reduce((sum, b) => sum + b.fare, 0);

  if (!driver) return null;

  return (
    <div className="shell">
      <PageHeader title="AYAB Driver" />
      <div className="page-body">
        <div className="ticket px-4 py-5">
          <div className="ticket-notch">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-gold">
                {driver.verified ? 'Verified driver' : 'Pending verification'}
              </p>
              <p className="mt-1 font-display text-[19px] font-extrabold">{driver.name}</p>
              <p className="flex items-center gap-1 text-[13px] text-white/75">
                <StarIcon width={14} height={14} className="text-gold" /> {driver.rating.toFixed(1)} ·{' '}
                {driver.completedTrips} trips
              </p>
            </div>
            <button
              onClick={() => driver.verified && toggleDriverOnline(driver.id)}
              disabled={!driver.verified}
              className={`btn-sm btn-auto rounded-full px-4 font-semibold ${
                driver.online ? 'bg-gold text-ink' : 'bg-white/15 text-white'
              } disabled:opacity-50`}
            >
              {driver.online ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>

        {!driver.verified && (
          <div className="panel !mt-3 bg-warning/10 text-[13px] text-warning">
            Your account is awaiting admin verification. You&apos;ll be able to go online once approved.
          </div>
        )}

        {activeTrip ? (
          <Link href="/driver/trip" className="panel mt-3 block">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">Active trip</p>
            <p className="mt-1 text-[15px] font-semibold">
              {activeTrip.pickup.name} → {activeTrip.destination.name}
            </p>
            <p className="mt-1 text-[13px] text-ink/55">{formatPeso(activeTrip.fare)} · tap to continue</p>
          </Link>
        ) : (
          <Link href="/driver/requests" className="panel mt-3 block text-center">
            <p className="font-display text-[22px] font-extrabold text-brand">{openRequests}</p>
            <p className="text-[13px] text-ink/55">Open ride requests nearby</p>
          </Link>
        )}

        <p className="section-label">Today</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="panel !mt-0 text-center">
            <p className="font-display text-[22px] font-extrabold text-brand">{formatPeso(earningsToday)}</p>
            <p className="text-[12px] text-ink/50">Earnings</p>
          </div>
          <div className="panel !mt-0 text-center">
            <p className="font-display text-[22px] font-extrabold text-brand">{driver.plate}</p>
            <p className="text-[12px] text-ink/50">{driver.tricycle}</p>
          </div>
        </div>
      </div>
      <BottomTabs role="driver" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverHome />
    </RequireRole>
  );
}
