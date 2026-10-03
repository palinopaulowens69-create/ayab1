// Binubuo nito ang role-specific bottom navigation para sa commuter, driver, at admin.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BookIcon, ChartIcon, HistoryIcon, HomeFilledIcon, HomeIcon, ShieldIcon, UserIcon, UsersIcon } from './Icons';

interface TabDef {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
}

// Role-specific destinations and icons for the persistent app navigation.
const TABS: Record<'commuter' | 'driver' | 'admin', TabDef[]> = {
  commuter: [
    { href: '/commuter/home', label: 'Home', icon: (active) => active ? <HomeFilledIcon /> : <HomeIcon /> },
    { href: '/commuter/book', label: 'Book', icon: () => <BookIcon /> },
    { href: '/commuter/history', label: 'History', icon: () => <HistoryIcon /> },
    { href: '/commuter/profile', label: 'Profile', icon: () => <UserIcon /> },
  ],
  driver: [
    { href: '/driver/home', label: 'Home', icon: (active) => active ? <HomeFilledIcon /> : <HomeIcon /> },
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

// Tumatanggap ng role at ibinabalik ang navigation tabs na para sa commuter, driver, o admin.
export function BottomTabs({ role }: { role: 'commuter' | 'driver' | 'admin' }) {
  const pathname = usePathname();
  const tabs = TABS[role];
  const navClass = role === 'driver'
    ? 'fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 border-t border-[#e8edf3] bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-5px_18px_rgba(28,52,82,0.06)]   '
    : 'sticky bottom-0 z-20 grid border-t border-[#e8edf3] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-5px_18px_rgba(28,52,82,0.04)] backdrop-blur-md   ';

  return (
    // Highlights the current route and lays out navigation items evenly.
    <nav className={navClass} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? 'page' : undefined} className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors ${active ? 'font-semibold text-[#1769e0] ' : 'text-[#8491a1] hover:text-[#50657e]  '}`}>
            <span className={`flex h-7 w-9 items-center justify-center rounded-full transition-colors ${active ? 'bg-[#eaf2ff] ' : ''}`}>{tab.icon(active)}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
