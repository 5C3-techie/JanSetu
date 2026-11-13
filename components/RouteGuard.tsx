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
  '/profile',
];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // isFirebaseReady is not used to gate rendering — we handle it internally here
  const { user, loading } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    // Wait for Firebase auth to finish its initial check
    if (loading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    if (isProtectedRoute && !user) {
      // Not signed in — redirect to login, but also clear the gate so
      // the redirect can complete without the spinner blocking navigation.
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      // Allow the child to render briefly during navigation; Next.js will complete the
      // redirect. Setting isAuthorizing = false here avoids an infinite spinner.
      setIsAuthorizing(false);
    } else if (isAuthRoute && user) {
      // Already signed in — send to dashboard
      router.push('/dashboard');
      setIsAuthorizing(false);
    } else {
      // No redirect needed — clear the gate and render normally
      setIsAuthorizing(false);
    }
  }, [user, loading, pathname, router]);

  // Only show the full-screen spinner while Firebase auth is still initialising
  // (typically < 500 ms). Once loading is done, render children even during navigation.
  if (loading || isAuthorizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
