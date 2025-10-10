'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Newspaper, MessageCircleWarning, LayoutDashboard, LogOut, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/news', label: 'News Management', icon: Newspaper },
  { href: '/admin/forum', label: 'Forum Moderation', icon: MessageSquare },
  { href: '/admin/comments', label: 'Comment Moderation', icon: MessageCircleWarning },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }

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
      
      {/* Logout Button */}
      <div className="mt-4 pt-4 border-t">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="justify-start w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </nav>
  );
}
