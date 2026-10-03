// Nagbibigay ito ng shared wrapper na naglo-load ng interactive map sa browser lang.
'use client';

import dynamic from 'next/dynamic';
import type { Driver, Place } from '@/lib/types';

// Load Leaflet only in the browser and show a placeholder while its map bundle loads.
const InteractiveRideMap = dynamic(() => import('./InteractiveRideMap'), {
  ssr: false,
  loading: () => <div className="ride-map-loading" aria-label="Loading Tuguegarao map" />,
});

// Tumatanggap ng route points at optional driver; ibinabalik ang browser-only interactive map.
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
    // Stable wrapper lets screens choose an inset map or an edge-to-edge map.
    <div className={fullBleed ? 'ride-map-fullbleed' : undefined}>
      <InteractiveRideMap pickup={pickup} destination={destination} driver={driver ?? null} fullBleed={fullBleed} />
    </div>
  );
}
