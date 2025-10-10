'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminNav } from '@/components/layout/admin-nav';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  
  const [isChecking, setIsChecking] = useState(!isLoginPage);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [isLoginPage, router]);

  // If on login page, render without authentication check
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render anything (redirecting)
  if (!isAuthenticated) {
    return null;
  }

  // For authenticated admin pages, render with sidebar
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64">
        <AdminNav />
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
