'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { EditIcon, HelpIcon, LogOutIcon, QrIcon, SettingsIcon } from '@/components/Icons';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';

function Profile() {
  const { currentUser, bookings, logout } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const myCompletedRides = bookings.filter((booking) => booking.passengerId === currentUser?.id && booking.status === 'completed');
  const lifetimeSpend = myCompletedRides.reduce((total, booking) => total + booking.fare, 0);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (!currentUser) return null;

  return (
    <div className="shell bg-[#F8FAFC] dark:bg-[#0F172A]">
      <PageHeader title="Profile" />
      <main className="page-body !px-4 !pb-8 !pt-6">
        <div className="mx-auto w-full max-w-[440px]">
          <section className="flex flex-col items-center rounded-xl bg-white px-5 py-6 text-center shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
            <ProfileAvatar name={currentUser.name} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <h2 className="font-display text-[19px] font-bold tracking-tight text-slate-900 dark:text-white">{currentUser.name}</h2>
              <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-50 px-2.5 text-[10px] font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-[#1769e0] active:scale-95 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-blue-200">
                <EditIcon width={12} height={12} /> Edit Profile
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{currentUser.phone}</p>
          </section>

          <section className="mt-4 grid grid-cols-2 divide-x divide-slate-100 rounded-xl bg-white py-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:divide-slate-700 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70" aria-label="Commuter statistics">
            <div className="px-3 text-center">
              <p className="font-display text-[21px] font-extrabold leading-tight text-slate-900 dark:text-white">{myCompletedRides.length}</p>
              <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Completed rides</p>
            </div>
            <div className="px-3 text-center">
              <p className="font-display text-[21px] font-extrabold leading-tight text-slate-900 dark:text-white">{formatPeso(lifetimeSpend)}</p>
              <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Total spent</p>
            </div>
          </section>

          <div className="mb-2.5 mt-6 flex items-center justify-between">
            <h3 className="font-display text-[13px] font-bold text-slate-800 dark:text-slate-200">Your account</h3>
            <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">Manage</span>
          </div>
          <ProfileMenu items={[
            { href: '/commuter/qr', label: 'My QR Code', icon: <QrIcon width={17} height={17} /> },
            { href: '/commuter/settings', label: 'Settings', icon: <SettingsIcon width={17} height={17} /> },
            { href: '/help', label: 'Help & Support', icon: <HelpIcon width={17} height={17} /> },
          ]} />

          <button onClick={handleLogout} className="mx-auto mt-7 flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-200/80 px-5 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-50 active:scale-[0.98] dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30">
            <LogOutIcon width={15} height={15} /> Log out
          </button>
        </div>
      </main>
      <BottomTabs role="commuter" />
      {editing && <EditProfileDialog userId={currentUser.id} name={currentUser.name} phone={currentUser.phone} onClose={() => setEditing(false)} />}
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <Profile />
    </RequireRole>
  );
}
