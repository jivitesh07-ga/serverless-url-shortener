// A small, self-contained icon set. Avoids adding an icon library dependency for a
// handful of glyphs — keeps the bundle lightweight, per the project's performance goals.
// All icons share stroke width / cap / join for visual consistency.
import type { ReactNode } from 'react';

export type IconName =
  | 'link'
  | 'copy'
  | 'external-link'
  | 'trash'
  | 'clock'
  | 'calendar'
  | 'shield'
  | 'shield-warning'
  | 'check'
  | 'warning'
  | 'analytics'
  | 'plus'
  | 'refresh'
  | 'x'
  | 'spinner'
  | 'cursor-click';

const paths: Record<IconName, ReactNode> = {
  link: (
    <>
      <path d="M9 15 15 9" />
      <path d="M10.5 6.5 12 5a4.24 4.24 0 0 1 6 6l-1.5 1.5" />
      <path d="M13.5 17.5 12 19a4.24 4.24 0 0 1-6-6l1.5-1.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5.5 14.5H5A2.5 2.5 0 0 1 2.5 12V5A2.5 2.5 0 0 1 5 2.5h7A2.5 2.5 0 0 1 14.5 5v.5" />
    </>
  ),
  'external-link': (
    <>
      <path d="M10.5 4h7.5v7.5" />
      <path d="M18 4 9.5 12.5" />
      <path d="M15.5 12.5V17a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 17v-6A2.5 2.5 0 0 1 7 8.5h4.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.5" />
      <path d="M10.2 10.5v6" />
      <path d="M13.8 10.5v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 1.9" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4.5" />
      <path d="M16 3v4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6.5V11c0 5-3 8.4-7 9.5-4-1.1-7-4.5-7-9.5V6.5z" />
      <path d="M9 12l2 2 4-4.2" />
    </>
  ),
  'shield-warning': (
    <>
      <path d="M12 3.5 19 6.5V11c0 5-3 8.4-7 9.5-4-1.1-7-4.5-7-9.5V6.5z" />
      <path d="M12 8.5V13" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  warning: (
    <>
      <path d="M12 3.8 21.2 19.5a1 1 0 0 1-.86 1.5H3.66a1 1 0 0 1-.86-1.5L12 3.8Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  analytics: (
    <>
      <path d="M4.5 19.5v-7" />
      <path d="M11 19.5V6" />
      <path d="M17.5 19.5V11" />
      <path d="M3 19.5h18" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5L19.5 8.5" />
      <path d="M19.5 4.5v4h-4" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.6 5.5L4.5 15.5" />
      <path d="M4.5 19.5v-4h4" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  spinner: <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />,
  'cursor-click': (
    <>
      <path d="M6 4.5 8 19l3.2-4.6L15 18l1.6-1.6-3.6-3.8L18 11z" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `icon icon-${name} ${className}` : `icon icon-${name}`}
      aria-hidden="true"
      role="presentation"
    >
      {paths[name]}
    </svg>
  );
}
