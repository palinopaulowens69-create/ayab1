'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import type { Role } from '@/lib/types';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { mounted, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role !== role) {
      router.replace(`/${currentUser.role}/home`.replace('/admin/home', '/admin/dashboard'));
    }
  }, [mounted, currentUser, role, router]);

  if (!mounted || !currentUser || currentUser.role !== role) {
    return (
      <div className="shell items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
