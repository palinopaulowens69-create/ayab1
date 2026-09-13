'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { StepTracker } from '@/components/StepTracker';
import { CheckIcon, PhoneIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso, initials } from '@/lib/utils';

function Trip() {
  const { currentUser, bookings, users, verifyBooking, startTrip, completeTrip } = useApp();
  const router = useRouter();

  const trip = bookings
    .filter((b) => b.driverId === currentUser?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .find((b) => ['accepted', 'verified', 'started', 'completed'].includes(b.status));

  if (!trip) {
    return (
      <div className="shell">
        <PageHeader title="Active trip" backHref="/driver/home" />
        <div className="page-body">
          <div className="empty-state">
            <p className="font-semibold text-ink">No active trip</p>
            <p className="text-[13px]">Accept a request to start driving.</p>
          </div>
        </div>
      </div>
    );
  }

  const passenger = users.find((u) => u.id === trip.passengerId);

  return (
    <div className="shell">
      <PageHeader title="Active trip" backHref="/driver/home" />
      <div className="page-body">
        <div className="panel !mt-0">
          <StepTracker status={trip.status} />
        </div>

        <div className="panel">
          <div className="flex items-center gap-3">
            <div className="avatar">{initials(trip.passengerName)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{trip.passengerName}</p>
              <p className="text-[13px] text-ink/55">
                {trip.pickup.name} → {trip.destination.name}
              </p>
            </div>
            {passenger?.phone && (
              <a href={`tel:${passenger.phone}`} className="topbar-btn !text-brand" aria-label="Call passenger">
                <PhoneIcon />
              </a>
            )}
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Fare</span>
            <span className="ml-auto font-display text-[16px] font-bold text-brand">
              {formatPeso(trip.fare)}
            </span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Booking code</span>
            <span className="ml-auto data-chip">{trip.id}</span>
          </div>
        </div>

        {trip.status === 'accepted' && (
          <button onClick={() => verifyBooking(trip.id)} className="btn-primary mt-2">
            <CheckIcon width={17} height={17} /> Scan passenger QR to verify
          </button>
        )}
        {trip.status === 'verified' && (
          <button onClick={() => startTrip(trip.id)} className="btn-primary mt-2">
            Start trip
          </button>
        )}
        {trip.status === 'started' && (
          <button onClick={() => completeTrip(trip.id)} className="btn-primary mt-2">
            Complete trip
          </button>
        )}
        {trip.status === 'completed' && (
          <button onClick={() => router.push('/driver/home')} className="btn-outline mt-2">
            Back to home
          </button>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <Trip />
    </RequireRole>
  );
}
