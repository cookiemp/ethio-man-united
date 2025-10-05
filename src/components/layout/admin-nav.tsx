'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, MessageCircleWarning, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/news', label: 'News Management', icon: Newspaper },
  { href: '/admin/comments', label: 'Comment Moderation', icon: MessageCircleWarning },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {adminLinks.map((link) => {
        const isActive = link.href === '/admin' ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Button
            key={link.href}
            asChild
            variant={isActive ? 'default' : 'ghost'}
            className="justify-start"
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
