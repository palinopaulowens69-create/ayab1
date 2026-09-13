'use client';

import { useEffect } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BellIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatDate } from '@/lib/utils';

function Notifications() {
  const { currentUser, notifications, markAllNotificationsRead } = useApp();
  const mine = notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  useEffect(() => {
    if (currentUser) markAllNotificationsRead(currentUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return (
    <div className="shell">
      <PageHeader title="Notifications" backHref="/commuter/home" />
      <div className="page-body">
        {mine.length === 0 ? (
          <div className="empty-state">
            <BellIcon width={26} height={26} />
            <p className="font-semibold text-ink">You&apos;re all caught up</p>
            <p className="text-[13px]">Trip updates and announcements will appear here.</p>
          </div>
        ) : (
          mine.map((n) => (
            <div key={n.id} className="panel !mt-0 mb-2">
              <p className="text-[14px]">{n.message}</p>
              <p className="mt-1 text-[12px] text-ink/45">{formatDate(n.date)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <Notifications />
    </RequireRole>
  );
}
