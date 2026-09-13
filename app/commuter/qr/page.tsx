'use client';

import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { QrCode } from '@/components/QrCode';
import { useApp } from '@/lib/store';

function CommuterQr() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  return (
    <div className="shell">
      <PageHeader title="My QR code" backHref="/commuter/profile" />
      <div className="page-body">
        <div className="panel !mt-0 flex flex-col items-center py-8">
          <QrCode value={`AYAB-COMMUTER-${currentUser.id}`} />
          <p className="mt-4 data-chip">AYAB-COMMUTER-{currentUser.id.toUpperCase()}</p>
          <p className="mt-3 text-center text-[13px] text-ink/55">
            Show this to your driver so they can confirm your identity before the trip starts.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="commuter">
      <CommuterQr />
    </RequireRole>
  );
}
