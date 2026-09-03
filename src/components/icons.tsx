import type { ReactNode, SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

function S({
  className = "w-5 h-5",
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Trèfle GoodLuck (logo, plein) */
export function LogoClover({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="12" cy="6.6" r="4.1" />
        <circle cx="12" cy="17.4" r="4.1" />
        <circle cx="6.6" cy="12" r="4.1" />
        <circle cx="17.4" cy="12" r="4.1" />
      </g>
      <circle cx="12" cy="12" r="2.3" fill="#e0eaf9" />
    </svg>
  );
}

export const IconDashboard = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="3" width="8" height="10" rx="1.5" />
    <rect x="13" y="3" width="8" height="6" rx="1.5" />
    <rect x="13" y="11" width="8" height="10" rx="1.5" />
    <rect x="3" y="15" width="8" height="6" rx="1.5" />
  </S>
);

export const IconList = (p: IconProps) => (
  <S {...p}>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </S>
);

export const IconPie = (p: IconProps) => (
  <S {...p}>
    <path d="M21 12A9 9 0 1 1 12 3" />
    <path d="M12 3a9 9 0 0 1 9 9h-9z" />
  </S>
);

export const IconPlus = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconSearch = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </S>
);

export const IconPencil = (p: IconProps) => (
  <S {...p}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </S>
);

export const IconTrash = (p: IconProps) => (
  <S {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </S>
);

export const IconX = (p: IconProps) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
);

export const IconAlert = (p: IconProps) => (
  <S {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </S>
);

export const IconPhone = (p: IconProps) => (
  <S {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9Z" />
  </S>
);

export const IconLogout = (p: IconProps) => (
  <S {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </S>
);

export const IconChevronDown = (p: IconProps) => (
  <S {...p}>
    <path d="m6 9 6 6 6-6" />
  </S>
);

export const IconArrowUpDown = (p: IconProps) => (
  <S {...p}>
    <path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16" />
  </S>
);

export const IconArrowUp = (p: IconProps) => (
  <S {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </S>
);

export const IconArrowDown = (p: IconProps) => (
  <S {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </S>
);

export const IconCalendar = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </S>
);

export const IconCheck = (p: IconProps) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
);

export const IconEye = (p: IconProps) => (
  <S {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);

export const IconEyeOff = (p: IconProps) => (
  <S {...p}>
    <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
    <path d="M2 2l20 20" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </S>
);

export const IconClock = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </S>
);

export const IconUser = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </S>
);

export const IconFlag = (p: IconProps) => (
  <S {...p}>
    <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 8 2a6 6 0 0 0 3-.7V13a6 6 0 0 1-3 .7c-3 0-5-2-8-2a6 6 0 0 0-4 1.5" />
  </S>
);

export const IconWallet = (p: IconProps) => (
  <S {...p}>
    <path d="M21 7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16V7" />
    <path d="M16 14h.01" />
  </S>
);

export const IconTrendUp = (p: IconProps) => (
  <S {...p}>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </S>
);

export const IconFilterX = (p: IconProps) => (
  <S {...p}>
    <path d="M13.5 4H21M3 4h6.5M10 2v4M14 20H3M21 20h-2.5M17.5 22v-4" />
    <path d="m3 7 6 6v5l6-4V13l6-6" opacity="0" />
  </S>
);

export const IconInfo = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </S>
);

export const IconBell = (p: IconProps) => (
  <S {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </S>
);

export const IconLock = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </S>
);

export const IconSpinner = ({ className = "w-5 h-5" }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`animate-spin ${className}`}
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconBanknote = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 12h.01M18 12h.01" />
  </S>
);

export const IconHistory = (p: IconProps) => (
  <S {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 2" />
  </S>
);
