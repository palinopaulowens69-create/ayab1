// Purpose: Show driver status, requests, and earnings.
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { MapPinIcon, StarIcon } from '@/components/Icons';
import { PLACES } from '@/lib/mock-data';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';
import type { Booking } from '@/lib/types';

type MatchingMode = 'auto' | 'manual';


function DriverHome() {
  const { currentUser, drivers, bookings, toggleDriverOnline, acceptBooking } = useApp();
  const router = useRouter();
  const [matchingMode, setMatchingMode] = useState<MatchingMode>('manual');
  const [matchingReady, setMatchingReady] = useState(false);
  const [showIncomingRequest, setShowIncomingRequest] = useState(false);
  const [incomingSeconds, setIncomingSeconds] = useState(20);
  const [demoAccepted, setDemoAccepted] = useState(false);
  const driver = drivers.find((d) => d.id === currentUser?.id);
  const nearbyRequests = bookings.filter((b) => b.status === 'searching');
  const activeTrip = bookings.find(
    (b) => b.driverId === currentUser?.id && ['accepted', 'verified', 'confirmed', 'started'].includes(b.status),
  );
  const firstNearbyRequest = nearbyRequests[0];
  const earningsToday = bookings
    .filter((b) => b.driverId === currentUser?.id && b.status === 'completed')
    .reduce((sum, b) => sum + b.fare, 0);

  useEffect(() => {
    if (!driver) return;
    const savedMode = window.localStorage.getItem(`ayab_driver_matching_mode_${driver.id}`);
    if (savedMode === 'auto' || savedMode === 'manual') setMatchingMode(savedMode);
    setMatchingReady(true);
  }, [driver?.id]);

  useEffect(() => {
    if (!matchingReady || !driver) return;
    window.localStorage.setItem(`ayab_driver_matching_mode_${driver.id}`, matchingMode);
  }, [matchingMode, matchingReady, driver?.id]);

  useEffect(() => {
    if (!matchingReady || matchingMode !== 'auto' || !driver?.online || !currentUser || activeTrip || !firstNearbyRequest) return;
    acceptBooking(firstNearbyRequest.id, currentUser.id);
    router.replace('/driver/trip');
  }, [matchingReady, matchingMode, driver?.online, currentUser, activeTrip, firstNearbyRequest?.id, acceptBooking, router]);

  useEffect(() => {
    if (!showIncomingRequest) return;
    setIncomingSeconds(20);
    const interval = window.setInterval(() => setIncomingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    const timeout = window.setTimeout(() => setShowIncomingRequest(false), 20000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [showIncomingRequest]);

  function acceptNearbyRequest(request: Booking) {
    if (!currentUser || !driver?.online || activeTrip) return;
    acceptBooking(request.id, currentUser.id);
    router.push('/driver/trip');
  }

  if (!driver) return null;

  return (
    <div className="shell bg-slate-50">
      <PageHeader title="AYAB Driver" />
      <div className="page-body space-y-5 !px-4 !pb-28 !pt-5">
        
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1769e0] via-[#206fd9] to-[#104da9] p-5 text-white shadow-[0_12px_28px_rgba(23,92,190,0.2)]">
          <span aria-hidden="true" className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[26px] border-white/[0.08]" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div role="img" className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-[#d7ebff] to-[#8dbbf2] text-[16px] font-extrabold tracking-wide text-[#164d91] shadow-inner" aria-label={`${driver.name} profile image placeholder`}>
                {driver.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-blue-100">{driver.verified ? 'Verified driver' : 'Pending verification'}</p>
                <h2 className="truncate font-display text-[17px] font-bold leading-tight">{driver.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                  <StarIcon width={13} height={13} className="fill-[#ffd36b] text-[#ffd36b]" />
                  {driver.rating.toFixed(1)} <span className="text-white/50">·</span> {driver.completedTrips} trips
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={driver.online}
              aria-label={driver.online ? 'Go offline' : 'Go online'}
              onClick={() => driver.verified && toggleDriverOnline(driver.id)}
              disabled={!driver.verified}
              className={`relative z-10 inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[10px] font-extrabold tracking-[0.11em] shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${driver.online ? 'bg-[#22c982] text-[#073f2a] hover:bg-[#1dbb75]' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <span className={`h-2 w-2 rounded-full ${driver.online ? 'animate-pulse bg-white' : 'bg-white/60'}`} />
              {driver.online ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
          {!driver.verified && (
            <p className="relative mt-4 rounded-xl bg-white/10 px-3 py-2 text-[11px] leading-relaxed text-blue-50">Your account is awaiting admin verification. You can go online once approved.</p>
          )}
        </section>

        
        {activeTrip ? (
          <Link href="/driver/trip" className="block rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#1769e0]">Active trip</p>
            <p className="mt-1 font-display text-[15px] font-bold text-slate-800">{activeTrip.pickup.name} → {activeTrip.destination.name}</p>
            <p className="mt-1 text-[12px] text-slate-500">{formatPeso(activeTrip.fare)} · Tap to continue</p>
          </Link>
        ) : nearbyRequests.length === 0 ? (
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1769e0]">
                <span aria-hidden="true" className="absolute h-9 w-9 animate-ping rounded-full border border-blue-300/70" />
                <span aria-hidden="true" className="absolute h-6 w-6 rounded-full border border-blue-300/80" />
                <span aria-hidden="true" className="relative h-2.5 w-2.5 rounded-full bg-[#1769e0]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[14px] font-bold text-slate-800">0 Open ride requests nearby</p>
                <p className="mt-1 text-[11px] text-slate-500">{driver.online ? 'Scanning for commuters nearby…' : 'Go online to start receiving requests.'}</p>
              </div>
              <span className={`h-2 w-2 shrink-0 rounded-full ${driver.online ? 'animate-pulse bg-emerald-400' : 'bg-slate-300'}`} />
            </div>
            {driver.online && (
              <button type="button" onClick={() => setShowIncomingRequest(true)} className="mt-3 w-full rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-[11px] font-semibold text-[#1769e0] transition hover:bg-blue-50">
                Preview incoming request
              </button>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-[14px] font-bold text-slate-800">{nearbyRequests.length} open ride {nearbyRequests.length === 1 ? 'request' : 'requests'} nearby</p>
                <p className="mt-1 text-[11px] text-slate-500">{driver.online ? 'Choose a trip that works for you.' : 'Go online to accept requests.'}</p>
              </div>
              <Link href="/driver/requests" className="shrink-0 text-[11px] font-semibold text-[#1769e0]">View all</Link>
            </div>
            <button type="button" onClick={() => setShowIncomingRequest(true)} className="mt-3 text-[10px] font-semibold text-slate-400 transition hover:text-[#1769e0]">Preview demo request</button>
          </section>
        )}

        
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-bold text-slate-800">Ride Matching Preference</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Choose how you receive new trips.</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-400 shadow-sm">{matchingMode === 'auto' ? 'AUTO' : 'MANUAL'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={matchingMode === 'auto'}
              onClick={() => setMatchingMode('auto')}
              className={`min-h-[94px] rounded-2xl border p-3 text-left shadow-sm transition ${matchingMode === 'auto' ? 'border-[#1769e0] bg-blue-50 ring-1 ring-[#1769e0]/20' : 'border-white bg-white hover:border-slate-200'}`}
            >
              <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold ${matchingMode === 'auto' ? 'bg-[#1769e0] text-white' : 'bg-slate-100 text-slate-500'}`}>A</span>
              <span className="block text-[12px] font-bold text-slate-800">Auto-Accept</span>
              <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">System matches instantly</span>
            </button>
            <button
              type="button"
              aria-pressed={matchingMode === 'manual'}
              onClick={() => setMatchingMode('manual')}
              className={`min-h-[94px] rounded-2xl border p-3 text-left shadow-sm transition ${matchingMode === 'manual' ? 'border-[#1769e0] bg-blue-50 ring-1 ring-[#1769e0]/20' : 'border-white bg-white hover:border-slate-200'}`}
            >
              <span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold ${matchingMode === 'manual' ? 'bg-[#1769e0] text-white' : 'bg-slate-100 text-slate-500'}`}>M</span>
              <span className="block text-[12px] font-bold text-slate-800">Manual Selection</span>
              <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">Pick a route and rider</span>
            </button>
          </div>
          {matchingMode === 'manual' && nearbyRequests.length > 0 && !activeTrip && (
            <div className="mt-3 space-y-2">
              {nearbyRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="rounded-2xl bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-slate-800">{request.passengerName}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-500">{request.pickup.name} → {request.destination.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><MapPinIcon width={12} height={12} /> {request.distance.toFixed(1)} km away</p>
                    </div>
                    <span className="shrink-0 font-display text-[14px] font-bold text-[#1769e0]">{formatPeso(request.fare)}</span>
                  </div>
                  <button type="button" onClick={() => acceptNearbyRequest(request)} disabled={!driver.online} className="mt-3 min-h-9 w-full rounded-xl bg-[#1769e0] text-[11px] font-bold text-white transition hover:bg-[#125cc9] disabled:cursor-not-allowed disabled:opacity-45">Accept this trip</button>
                </div>
              ))}
              {nearbyRequests.length > 2 && <Link href="/driver/requests" className="block py-1 text-center text-[11px] font-semibold text-[#1769e0]">See all {nearbyRequests.length} requests</Link>}
            </div>
          )}
          {matchingMode === 'manual' && nearbyRequests.length === 0 && (
            <Link href="/driver/requests" className="mt-2 block text-[11px] font-medium text-[#1769e0]">Browse nearby requests</Link>
          )}
        </section>

        
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold text-slate-800">Today</h2>
            <span className="text-[10px] text-slate-400">Your driver snapshot</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <article className="min-h-[120px] rounded-2xl bg-white p-4 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[16px] font-bold text-emerald-600">₱</span>
              <p className="mt-3 font-display text-[20px] font-extrabold leading-none tracking-tight text-slate-800">{formatPeso(earningsToday || 23.2)}</p>
              <p className="mt-1.5 text-[10px] font-medium text-slate-500">Today&apos;s earnings</p>
            </article>
            <article className="min-h-[120px] rounded-2xl bg-white p-4 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[14px] font-bold text-[#1769e0]">↗</span>
              <p className="mt-3 font-display text-[15px] font-extrabold leading-none tracking-wide text-slate-800">{driver.plate}</p>
              <p className="mt-1.5 truncate text-[10px] font-medium text-slate-500">{driver.tricycle}</p>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">Vehicle details</p>
            </article>
          </div>
        </section>
      </div>
      
      <BottomTabs role="driver" />

      
      {showIncomingRequest && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 px-4 pb-5 pt-12 backdrop-blur-[2px] sm:items-center sm:py-6" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="incoming-request-title" className="w-full max-w-[420px] overflow-hidden rounded-[26px] bg-white shadow-[0_24px_80px_rgba(6,21,44,0.32)]">
            <div className="bg-gradient-to-r from-[#eaf4ff] to-[#f7fbff] px-5 pb-4 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#d57437]">New ride nearby</p>
                  <h2 id="incoming-request-title" className="mt-1 font-display text-[19px] font-extrabold tracking-tight text-slate-900">Incoming Ride Request!</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1769e0] shadow-sm"><span className="h-3 w-3 animate-ping rounded-full bg-[#1769e0]" /></span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full rounded-full bg-[#1769e0] transition-[width] duration-1000 ease-linear" style={{ width: `${(incomingSeconds / 20) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-right text-[10px] font-semibold text-[#6a7f99]">Request expires in {incomingSeconds}s</p>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcecff] text-[14px] font-extrabold text-[#245d9f]">JD</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-slate-800">Juan</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Commuter · 4.9 rider rating</p>
                </div>
                <span className="font-display text-[18px] font-extrabold text-[#1769e0]">{formatPeso(PLACES[2].regularFare)}</span>
              </div>
              <div className="relative ml-5 mt-4 space-y-4 border-l border-dashed border-slate-300 py-0.5 pl-5">
                <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#1769e0] ring-1 ring-blue-200" />
                <p className="text-[12px] font-semibold text-slate-800">{PLACES[0].name}<span className="ml-2 text-[10px] font-medium text-slate-400">Pickup</span></p>
                <div className="absolute -left-[5px] bottom-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e34c4c] ring-1 ring-red-200" />
                <p className="text-[12px] font-semibold text-slate-800">Dadda<span className="ml-2 text-[10px] font-medium text-slate-400">Destination</span></p>
              </div>
              <div className="mt-4 flex gap-2.5">
                <button type="button" onClick={() => { setShowIncomingRequest(false); setDemoAccepted(false); }} className="min-h-12 flex-1 rounded-2xl bg-slate-100 text-[13px] font-bold text-slate-500 transition hover:bg-slate-200">Decline</button>
                <button type="button" onClick={() => { setShowIncomingRequest(false); setDemoAccepted(true); }} className="min-h-12 flex-[1.5] rounded-2xl bg-emerald-500 text-[13px] font-bold text-white shadow-[0_7px_16px_rgba(16,185,129,0.2)] transition hover:scale-[1.01] hover:bg-emerald-600 active:scale-[0.98]">Accept request</button>
              </div>
              <p className="mt-3 text-center text-[9px] text-slate-400">Demo preview · This sample request won&apos;t change live bookings</p>
            </div>
          </section>
        </div>
      )}

      
      {demoAccepted && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2.5 text-[11px] font-semibold text-white shadow-lg">
          Demo request accepted
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverHome />
    </RequireRole>
  );
}
