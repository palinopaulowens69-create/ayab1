'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BackIcon } from './Icons';

export function PageHeader({
  title,
  backHref,
  useHistoryBack,
  action,
}: {
  title: string;
  backHref?: string;
  useHistoryBack?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  const showBack = Boolean(backHref || useHistoryBack);

  return (
    <header className="topbar">
      {showBack ? (
        backHref ? (
          <Link href={backHref} className="topbar-btn" aria-label="Go back">
            <BackIcon />
          </Link>
        ) : (
          <button onClick={() => router.back()} className="topbar-btn" aria-label="Go back">
            <BackIcon />
          </button>
        )
      ) : (
        <span className="w-9 shrink-0" aria-hidden="true" />
      )}
      <h1 className="topbar-title">{title}</h1>
      {action ?? <span className="w-9 shrink-0" aria-hidden="true" />}
    </header>
  );
}
