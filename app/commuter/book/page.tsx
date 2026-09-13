'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { PLACES } from '@/lib/mock-data';
import { useApp } from '@/lib/store';
import { distanceKm, estimateFare, formatPeso } from '@/lib/utils';

function BookRide() {
  const { drivers, createBooking, acceptBooking } = useApp();
  const router = useRouter();
  const [pickupId, setPickupId] = useState(PLACES[0].id);
  const [destinationId, setDestinationId] = useState(PLACES[2].id);
  const [requesting, setRequesting] = useState(false);

  const pickup = PLACES.find((p) => p.id === pickupId)!;
  const destination = PLACES.find((p) => p.id === destinationId)!;
  const sameStop = pickupId === destinationId;

  const { distance, fare } = useMemo(() => {
    const d = Math.max(0.3, distanceKm(pickup, destination));
    return { distance: d, fare: estimateFare(d) };
  }, [pickup, destination]);

  const availableDrivers = drivers.filter((d) => d.online && d.verified);

  function requestRide() {
    if (sameStop) return;
    setRequesting(true);
    const booking = createBooking(pickup, destination);
    router.push('/commuter/tracking');

    // Simulate a driver in the area accepting the request shortly after.
    const candidate = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    if (candidate) {
      window.setTimeout(() => {
        acceptBooking(booking.id, candidate.id);
      }, 2200);
    }
  }

  return (
    <div className="shell">
      <PageHeader title="Book a ride" backHref="/commuter/home" />
      <div className="page-body">
        <div className="mock-map">
          <div className="mock-map-road" />
          <div className="mock-map-pin" style={{ left: '32%', top: '38%' }} />
          <div className="mock-map-pin is-driver" style={{ left: '64%', top: '58%' }} />
        </div>

        <p className="section-label">Pickup</p>
        <select className="input" value={pickupId} onChange={(e) => setPickupId(e.target.value)}>
          {PLACES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <p className="section-label">Destination</p>
        <select className="input" value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
          {PLACES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {sameStop && (
          <p className="mt-2 text-[13px] text-danger">Pickup and destination can&apos;t be the same place.</p>
        )}

        <div className="panel mt-4">
          <div className="row">
            <span className="text-[13px] text-ink/60">Distance</span>
            <span className="ml-auto text-[14px] font-semibold">{distance.toFixed(1)} km</span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Estimated fare</span>
            <span className="ml-auto font-display text-[18px] font-extrabold text-brand">
              {formatPeso(fare)}
            </span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Drivers online</span>
            <span className="ml-auto text-[14px] font-semibold">{availableDrivers.length}</span>
          </div>
        </div>

        <button
          onClick={requestRide}
          disabled={sameStop || requesting || availableDrivers.length === 0}
          className="btn-primary mt-4"
        >
          {availableDrivers.length === 0 ? 'No drivers online right now' : 'Request tricycle'}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <BookRide />
    </RequireRole>
  );
}
