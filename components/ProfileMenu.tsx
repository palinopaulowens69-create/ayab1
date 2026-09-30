import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRightIcon } from './Icons';

export interface ProfileMenuItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function ProfileMenu({ items }: { items: ProfileMenuItem[] }) {
  return (
    <nav aria-label="Profile menu" className="overflow-hidden rounded-xl bg-white shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
      {items.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group grid min-h-[54px] grid-cols-[24px_1fr_20px] items-center gap-3 px-4 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.995] dark:text-slate-200 dark:hover:bg-slate-700/60 ${index < items.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/70' : ''}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-[#1769e0] dark:bg-slate-700/60 dark:text-slate-300 dark:group-hover:bg-blue-400/10 dark:group-hover:text-blue-300">{item.icon}</span>
          <span className="text-center">{item.label}</span>
          <ChevronRightIcon width={16} height={16} className="justify-self-end text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" />
        </Link>
      ))}
    </nav>
  );
}
