import type { SVGProps } from 'react';

export function FootballIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2L8 4.5V9.5L12 12L16 9.5V4.5L12 2Z" fill="currentColor" />
      <path d="M8 4.5L4 7V12L8 9.5V4.5Z" fill="currentColor" />
      <path d="M16 4.5L20 7V12L16 9.5V4.5Z" fill="currentColor" />
      <path d="M4 12L8 14.5V19.5L4 17V12Z" fill="currentColor" />
      <path d="M20 12L16 14.5V19.5L20 17V12Z" fill="currentColor" />
      <path d="M8 19.5L12 22L16 19.5L12 17L8 19.5Z" fill="currentColor" />
      <path d="M12 2L8 4.5" />
      <path d="M16 4.5L12 2" />
      <path d="M8 4.5V9.5" />
      <path d="M16 4.5V9.5" />
      <path d="M8 9.5L12 12" />
      <path d="M16 9.5L12 12" />
      <path d="M8 4.5L4 7" />
      <path d="M4 7V12" />
      <path d="M8 9.5L4 12" />
      <path d="M16 4.5L20 7" />
      <path d="M20 7V12" />
      <path d="M16 9.5L20 12" />
      <path d="M4 12L8 14.5" />
      <path d="M8 14.5V19.5" />
      <path d="M4 17L8 19.5" />
      <path d="M20 12L16 14.5" />
      <path d="M16 14.5V19.5" />
      <path d="M20 17L16 19.5" />
      <path d="M8 19.5L12 22" />
      <path d="M16 19.5L12 22" />
      <path d="M8 14.5L12 17" />
      <path d="M16 14.5L12 17" />
    </svg>
  );
}
