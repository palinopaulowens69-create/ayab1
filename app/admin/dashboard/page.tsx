'use client';

import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { BottomTabs } from '@/components/BottomTabs';
import { AlertIcon, ChartIcon, MegaphoneIcon, ShieldIcon, UserIcon } from '@/components/Icons';
import { useApp } from '@/lib/store';
import { formatPeso } from '@/lib/utils';

function Dashboard() {
  const { users, drivers, bookings, incidents } = useApp();

  const commuterCount = users.filter((u) => u.role === 'commuter').length;
  const onlineDrivers = drivers.filter((d) => d.online).length;
  const pendingVerification = drivers.filter((d) => !d.verified).length;
  const completedTrips = bookings.filter((b) => b.status === 'completed');
  const revenue = completedTrips.reduce((sum, b) => sum + b.fare, 0);
  const openIncidents = incidents.filter((i) => i.status === 'Pending' || i.status === 'Investigating').length;

  const stats = [
    { label: 'Commuters', value: commuterCount },
    { label: 'Drivers online', value: `${onlineDrivers}/${drivers.length}` },
    { label: 'Completed trips', value: completedTrips.length },
    { label: 'Total revenue', value: formatPeso(revenue) },
  ];

  const links = [
    { href: '/admin/drivers', label: 'Verify drivers', icon: <ShieldIcon />, hint: `${pendingVerification} pending` },
    { href: '/admin/incidents', label: 'Incident reports', icon: <AlertIcon />, hint: `${openIncidents} open` },
    { href: '/admin/announcements', label: 'Announcements', icon: <MegaphoneIcon />, hint: 'Manage' },
    { href: '/admin/reports', label: 'Reports', icon: <ChartIcon />, hint: 'View' },
  ];

  return (
    <div className="shell">
      <PageHeader
        title="Operations"
        action={
          <Link href="/admin/profile" className="topbar-btn" aria-label="Admin profile">
            <UserIcon />
          </Link>
        }
      />
      <div className="page-body">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="panel !mt-0 text-center">
              <p className="font-display text-[20px] font-extrabold text-brand">{s.value}</p>
              <p className="text-[12px] text-ink/50">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="section-label">Manage</p>
        <div className="panel !mt-0 divide-y divide-line">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="row !border-b-0">
              <span className="text-brand">{l.icon}</span>
              <span className="text-[14px]">{l.label}</span>
              <span className="ml-auto text-[12px] text-ink/45">{l.hint}</span>
            </Link>
          ))}
        </div>
      </div>
      <BottomTabs role="admin" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="admin">
      <Dashboard />
    </RequireRole>
  );
}
