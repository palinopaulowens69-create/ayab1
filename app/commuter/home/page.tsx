'use client';

import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { BellIcon, NavigationIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';

function CommuterHome() {
  const { currentUser, bookings, drivers, announcements, notifications } = useApp();

  const myBookings = bookings.filter((b) => b.passengerId === currentUser?.id);
  const activeBooking = myBookings.find((b) =>
    ['searching', 'accepted', 'verified', 'started'].includes(b.status),
  );
  const completedCount = myBookings.filter((b) => b.status === 'completed').length;
  const nearbyDrivers = drivers.filter((d) => d.online && d.verified).length;
  const unread = notifications.filter((n) => n.userId === currentUser?.id && !n.read).length;
  const latestAnnouncement = announcements.find((a) => a.published);

  return (
    <div className="shell">
      <PageHeader
        title="AYAB"
        action={
          <Link href="/commuter/notifications" className="topbar-btn relative" aria-label="Notifications">
            <BellIcon />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" />
            )}
          </Link>
        }
      />
      <div className="page-body">
        <p className="text-[14px] text-ink/60">Magandang araw, {currentUser?.name.split(' ')[0]}!</p>

        {activeBooking ? (
          <Link href="/commuter/tracking" className="ticket mt-3 block px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gold">Trip in progress</p>
            <p className="mt-1 font-display text-[18px] font-bold">
              {activeBooking.pickup.name} → {activeBooking.destination.name}
            </p>
            <p className="mt-1 text-[13px] text-white/75">
              Tap to track your ride · {formatPeso(activeBooking.fare)}
            </p>
          </Link>
        ) : (
          <Link href="/commuter/book" className="ticket mt-3 block px-4 py-5">
            <div className="ticket-notch">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gold">Ready when you are</p>
            <p className="mt-1 font-display text-[20px] font-extrabold">Book a tricycle</p>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-white/75">
              <NavigationIcon width={15} height={15} /> {nearbyDrivers} drivers online nearby
            </p>
          </Link>
        )}

        <p className="section-label">Your trips</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="panel !mt-0 text-center">
            <p className="font-display text-[24px] font-extrabold text-brand">{completedCount}</p>
            <p className="text-[12px] text-ink/50">Completed rides</p>
          </div>
          <div className="panel !mt-0 text-center">
            <p className="font-display text-[24px] font-extrabold text-brand">{nearbyDrivers}</p>
            <p className="text-[12px] text-ink/50">Drivers online</p>
          </div>
        </div>

        {latestAnnouncement && (
          <>
            <p className="section-label">Announcement</p>
            <div className="panel !mt-0">
              <p className="text-[14px] font-semibold">{latestAnnouncement.title}</p>
              <p className="mt-1 text-[13px] text-ink/60">{latestAnnouncement.body}</p>
            </div>
          </>
        )}
      </div>
      <BottomTabs role="commuter" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <CommuterHome />
    </RequireRole>
  );
}
