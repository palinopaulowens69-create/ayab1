'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '@/lib/store';

export default function RootPage() {
  const { mounted, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace('/login');
    } else if (currentUser.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace(`/${currentUser.role}/home`);
    }
  }, [mounted, currentUser, router]);

  return (
    <div className="shell items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  );
}
