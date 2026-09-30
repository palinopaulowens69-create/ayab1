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
import { formatDate, formatPeso, initials } from '@/lib/utils';

function LucideStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3 2.2 5.7 6.1.4-4.7 3.9 1.5 5.9L12 15.6l-5.1 3.3 1.5-5.9-4.7-3.9 6.1-.4L12 3Z" />
    </svg>
  );
}

function Tracking() {
  const { currentUser, bookings, drivers, verifyBooking, startTrip, completeTrip, rateBooking } = useApp();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rated, setRated] = useState(false);
  const [discountIdShown, setDiscountIdShown] = useState(false);

  const booking = bookings
    .filter((b) => b.passengerId === currentUser?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const usesDiscountFare = Boolean(booking?.fareCategory && booking.fareCategory !== 'regular');

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
                  <p className="mt-1 text-[9px] font-medium text-slate-400">{usesDiscountFare ? 'Discounted fare' : 'Regular fare'}</p>
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

        <RideMap pickup={booking.pickup} destination={booking.destination} driver={driver} />

        <div className="panel">
          <p className="text-[13px] text-ink/50">Route</p>
          <p className="mt-0.5 text-[15px] font-semibold">
            {booking.pickup.name} → {booking.destination.name}
          </p>
          <div className="row">
            <span className="text-[13px] text-ink/60">Fare · {usesDiscountFare ? 'Discounted' : 'Regular'}</span>
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
                <button
                  onClick={() => verifyBooking(booking.id)}
                  disabled={usesDiscountFare && !discountIdShown}
                  className="btn-primary mt-3"
                >
                  <CheckIcon width={17} height={17} /> Verify driver&apos;s QR
                </button>
              </>
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
