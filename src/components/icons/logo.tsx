import Image from 'next/image';
import type { ComponentProps } from 'react';

interface LogoProps extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  className?: string;
}

export function Logo({ className = '', width = 40, height = 40, ...props }: LogoProps) {
  return (
    <Image
      src="/icon.png"
      alt="Ethio Man United Logo"
      width={width}
      height={height}
      className={className}
      priority
      {...props}
    />
  );
}
