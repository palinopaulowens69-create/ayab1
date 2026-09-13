'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { useApp } from '@/lib/store';

function Settings() {
  const { resetDemoData } = useApp();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    resetDemoData();
    router.replace('/login');
  }

  return (
    <div className="shell">
      <PageHeader title="Settings" backHref="/commuter/profile" />
      <div className="page-body">
        <div className="panel !mt-0">
          <p className="text-[14px] font-semibold">About this app</p>
          <p className="mt-1 text-[13px] text-ink/60">
            AYAB is a demo booking experience. All accounts, trips, and messages are mock data stored only
            in this browser — nothing is sent to a server.
          </p>
        </div>

        <p className="section-label">Demo data</p>
        <div className="panel !mt-0">
          <p className="text-[13px] text-ink/60">
            Clears every saved trip, message, and login, and restores the original demo accounts.
          </p>
          {confirming ? (
            <div className="mt-3 flex gap-2">
              <button onClick={handleReset} className="btn-danger btn-sm">
                Yes, reset everything
              </button>
              <button onClick={() => setConfirming(false)} className="btn-outline btn-sm">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="btn-outline mt-3">
              Reset demo data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <Settings />
    </RequireRole>
  );
}
