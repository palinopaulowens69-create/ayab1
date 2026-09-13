'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { StepTracker } from '@/components/StepTracker';
import { CheckIcon, PhoneIcon, StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso, initials } from '@/lib/utils';

function Tracking() {
  const { currentUser, bookings, drivers, verifyBooking, startTrip, completeTrip, rateBooking } = useApp();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);

  const booking = bookings
    .filter((b) => b.passengerId === currentUser?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const driver = drivers.find((d) => d.id === booking?.driverId);

  // Latest booking snapshot for timers below, so stale closures don't
  // clobber a status a real driver already advanced from another tab.
  const bookingRef = useRef(booking);
  bookingRef.current = booking;

  useEffect(() => {
    if (!booking) return;
    if (booking.status === 'verified') {
      const t = window.setTimeout(() => {
        if (bookingRef.current?.id === booking.id && bookingRef.current.status === 'verified') {
          startTrip(booking.id);
        }
      }, 2500);
      return () => window.clearTimeout(t);
    }
    if (booking.status === 'started') {
      const t = window.setTimeout(() => {
        if (bookingRef.current?.id === booking.id && bookingRef.current.status === 'started') {
          completeTrip(booking.id);
        }
      }, Math.max(3000, booking.distance * 1800));
      return () => window.clearTimeout(t);
    }
  }, [booking, startTrip, completeTrip]);

  function submitRating() {
    if (!booking) return;
    rateBooking(booking.id, rating, review);
    setRated(true);
  }

  if (!booking) {
    return (
      <div className="shell">
        <PageHeader title="Track trip" backHref="/commuter/home" />
        <div className="page-body">
          <div className="empty-state">
            <p className="font-semibold text-ink">No trips yet</p>
            <p className="text-[13px]">Book a ride to see live tracking here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <PageHeader title="Track trip" backHref="/commuter/home" />
      <div className="page-body">
        <div className="panel !mt-0">
          <StepTracker status={booking.status} />
        </div>

        <div className="mock-map mt-3">
          <div className="mock-map-road" />
          <div className="mock-map-pin" style={{ left: '30%', top: '35%' }} />
          {driver && <div className="mock-map-pin is-driver" style={{ left: '60%', top: '60%' }} />}
        </div>

        <div className="panel">
          <p className="text-[13px] text-ink/50">Route</p>
          <p className="mt-0.5 text-[15px] font-semibold">
            {booking.pickup.name} → {booking.destination.name}
          </p>
          <div className="row">
            <span className="text-[13px] text-ink/60">Fare</span>
            <span className="ml-auto font-display text-[16px] font-bold text-brand">
              {formatPeso(booking.fare)}
            </span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Booking code</span>
            <span className="ml-auto data-chip">{booking.id}</span>
          </div>
        </div>

        {driver ? (
          <div className="panel">
            <div className="flex items-center gap-3">
              <div className="avatar">{initials(driver.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{driver.name}</p>
                <p className="flex items-center gap-1 text-[13px] text-ink/55">
                  <StarIcon width={13} height={13} className="text-gold" /> {driver.rating.toFixed(1)} ·{' '}
                  {driver.tricycle}
                </p>
              </div>
              <a href={`tel:${driver.phone}`} className="topbar-btn !text-brand" aria-label="Call driver">
                <PhoneIcon />
              </a>
            </div>
            <p className="mt-2 data-chip">{driver.plate}</p>

            {booking.status === 'accepted' && (
              <button onClick={() => verifyBooking(booking.id)} className="btn-primary mt-3">
                <CheckIcon width={17} height={17} /> Verify driver&apos;s QR
              </button>
            )}
            {booking.status === 'verified' && (
              <p className="mt-3 text-center text-[13px] text-ink/50">Driver verified. Starting trip…</p>
            )}
            {booking.status === 'started' && (
              <p className="mt-3 text-center text-[13px] text-ink/50">Enjoy your ride!</p>
            )}
          </div>
        ) : booking.status === 'searching' ? (
          <div className="empty-state">
            <p className="font-semibold text-ink">Looking for a nearby driver…</p>
            <p className="text-[13px]">This usually takes less than a minute.</p>
          </div>
        ) : null}

        {booking.status === 'completed' && !rated && (
          <div className="panel">
            <p className="text-[14px] font-semibold">Rate your trip</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <StarIcon
                    width={26}
                    height={26}
                    className={n <= rating ? 'text-gold' : 'text-line'}
                  />
                </button>
              ))}
            </div>
            <textarea
              className="input mt-3"
              placeholder="Leave a short review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <button onClick={submitRating} className="btn-primary mt-3">
              Submit rating
            </button>
          </div>
        )}

        {(booking.status === 'completed' || booking.status === 'cancelled') && (
          <button onClick={() => router.push('/commuter/home')} className="btn-outline mt-4">
            Back to home
          </button>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <Tracking />
    </RequireRole>
  );
}
