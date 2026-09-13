'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { LogOutIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { initials } from '@/lib/utils';

function AdminProfile() {
  const { currentUser, logout } = useApp();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (!currentUser) return null;

  return (
    <div className="shell">
      <PageHeader title="Admin profile" />
      <div className="page-body">
        <div className="panel !mt-0 flex items-center gap-3">
          <div className="avatar h-14 w-14 text-[18px]">{initials(currentUser.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{currentUser.name}</p>
            <p className="truncate text-[13px] text-ink/55">{currentUser.email}</p>
            <span className="badge-brand mt-1 inline-block">Administrator</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-danger mt-5">
          <LogOutIcon width={17} height={17} /> Log out
        </button>
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <AdminProfile />
    </RequireRole>
  );
}
