'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { EditIcon, HelpIcon, LogOutIcon, QrIcon, SettingsIcon, StarIcon } from '@/components/Icons';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfileMenu } from '@/components/ProfileMenu';
import { useApp } from '@/lib/store';

function DriverProfile() {
  const { currentUser, drivers, logout } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const driver = drivers.find((d) => d.id === currentUser?.id);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (!driver) return null;

  return (
    <div className="shell bg-[#F8FAFC] dark:bg-[#0F172A]">
      <PageHeader title="Profile" />
      <main className="page-body !px-4 !pb-28 !pt-6">
        <div className="mx-auto w-full max-w-[440px]">
          <section className="flex flex-col items-center rounded-xl bg-white px-5 py-6 text-center shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
            <ProfileAvatar name={driver.name} driver />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <h2 className="font-display text-[19px] font-bold tracking-tight text-slate-900 dark:text-white">{driver.name}</h2>
              <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-50 px-2.5 text-[10px] font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-[#1769e0] active:scale-95 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-blue-200">
                <EditIcon width={12} height={12} /> Edit Profile
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{driver.email}</p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{driver.phone}</p>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 shadow-inner dark:border-slate-600 dark:bg-slate-700">
              <span className="font-mono text-[12px] font-extrabold tracking-[0.15em] text-slate-700 dark:text-slate-100">{driver.plate}</span>
              <span className="h-4 w-px bg-slate-300 dark:bg-slate-500" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-300">{driver.tricycle}</span>
            </div>
            <p className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">Registered vehicle</p>
          </section>

          <section className="mt-4 grid grid-cols-2 divide-x divide-slate-100 rounded-xl bg-white py-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:divide-slate-700 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70" aria-label="Driver statistics">
            <div className="px-3 text-center">
              <p className="font-display text-[21px] font-extrabold leading-tight text-slate-900 dark:text-white">{driver.completedTrips}</p>
              <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Completed rides</p>
            </div>
            <div className="px-3 text-center">
              <p className="inline-flex items-center gap-1 font-display text-[21px] font-extrabold leading-tight text-slate-900 dark:text-white">{driver.rating.toFixed(1)} <StarIcon width={15} height={15} className="fill-amber-400 text-amber-400" /></p>
              <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Driver rating</p>
            </div>
          </section>

          <div className="mb-2.5 mt-6 flex items-center justify-between">
            <h3 className="font-display text-[13px] font-bold text-slate-800 dark:text-slate-200">Your account</h3>
            <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">Manage</span>
          </div>
          <ProfileMenu items={[
            { href: '/driver/qr', label: 'My QR Code', icon: <QrIcon width={17} height={17} /> },
            { href: '/driver/settings', label: 'Settings', icon: <SettingsIcon width={17} height={17} /> },
            { href: '/help', label: 'Help & Support', icon: <HelpIcon width={17} height={17} /> },
          ]} />

          <button onClick={handleLogout} className="mx-auto mt-7 flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-200/80 px-5 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-50 active:scale-[0.98] dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30">
            <LogOutIcon width={15} height={15} /> Log out
          </button>
        </div>
      </main>
      <BottomTabs role="driver" />
      {editing && <EditProfileDialog userId={driver.id} name={driver.name} phone={driver.phone} onClose={() => setEditing(false)} />}
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverProfile />
    </RequireRole>
  );
}
