'use client';

import dynamic from 'next/dynamic';
import type { Driver, Place } from '@/lib/types';

const InteractiveRideMap = dynamic(() => import('./InteractiveRideMap'), {
  ssr: false,
  loading: () => <div className="ride-map-loading" aria-label="Loading Tuguegarao map" />,
});

export function RideMap({
  pickup,
  destination,
  driver,
  fullBleed = false,
}: {
  pickup: Place;
  destination: Place;
  driver?: Driver | null;
  fullBleed?: boolean;
}) {
  return (
    <div className={fullBleed ? 'ride-map-fullbleed' : undefined}>
      <InteractiveRideMap pickup={pickup} destination={destination} driver={driver ?? null} fullBleed={fullBleed} />
    </div>
  );
}
