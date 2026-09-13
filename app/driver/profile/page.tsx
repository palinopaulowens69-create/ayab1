'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { LogOutIcon, QrIcon, StarIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { initials } from '@/lib/utils';

function DriverProfile() {
  const { currentUser, drivers, logout } = useApp();
  const router = useRouter();
  const driver = drivers.find((d) => d.id === currentUser?.id);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (!driver) return null;

  return (
    <div className="shell">
      <PageHeader title="Profile" />
      <div className="page-body">
        <div className="panel !mt-0 flex items-center gap-3">
          <div className="avatar h-14 w-14 text-[18px]">{initials(driver.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{driver.name}</p>
            <p className="truncate text-[13px] text-ink/55">{driver.email}</p>
            <p className="flex items-center gap-1 text-[13px] text-ink/55">
              <StarIcon width={13} height={13} className="text-gold" /> {driver.rating.toFixed(1)} ·{' '}
              {driver.completedTrips} trips
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="row">
            <span className="text-[13px] text-ink/60">Tricycle</span>
            <span className="ml-auto text-[14px] font-semibold">{driver.tricycle}</span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Plate number</span>
            <span className="ml-auto data-chip">{driver.plate}</span>
          </div>
          <div className="row">
            <span className="text-[13px] text-ink/60">Verification</span>
            <span className={`ml-auto ${driver.verified ? 'badge-success' : 'badge-warning'}`}>
              {driver.verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>

        <p className="section-label">Account</p>
        <div className="panel !mt-0">
          <Link href="/driver/qr" className="row !border-b-0">
            <QrIcon className="text-brand" />
            <span className="text-[14px]">My driver QR</span>
          </Link>
        </div>

        <button onClick={handleLogout} className="btn-danger mt-5">
          <LogOutIcon width={17} height={17} /> Log out
        </button>
      </div>
      <BottomTabs role="driver" />
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
