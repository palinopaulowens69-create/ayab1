'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookIcon, ChartIcon, HistoryIcon, HomeIcon, ShieldIcon, UserIcon, UsersIcon } from './Icons';

interface TabDef {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
}

const TABS: Record<'commuter' | 'driver' | 'admin', TabDef[]> = {
  commuter: [
    { href: '/commuter/home', label: 'Home', icon: () => <HomeIcon /> },
    { href: '/commuter/book', label: 'Book', icon: () => <BookIcon /> },
    { href: '/commuter/history', label: 'History', icon: () => <HistoryIcon /> },
    { href: '/commuter/profile', label: 'Profile', icon: () => <UserIcon /> },
  ],
  driver: [
    { href: '/driver/home', label: 'Home', icon: () => <HomeIcon /> },
    { href: '/driver/requests', label: 'Requests', icon: () => <BookIcon /> },
    { href: '/driver/history', label: 'History', icon: () => <HistoryIcon /> },
    { href: '/driver/profile', label: 'Profile', icon: () => <UserIcon /> },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: () => <ChartIcon /> },
    { href: '/admin/drivers', label: 'Drivers', icon: () => <ShieldIcon /> },
    { href: '/admin/bookings', label: 'Bookings', icon: () => <BookIcon /> },
    { href: '/admin/commuters', label: 'Users', icon: () => <UsersIcon /> },
  ],
};

export function BottomTabs({ role }: { role: 'commuter' | 'driver' | 'admin' }) {
  const pathname = usePathname();
  const tabs = TABS[role];

  return (
    <nav className="tabbar" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={`tab-item ${active ? 'is-active' : ''}`}>
            {tab.icon(active)}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
