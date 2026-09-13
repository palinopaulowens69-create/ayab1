import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function base(children: ReactNode, props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const BackIcon = (p: IconProps) => base(<path d="M15 18l-6-6 6-6" />, p);
export const BellIcon = (p: IconProps) =>
  base(
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>,
    p,
  );
export const HomeIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9h14v-9" />
    </>,
    p,
  );
export const BookIcon = (p: IconProps) =>
  base(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 4v16" />
    </>,
    p,
  );
export const HistoryIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 3" />
    </>,
    p,
  );
export const UserIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
    </>,
    p,
  );
export const SettingsIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.32.5 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>,
    p,
  );
export const QrIcon = (p: IconProps) =>
  base(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
    </>,
    p,
  );
export const CheckIcon = (p: IconProps) => base(<path d="M5 13l4 4L19 7" />, p);
export const XIcon = (p: IconProps) => base(<path d="M18 6L6 18M6 6l12 12" />, p);
export const StarIcon = (p: IconProps) =>
  base(<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19.3l1.3-6-4.6-4.1 6.1-.6L12 3Z" />, p);
export const LogOutIcon = (p: IconProps) =>
  base(
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>,
    p,
  );
export const ShieldIcon = (p: IconProps) =>
  base(<path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z" />, p);
export const UsersIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" />
      <circle cx="17" cy="8" r="2.6" />
      <path d="M16 14.3c2.2.5 4 2.2 4.7 5.2" />
    </>,
    p,
  );
export const AlertIcon = (p: IconProps) =>
  base(
    <>
      <path d="M10.3 3.9 2.6 17a1.9 1.9 0 0 0 1.6 2.9h15.6A1.9 1.9 0 0 0 21.4 17L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>,
    p,
  );
export const MegaphoneIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M15 8a4 4 0 0 1 0 8" />
      <path d="M18 5a8 8 0 0 1 0 14" />
    </>,
    p,
  );
export const ChartIcon = (p: IconProps) =>
  base(
    <>
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
      <path d="M2 20h20" />
    </>,
    p,
  );
export const SearchIcon = (p: IconProps) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>,
    p,
  );
export const PlusIcon = (p: IconProps) => base(<path d="M12 5v14M5 12h14" />, p);
export const TrashIcon = (p: IconProps) =>
  base(
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </>,
    p,
  );
export const PhoneIcon = (p: IconProps) =>
  base(
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .7a2 2 0 0 1 1.6 2Z" />,
    p,
  );
export const NavigationIcon = (p: IconProps) => base(<path d="M3 11l18-8-8 18-2-8-8-2Z" />, p);
