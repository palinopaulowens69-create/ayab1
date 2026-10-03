// Ipinapakita nito ang progreso ng booking ayon sa kasalukuyang trip status.
import { TRIP_STEPS } from '@/lib/types';
import type { BookingStatus } from '@/lib/types';
import { CheckIcon } from './Icons';

// Tumatanggap ng booking status at ibinabalik ang progress steps o cancelled state.
export function StepTracker({ status }: { status: BookingStatus }) {
  // Cancelled bookings use a clear terminal state instead of the progress sequence.
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg bg-danger/10 px-3 py-2 text-center text-[13px] font-semibold text-danger">
        Trip cancelled
      </div>
    );
  }

  const currentIndex = TRIP_STEPS.findIndex((s) => s.key === status);

  // Completed steps show checks; the current step is named beneath the progress line.
  return (
    <div>
      <div className="step-tracker">
        {TRIP_STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className={`step-dot ${i < currentIndex ? 'is-done' : i === currentIndex ? 'is-current' : ''}`}>
              {i < currentIndex ? <CheckIcon width={12} height={12} /> : i + 1}
            </div>
            {i < TRIP_STEPS.length - 1 && (
              <div className={`step-line ${i < currentIndex ? 'is-done' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[13px] font-semibold text-ink">
        {TRIP_STEPS[currentIndex]?.label ?? 'Trip status'}
      </p>
    </div>
  );
}
