// Binubuo nito ang Leaflet map, route markers, at driver location para sa booking at tracking screens.
'use client';

import { useEffect } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Driver, Place } from '@/lib/types';

// Leaflet map markers distinguish pickup, destination, and driver positions.
const pickupIcon = divIcon({
  className: 'ride-marker-wrap',
  html: '<span class="ride-marker ride-marker--pickup">P</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = divIcon({
  className: 'ride-marker-wrap',
  html: '<span class="ride-marker ride-marker--destination">D</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const driverIcon = divIcon({
  className: 'ride-marker-wrap',
  html: '<span class="ride-marker ride-marker--driver"><span></span></span>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

// Tumatanggap ng route points at key; inaayos ang map view para kasya sa screen ang pickup, destination, at driver.
function FitRideBounds({ points, boundsKey }: { points: [number, number][]; boundsKey: string }) {
  const map = useMap();

  useEffect(() => {
    // Keep all route points in view when a booking or driver location changes.
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(latLngBounds(points), { padding: [36, 36], maxZoom: 16 });
  }, [map, boundsKey]);

  return null;
}

// Tumatanggap ng pickup, destination, optional driver, at display mode; ibinabalik ang Leaflet map at mga marker.
export default function InteractiveRideMap({
  pickup,
  destination,
  driver,
  fullBleed = false,
}: {
  pickup: Place;
  destination: Place;
  driver: Driver | null;
  fullBleed?: boolean;
}) {
  const pickupPoint: [number, number] = [pickup.lat, pickup.lng];
  const destinationPoint: [number, number] = [destination.lat, destination.lng];
  const driverPoint: [number, number] | null = driver ? [driver.lat, driver.lng] : null;
  const points = [pickupPoint, destinationPoint, ...(driverPoint ? [driverPoint] : [])];
  // Nagbabago ang key kapag gumalaw ang alinmang marker kaya muling inaayos ang map bounds.
  const boundsKey = points.map((point) => point.join(',')).join('|');

  return (
    // Interactive map layer with route line, markers, driver popup, and compact legend.
    <div className={fullBleed ? 'ride-map-fullbleed' : 'ride-map-frame'}>
      <MapContainer
        center={[17.613, 121.727]}
        zoom={14}
        scrollWheelZoom
        zoomControl={!fullBleed}
        className={fullBleed ? 'ride-map-canvas ride-map-canvas--fullbleed' : 'ride-map-canvas'}
        aria-label="Map of Tuguegarao City showing the pickup, destination, and driver"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRideBounds points={points} boundsKey={boundsKey} />
        <Polyline positions={[pickupPoint, destinationPoint]} pathOptions={{ color: '#1769E0', weight: 5, opacity: 0.8 }} />
        {driverPoint && (
          <>
            <Polyline positions={[driverPoint, pickupPoint]} pathOptions={{ color: '#52647A', weight: 3, dashArray: '7 8', opacity: 0.8 }} />
            <Marker position={driverPoint} icon={driverIcon}>
              <Popup>
                <strong>{driver?.name}</strong>
                <br />{driver?.locationUpdatedAt ? 'Live GPS location' : 'Last shared location'}
              </Popup>
            </Marker>
          </>
        )}
        <Marker position={pickupPoint} icon={pickupIcon}>
          <Popup>Pickup · {pickup.name}</Popup>
        </Marker>
        <Marker position={destinationPoint} icon={destinationIcon}>
          <Popup>Destination · {destination.name}</Popup>
        </Marker>
      </MapContainer>
      {!fullBleed && (
        <div className="ride-map-key" aria-label="Map legend">
          {driver && <span><i className="ride-map-key-driver" /> Driver</span>}
          <span><i className="ride-map-key-pickup" /> Pickup</span>
          <span><i className="ride-map-key-destination" /> Destination</span>
        </div>
      )}
    </div>
  );
}
