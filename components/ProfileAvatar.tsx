// Nagpapakita ito ng accessible avatar placeholder na may style depende sa role.
// Tumatanggap ng pangalan at optional driver flag; ibinabalik ang accessible avatar placeholder.
export function ProfileAvatar({ name, driver = false }: { name: string; driver?: boolean }) {
  return (
    // Shared photo placeholder with a role-tinted background and accessible name.
    <div role="img" aria-label={`${name} profile photo placeholder`} className={`relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${driver ? 'from-sky-200 via-blue-200 to-blue-400' : 'from-[#dbeafe] via-[#c7ddf5] to-[#a8c8e8]'} ring-4 ring-white shadow-[0_5px_18px_rgba(38,75,125,0.13)] `}>
      <span aria-hidden="true" className="absolute inset-1 rounded-full border border-white/50" />
      <svg viewBox="0 0 48 48" className="relative h-14 w-14 text-white/95 drop-shadow-sm" fill="currentColor" aria-hidden="true">
        <circle cx="24" cy="17" r="8" />
        <path d="M7.5 43c.8-9.3 6.8-14.5 16.5-14.5S39.7 33.7 40.5 43h-33Z" />
      </svg>
    </div>
  );
}
