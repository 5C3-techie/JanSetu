'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/schemes',
  '/documents',
  '/saved',
  '/tracker',
  '/applications',
  '/reminders',
  '/compare',
  '/what-if',
  '/chatbot',
  '/ask',
  '/profile'
];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isFirebaseReady } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    if (loading || !isFirebaseReady) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    if (isProtectedRoute && !user) {
      router.push('/login');
    } else if ((isAuthRoute || pathname === '/') && user) {
      router.push('/dashboard');
    } else {
      setIsAuthorizing(false);
    }
  }, [user, loading, isFirebaseReady, pathname, router]);

  if (loading || !isFirebaseReady || isAuthorizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
