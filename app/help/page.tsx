import { PageHeader } from '@/components/PageHeader';

const HELP_ITEMS = [
  { question: 'How do I book a ride?', answer: 'Choose a pickup point and destination, select your passenger fare, then send a ride request.' },
  { question: 'How do I verify my driver?', answer: 'Check the driver and vehicle details, then scan the driver QR code before your trip begins.' },
  { question: 'Where can I get trip help?', answer: 'Open the trip from your home screen to see its status and the contact details available for that ride.' },
];

export default function HelpPage() {
  return (
    <div className="shell bg-[#F8FAFC] dark:bg-[#0F172A]">
      <PageHeader title="Help & Support" useHistoryBack />
      <main className="page-body !px-4 !pt-5">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-4">
            <h2 className="font-display text-[19px] font-bold text-slate-900 dark:text-white">How can we help?</h2>
            <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Quick answers for your AYAB trips.</p>
          </div>
          <section className="overflow-hidden rounded-xl bg-white shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-[#1E293B] dark:shadow-black/20 dark:ring-slate-700/70">
            {HELP_ITEMS.map((item, index) => (
              <article key={item.question} className={`p-4 ${index < HELP_ITEMS.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                <h3 className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{item.question}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{item.answer}</p>
              </article>
            ))}
          </section>
          <p className="mt-5 text-center text-[10px] text-slate-400 dark:text-slate-500">Need more help? Contact your local AYAB operator.</p>
        </div>
      </main>
    </div>
  );
}
