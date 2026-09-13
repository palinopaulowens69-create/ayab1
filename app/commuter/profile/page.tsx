'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { LogOutIcon, QrIcon, SettingsIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { initials } from '@/lib/utils';

function Profile() {
  const { currentUser, bookings, logout } = useApp();
  const router = useRouter();
  const completed = bookings.filter(
    (b) => b.passengerId === currentUser?.id && b.status === 'completed',
  ).length;

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (!currentUser) return null;

  return (
    <div className="shell">
      <PageHeader title="Profile" />
      <div className="page-body">
        <div className="panel !mt-0 flex items-center gap-3">
          <div className="avatar h-14 w-14 text-[18px]">{initials(currentUser.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{currentUser.name}</p>
            <p className="truncate text-[13px] text-ink/55">{currentUser.email}</p>
            <p className="text-[13px] text-ink/55">{currentUser.phone}</p>
          </div>
        </div>

        <div className="panel text-center">
          <p className="font-display text-[24px] font-extrabold text-brand">{completed}</p>
          <p className="text-[12px] text-ink/50">Completed rides</p>
        </div>

        <p className="section-label">Account</p>
        <div className="panel !mt-0 divide-y divide-line">
          <Link href="/commuter/qr" className="row !border-b-0">
            <QrIcon className="text-brand" />
            <span className="text-[14px]">My commuter QR</span>
          </Link>
          <Link href="/commuter/settings" className="row !border-b-0">
            <SettingsIcon className="text-brand" />
            <span className="text-[14px]">Settings</span>
          </Link>
        </div>

        <button onClick={handleLogout} className="btn-danger mt-5">
          <LogOutIcon width={17} height={17} /> Log out
        </button>
      </div>
      <BottomTabs role="commuter" />
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
