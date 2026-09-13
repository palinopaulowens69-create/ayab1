'use client';

import { RequireRole } from '@/components/RequireRole';
import { PageHeader } from '@/components/PageHeader';
import { QrCode } from '@/components/QrCode';
import { useApp } from '@/lib/store';

function DriverQr() {
  const { currentUser, drivers } = useApp();
  const driver = drivers.find((d) => d.id === currentUser?.id);
  if (!driver) return null;

  return (
    <div className="shell">
      <PageHeader title="My QR code" backHref="/driver/profile" />
      <div className="page-body">
        <div className="panel !mt-0 flex flex-col items-center py-8">
          <QrCode value={driver.qrId} />
          <p className="mt-4 data-chip">{driver.qrId}</p>
          <p className="mt-3 text-center text-[13px] text-ink/55">
            Passengers scan this to confirm they&apos;re boarding the right tricycle.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverQr />
    </RequireRole>
  );
}
