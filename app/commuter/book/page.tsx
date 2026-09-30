'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RideMap } from '@/components/RideMap';
import { BackIcon, MapPinIcon } from '@/components/Icons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PLACES } from '@/lib/mock-data';
import { useApp } from '@/lib/store';
import { estimateFareForCategory, formatPeso } from '@/lib/utils';
import type { FareCategory, Place } from '@/lib/types';

function PlaceSearch({
  label,
  selectedPlace,
  onSelect,
  marker,
}: {
  label: string;
  selectedPlace: Place;
  onSelect: (placeId: string) => void;
  marker: 'pickup' | 'destination';
}) {
  const [query, setQuery] = useState(selectedPlace.name);
  const [open, setOpen] = useState(false);
  const idPrefix = label.toLowerCase().replace(/\s+/g, '-');
  const matches = PLACES.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 7);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-3 py-2.5">
        {marker === 'pickup' ? (
          <span aria-hidden="true" className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1769e0] ring-[3px] ring-blue-100" />
          </span>
        ) : (
          <MapPinIcon aria-hidden="true" className="shrink-0 text-[#e34c4c]" width={20} height={20} />
        )}
        <div className="min-w-0 flex-1">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94a0ae]" htmlFor={`${idPrefix}-search`}>{label}</label>
          <input
            id={`${idPrefix}-search`}
            className="block h-6 w-full border-0 bg-transparent p-0 text-[13px] font-semibold text-[#26384f] outline-none placeholder:text-[#9aa6b4] focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls={`${idPrefix}-suggestions`}
            aria-autocomplete="list"
            placeholder={`Search ${label.toLowerCase()}`}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => { setQuery(event.target.value); onSelect(''); setOpen(true); }}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          />
        </div>
      </div>
      {open && query.trim() && matches.length > 0 && (
        <ul id={`${idPrefix}-suggestions`} role="listbox" className="absolute inset-x-0 top-full z-[80] mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#e6ebf1] bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {matches.map((place) => (
            <li key={place.id} role="option" aria-selected={place.id === selectedPlace.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#f4f7fb] dark:hover:bg-slate-700"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => { onSelect(place.id); setQuery(place.name); setOpen(false); }}
              >
                <MapPinIcon width={16} height={16} className={marker === 'pickup' ? 'text-[#1769e0]' : 'text-[#e34c4c]'} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#34465c] dark:text-slate-200">{place.name}</span>
                <span className="shrink-0 text-[10px] text-[#8491a1] dark:text-slate-400">{formatPeso(place.regularFare)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && matches.length === 0 && (
        <p className="absolute inset-x-0 top-full z-[80] mt-1 rounded-xl border border-[#e6ebf1] bg-white px-3 py-3 text-[12px] text-[#738196] shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">No matching places. Try another barangay.</p>
      )}
    </div>
  );
}

function BookRide() {
  const { drivers, createBooking, acceptBooking } = useApp();
  const router = useRouter();
  const [pickupId, setPickupId] = useState(PLACES[0].id);
  const [destinationId, setDestinationId] = useState(PLACES[2].id);
  const [fareCategory, setFareCategory] = useState<FareCategory>('regular');
  const [requesting, setRequesting] = useState(false);

  const pickup = PLACES.find((p) => p.id === pickupId) ?? PLACES[0];
  const destination = PLACES.find((p) => p.id === destinationId) ?? PLACES[2];
  const hasBothPlaces = Boolean(pickupId && destinationId);
  const sameStop = hasBothPlaces && pickupId === destinationId;
  const fare = estimateFareForCategory(destination, fareCategory);
  const availableDrivers = drivers.filter((d) => d.online && d.verified);

  function requestRide() {
    if (!hasBothPlaces || sameStop || availableDrivers.length === 0 || requesting) return;
    setRequesting(true);
    const booking = createBooking(pickup, destination, fareCategory);
    router.push('/commuter/tracking');

    const candidate = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    if (candidate) {
      window.setTimeout(() => acceptBooking(booking.id, candidate.id), 2200);
    }
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#e8edf1] dark:bg-[#0F172A]">
      <RideMap pickup={pickup} destination={destination} fullBleed />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-white/35 to-transparent px-4 pb-12 pt-[max(14px,env(safe-area-inset-top))] dark:from-slate-950/45">
        <section className="pointer-events-auto mx-auto w-full max-w-[448px] rounded-xl border border-white/80 bg-white shadow-md shadow-slate-900/10 dark:border-slate-700/70 dark:bg-slate-800 dark:shadow-black/30">
          <div className="flex items-center gap-3 px-3 pb-2 pt-3">
            <Link href="/commuter/home" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#53657b] transition hover:bg-[#f1f5f9] hover:text-[#1769e0] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" aria-label="Back to home">
              <BackIcon width={20} height={20} />
            </Link>
            <div>
              <h1 className="font-display text-[15px] font-bold text-[#25374e] dark:text-slate-100">Book a ride</h1>
              <p className="text-[11px] text-[#8996a6] dark:text-slate-400">Tuguegarao City</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="rounded-full bg-[#f1f6fd] px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-[#4778b4] dark:bg-slate-700 dark:text-blue-200">TRICYCLE</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="relative px-2 pb-2">
            <div aria-hidden="true" className="absolute left-[21px] top-[25px] z-0 h-[39px] border-l border-[#c7d2df] dark:border-slate-500" />
            <div className="relative divide-y divide-[#edf0f4] rounded-lg bg-[#f8fafc] dark:divide-slate-700 dark:bg-slate-900/70">
              <PlaceSearch label="Pickup point" selectedPlace={pickup} onSelect={setPickupId} marker="pickup" />
              <PlaceSearch label="Destination" selectedPlace={destination} onSelect={setDestinationId} marker="destination" />
            </div>
          </div>
        </section>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] rounded-t-[26px] border border-white/80 bg-white px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(20,43,72,0.16)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40 sm:px-6">
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#d8dee7] dark:bg-slate-600" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold text-[#26384f] dark:text-slate-100">Passenger fare</h2>
          <span className="rounded-full bg-[#f3f6fa] px-2.5 py-1 text-[10px] font-medium text-[#78879a] dark:bg-slate-700 dark:text-slate-300">Per ride</span>
        </div>

        <div role="group" aria-label="Passenger fare type" className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#f1f4f8] p-1.5 dark:bg-slate-900">
          {([
            ['regular', 'Regular', 'Standard fare'],
            ['discounted', 'Discounted', 'Student · Senior · PWD'],
          ] as [FareCategory, string, string][]).map(([value, label, detail]) => {
            const selected = fareCategory === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setFareCategory(value)}
                className={`flex min-h-[54px] flex-col items-start justify-center rounded-xl px-3 text-left transition duration-150 ${selected ? 'bg-[#1769e0] text-white shadow-sm dark:bg-[#3B82C4]' : 'text-[#65758a] hover:bg-white/80 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                <span className="text-[12px] font-semibold leading-4">{label}</span>
                <span className={`mt-0.5 text-[9px] leading-3 ${selected ? 'text-white/75' : 'text-[#93a0af] dark:text-slate-400'}`}>{detail}</span>
              </button>
            );
          })}
        </div>

        {fareCategory === 'discounted' && (
          <p className="mt-2 text-[10px] leading-4 text-[#8794a4] dark:text-slate-400">Please show a valid student, senior citizen, or PWD ID to your driver.</p>
        )}

        <div className="my-4 h-px bg-[#edf0f4] dark:bg-slate-700" />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-[#7b899a] dark:text-slate-400">Estimated Fare</span>
            <span className="font-display text-[23px] font-extrabold leading-none tracking-[-0.025em] text-[#1b2e47] dark:text-slate-100">{formatPeso(fare)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-[#7b899a] dark:text-slate-400">Nearby Drivers</span>
            <span className="text-[12px] font-semibold text-[#3a4d64] dark:text-slate-200">{availableDrivers.length} drivers available</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[#a0aab6] dark:text-slate-500">Fare matrix - Effective June 20, 2026</p>

        {sameStop && <p className="mt-2 text-[11px] text-red-600 dark:text-red-300">Pickup and destination can&apos;t be the same place.</p>}

        <button
          onClick={requestRide}
          disabled={!hasBothPlaces || sameStop || requesting || availableDrivers.length === 0}
          className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1769e0] px-5 text-[14px] font-bold text-white shadow-[0_7px_18px_rgba(23,105,224,0.24)] transition duration-150 hover:scale-[1.01] hover:bg-[#125cc9] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3B82C4] dark:hover:bg-[#4B91D1]"
        >
          {availableDrivers.length === 0 ? 'No drivers available' : requesting ? 'Requesting ride…' : 'Request Tricycle'}
          {availableDrivers.length > 0 && !requesting && <span aria-hidden="true">{'\u2192'}</span>}
        </button>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <BookRide />
    </RequireRole>
  );
}
