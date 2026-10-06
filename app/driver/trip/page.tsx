// Purpose: Manage an active ride.
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { StepTracker } from '@/components/StepTracker';
import { RideMap } from '@/components/RideMap';
import { PhoneIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso, initials } from '@/lib/utils';
import { fetchDrivingRoute, type DrivingRoute } from '@/lib/routing';


function Trip() {
  const { currentUser, bookings, users, drivers, updateDriverLocation, startTrip, completeTrip } = useApp();
  const router = useRouter();
  const lastLocationSent = useRef(0);
  const [roadRoute, setRoadRoute] = useState<DrivingRoute | null>(null);
  const [routeError, setRouteError] = useState('');
  const [routeRetry, setRouteRetry] = useState(0);

  const trip = bookings
    .filter((b) => b.driverId === currentUser?.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .find((b) => ['accepted', 'verified', 'confirmed', 'started', 'completed'].includes(b.status));

  const passenger = users.find((u) => u.id === trip?.passengerId);
  const driver = drivers.find((d) => d.id === currentUser?.id);

  useEffect(() => {
    const activeTrip = trip;
    if (!activeTrip) {
      setRoadRoute(null);
      setRouteError('');
      return;
    }

    const controller = new AbortController();
    const pickup: [number, number] = [activeTrip.pickup.lat, activeTrip.pickup.lng];
    const destination: [number, number] = [activeTrip.destination.lat, activeTrip.destination.lng];
    setRoadRoute(null);
    setRouteError('');

    async function loadRoadRoute() {
      try {
        const route = await fetchDrivingRoute(
          pickup,
          destination,
          controller.signal,
        );
        if (!controller.signal.aborted) setRoadRoute(route);
      } catch (error) {
        if (controller.signal.aborted) return;
        setRouteError(error instanceof Error ? error.message : 'Unable to load the driving route.');
      }
    }

    void loadRoadRoute();
    return () => controller.abort();
  }, [
    trip?.id,
    trip?.pickup.lat,
    trip?.pickup.lng,
    trip?.destination.lat,
    trip?.destination.lng,
    routeRetry,
  ]);

  useEffect(() => {
    if (!trip || !driver?.online || trip.status === 'completed' || !currentUser || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        
        if (now - lastLocationSent.current < 5000) return;
        lastLocationSent.current = now;
        updateDriverLocation(currentUser.id, position.coords.latitude, position.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [trip?.id, trip?.status, driver?.online, currentUser?.id, updateDriverLocation]);

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

  return (
    <div className="shell">
      <PageHeader title="Active trip" backHref="/driver/home" />
      <div className="page-body">
        <div className="panel !mt-0">
          <StepTracker status={trip.status} />
        </div>

        <RideMap
          pickup={roadRoute ? { ...trip.pickup, lat: roadRoute.pickup[0], lng: roadRoute.pickup[1] } : trip.pickup}
          destination={roadRoute ? { ...trip.destination, lat: roadRoute.destination[0], lng: roadRoute.destination[1] } : trip.destination}
          driver={driver}
          route={roadRoute?.points}
          hideUnroutedLine
        />
        {routeError && (
          <div className="panel" role="alert">
            <p className="text-[13px] font-semibold text-rose-700">Unable to load the driving route.</p>
            <p className="mt-1 text-[12px] text-ink/60">{routeError}</p>
            <button type="button" onClick={() => setRouteRetry((attempt) => attempt + 1)} className="btn-outline mt-3 w-full">
              Retry route
            </button>
          </div>
        )}
        {trip.status !== 'completed' && (
          <p className="mt-2 text-[11px] leading-4 text-ink/50">Allow location access and keep this trip open to share your live driver position.</p>
        )}

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
            <span className="text-[13px] text-ink/60">{trip.specialRide ? 'Special ride offer' : 'Fare'}</span>
            <span className="ml-auto font-display text-[16px] font-bold text-brand">
              {formatPeso(trip.fare)}
            </span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Passengers</span>
            <span className="ml-auto text-[13px] text-ink/60">{trip.passengerCount}</span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Booking code</span>
            <span className="ml-auto data-chip">{trip.id}</span>
          </div>
        </div>

        
        {trip.status === 'accepted' && (
          <p className="panel mt-2 text-center text-[13px] text-ink/60">Waiting for the commuter to complete payment and verification.</p>
        )}
        {trip.status === 'verified' && (
          <p className="panel mt-2 text-center text-[13px] text-ink/60">Payment verified. The commuter cancellation grace period is active.</p>
        )}
        {trip.status === 'confirmed' && (
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
