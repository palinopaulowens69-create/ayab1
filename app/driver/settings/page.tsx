import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { BottomTabs } from '@/components/BottomTabs';
import { PageHeader } from '@/components/PageHeader';

function DriverSettings() {
  return (
    <div className="shell bg-[#F8FAFC] dark:bg-[#0F172A]">
      <PageHeader title="Settings" backHref="/driver/profile" />
      <main className="page-body !px-4 !pb-28 !pt-5">
        <div className="mx-auto w-full max-w-[440px]">
          <section className="rounded-xl bg-white p-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
            <h2 className="text-[12px] font-bold text-slate-800 dark:text-slate-100">Ride matching</h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Choose between automatic matching and selecting each request yourself from your home screen.</p>
            <Link href="/driver/home" className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-blue-50 px-3 text-[10px] font-semibold text-[#1769e0] transition hover:bg-blue-100 active:scale-[0.98] dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/15">Manage ride matching</Link>
          </section>
          <section className="mt-3 rounded-xl bg-white p-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
            <h2 className="text-[12px] font-bold text-slate-800 dark:text-slate-100">Account & safety</h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Keep your contact details current and verify each commuter before starting a trip.</p>
          </section>
        </div>
      </main>
      <BottomTabs role="driver" />
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="driver">
      <DriverSettings />
    </RequireRole>
  );
}
