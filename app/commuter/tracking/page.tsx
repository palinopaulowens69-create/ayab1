// Purpose: Track an active ride and submit a rating.
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { StepTracker } from '@/components/StepTracker';
import { RideMap } from '@/components/RideMap';
import { CheckIcon, PhoneIcon, StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatCountdown, formatDate, formatPeso, getRemainingSeconds, initials } from '@/lib/utils';


function LucideStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3 2.2 5.7 6.1.4-4.7 3.9 1.5 5.9L12 15.6l-5.1 3.3 1.5-5.9-4.7-3.9 6.1-.4L12 3Z" />
    </svg>
  );
}


function Tracking() {
  const { currentUser, bookings, drivers, verifyBooking, startTrip, completeTrip, rateBooking, cancelBooking } = useApp();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rated, setRated] = useState(false);
  const [discountIdShown, setDiscountIdShown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [rideProgress, setRideProgress] = useState(-1);
  const [pickupSeconds, setPickupSeconds] = useState(30);

  const booking = bookings
    .filter((b) => b.passengerId === currentUser?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const usesDiscountFare = Boolean(booking?.fareCategory && booking.fareCategory !== 'regular');

  const driver = drivers.find((d) => d.id === booking?.driverId);

  useEffect(() => {
    if (!booking) return;
    const syncCountdown = () => setCountdownSeconds(getRemainingSeconds(booking.cancellationDeadline));
    syncCountdown();
    const interval = window.setInterval(syncCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [booking?.id, booking?.cancellationDeadline]);

  
  
  const bookingRef = useRef(booking);
  bookingRef.current = booking;
  const completeTripRef = useRef(completeTrip);
  completeTripRef.current = completeTrip;

  useEffect(() => {
    if (!booking?.id || booking.status !== 'started') return;
    const bookingId = booking.id;
    const pickupDuration = 30_000;
    const rideDuration = 60_000;
    const startedAt = Date.now();
    setRideProgress(-1);
    setPickupSeconds(30);
    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      if (elapsed < pickupDuration) {
        setPickupSeconds(Math.ceil((pickupDuration - elapsed) / 1000));
        setRideProgress(-1);
        return;
      }
      setPickupSeconds(0);
      setRideProgress(Math.min(1, (elapsed - pickupDuration) / rideDuration));
    }, 250);
    const timeout = window.setTimeout(() => {
      if (bookingRef.current?.id === bookingId && bookingRef.current.status === 'started') {
        setRideProgress(1);
        completeTripRef.current(bookingId);
      }
    }, pickupDuration + rideDuration);
    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(timeout);
    }
  }, [booking?.id, booking?.status]);

  const mapDriver = driver && booking.status === 'started'
    ? {
        ...driver,
        lat: booking.pickup.lat + (booking.destination.lat - booking.pickup.lat) * Math.max(0, rideProgress),
        lng: booking.pickup.lng + (booking.destination.lng - booking.pickup.lng) * Math.max(0, rideProgress),
      }
    : driver;

  
  function submitRating() {
    if (!booking) return;
    
    const feedback = [...selectedTags, review.trim()].filter(Boolean).join(' · ');
    rateBooking(booking.id, rating, feedback);
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

  if (booking.status === 'completed') {
    const receiptDriver = driver ?? drivers.find((d) => d.id === 'd2');
    const hasRated = rated || Boolean(booking.rating);
    const ratingTags = ['Safe Driver', 'Punctual', 'Friendly', 'Clean Ride'];
    const visibleRating = hoverRating || rating;

    
    function toggleRatingTag(tag: string) {
      setSelectedTags((tags) => tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]);
    }

    return (
      <div className="shell bg-slate-50">
        <PageHeader title="Trip receipt" />
        <div className="page-body !px-4 !pb-8 !pt-5">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-4 flex flex-col items-center text-center">
              <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon width={21} height={21} />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Ride completed</p>
              <h2 className="mt-1 font-display text-[21px] font-extrabold tracking-tight text-slate-800">How was your trip?</h2>
              <p className="mt-1 text-[12px] text-slate-500">Your feedback helps keep every ride better.</p>
            </div>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" aria-label="Trip receipt details">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">AYAB · E-Receipt</p>
                <p className="text-[10px] text-slate-400">{formatDate(booking.createdAt)}</p>
              </div>
              <div className="my-3 h-px border-t border-dashed border-slate-200" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Route</p>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <p className="truncate text-[13px] font-semibold text-slate-800">{booking.pickup.name}</p>
                  <p className="truncate text-[13px] font-semibold text-slate-800">{booking.destination.name}</p>
                </div>
                <div aria-hidden="true" className="flex flex-col items-center gap-1 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white" />
                  <span className="h-4 border-l border-dashed border-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display text-[22px] font-extrabold leading-none tracking-tight text-[#1769e0]">{formatPeso(booking.fare)}</p>
                  <p className="mt-1 text-[9px] font-medium text-slate-400">
                    {booking.specialRide ? 'Special ride' : usesDiscountFare ? 'Discounted fare' : 'Regular fare'}
                  </p>
                </div>
              </div>
              <div className="my-3 h-px border-t border-dashed border-slate-200" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium text-slate-400">Booking code</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-slate-600">{booking.id}</span>
              </div>
            </section>

            {receiptDriver && (
              <section className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" aria-label="Driver details">
                <div className="flex items-center gap-3">
                  <div role="img" aria-label={`${receiptDriver.name} profile photo placeholder`} className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#dcecff] via-[#b5d4f5] to-[#83afe0] ring-2 ring-white shadow-[0_3px_12px_rgba(37,99,170,0.18)]">
                    <svg viewBox="0 0 48 48" className="h-11 w-11 text-white/95" fill="currentColor" aria-hidden="true">
                      <circle cx="24" cy="17" r="8" />
                      <path d="M8 43c.9-9.1 7-14 16-14s15.1 4.9 16 14H8Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-slate-800">{receiptDriver.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <LucideStar className="h-4 w-4 fill-[#f5b82e] text-[#e6a817] drop-shadow-[0_0_5px_rgba(245,184,46,0.45)]" />
                      {receiptDriver.rating.toFixed(1)} <span className="font-normal text-slate-400">·</span> {receiptDriver.tricycle}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-medium text-slate-400">Vehicle plate</span>
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-slate-600">{receiptDriver.plate}</span>
                </div>
              </section>
            )}

            
            <section className="mt-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" aria-label="Rate your trip">
              {hasRated ? (
                <div className="py-3 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1769e0]"><CheckIcon width={19} height={19} /></span>
                  <h3 className="mt-3 font-display text-[15px] font-bold text-slate-800">Thanks for your feedback!</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Your rating has been submitted.</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h3 className="font-display text-[15px] font-bold text-slate-800">Rate your ride</h3>
                    <p className="mt-1 text-[11px] text-slate-500">Tap a star to share your experience.</p>
                    <div className="mt-3 flex items-center justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((value) => {
                        const selected = value <= visibleRating;
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-label={`${value} star${value === 1 ? '' : 's'}`}
                            aria-pressed={rating === value}
                            onMouseEnter={() => setHoverRating(value)}
                            onFocus={() => setHoverRating(value)}
                            onBlur={() => setHoverRating(0)}
                            onClick={() => setRating(value)}
                            className={`rounded-lg p-1 transition-transform duration-200 active:scale-125 ${selected ? 'scale-110 text-[#f5b82e]' : 'text-slate-200 hover:scale-110 hover:text-[#f5b82e]'}`}
                          >
                            <LucideStar className={`h-8 w-8 transition-colors duration-200 ${selected ? 'fill-[#f5b82e] text-[#e6a817]' : 'fill-transparent'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {ratingTags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleRatingTag(tag)}
                          className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors ${active ? 'border-blue-300 bg-blue-50 text-[#1769e0]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#1769e0]'}`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <label htmlFor="ride-review" className="sr-only">Optional trip review</label>
                  <textarea
                    id="ride-review"
                    rows={3}
                    className="mt-4 block w-full resize-none rounded-xl border-0 bg-slate-100 px-3.5 py-3 text-[12px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave a short review (optional)"
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={submitRating}
                    className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1769e0] px-4 text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(23,105,224,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#125cc9] hover:shadow-[0_9px_20px_rgba(23,105,224,0.23)] active:translate-y-0 active:scale-[0.99]"
                  >
                    Submit Rating
                  </button>
                </>
              )}
            </section>

            <Link href="/commuter/home" className="mt-6 flex min-h-11 items-center justify-center text-[12px] font-semibold text-slate-500 transition hover:text-[#1769e0]">Back to Home</Link>
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

        
        <RideMap
          pickup={booking.pickup}
          destination={booking.destination}
          driver={mapDriver}
          driverOnTrip={booking.status === 'started'}
          simulatedDriver={booking.status === 'started'}
        />

        {booking.status === 'confirmed' && (
          <div className="panel" role="status" aria-live="polite">
            <p className="text-center text-[13px] font-semibold text-ink">Your trip is ready to proceed.</p>
            <button type="button" onClick={() => startTrip(booking.id)} className="btn-primary mt-3 w-full">
              Proceed
            </button>
          </div>
        )}
        {booking.status === 'started' && (
          <div className="panel" role="status" aria-live="polite">
            <p className="text-center text-[13px] font-semibold text-ink">
              {rideProgress < 0
                ? `Your driver is picking you up · ${pickupSeconds}s`
                : `On the way to ${booking.destination.name} · ${Math.round(rideProgress * 100)}%`}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Simulated trip progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.round(rideProgress * 100))}
            >
              <div className="h-full rounded-full bg-[#1769e0] transition-[width] duration-300" style={{ width: `${Math.max(0, rideProgress * 100)}%` }} />
            </div>
          </div>
        )}

        
        <div className="panel">
          <p className="text-[13px] text-ink/50">Route</p>
          <p className="mt-0.5 text-[15px] font-semibold">
            {booking.pickup.name} → {booking.destination.name}
          </p>
          <div className="row">
            <span className="text-[13px] text-ink/60">
              {booking.specialRide ? 'Special ride offer' : `Fare · ${usesDiscountFare ? 'Discounted' : 'Regular'}`}
            </span>
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
              <>
                {usesDiscountFare && (
                  <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl border border-brand/15 bg-brand/5 p-3 text-[12px] leading-5 text-ink/75">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-brand"
                      checked={discountIdShown}
                      onChange={(event) => setDiscountIdShown(event.target.checked)}
                    />
                    <span>I have shown my valid student, senior citizen, or PWD ID to the driver.</span>
                  </label>
                )}
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                  Payment is required before the ride can be verified.
                </div>
                <button
                  onClick={() => verifyBooking(booking.id)}
                  disabled={usesDiscountFare && !discountIdShown}
                  className="btn-primary mt-3"
                >
                  <CheckIcon width={17} height={17} /> Pay {formatPeso(booking.fare)} now
                </button>
              </>
            )}
            {booking.status === 'verified' && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-[12px] text-emerald-800">
                <p className="font-semibold">Trip verified</p>
                <p className="mt-1">Cancellation grace period: {formatCountdown(countdownSeconds)}</p>
              </div>
            )}
            {booking.status === 'verified' && countdownSeconds === 0 && (
              <p className="mt-3 text-center text-[13px] text-ink/50">Grace period ended. Trip confirmed.</p>
            )}
            {booking.status === 'confirmed' && (
              <p className="mt-3 text-center text-[13px] text-ink/50">Grace period ended. Your trip is confirmed.</p>
            )}
            {booking.status === 'verified' && countdownSeconds > 0 && (
              <button onClick={() => cancelBooking(booking.id)} className="btn-outline mt-3 w-full">
                Cancel within grace period
              </button>
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

        {booking.status === 'cancelled' && (
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
