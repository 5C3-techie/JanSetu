'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUnifiedProfile, isProfileComplete } from '@/lib/storage';
import { Loader2, ShieldAlert, UserCheck, LogIn } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileCompletion?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireProfileCompletion = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileDone, setProfileDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkUserAccess() {
      if (loading) return;

      if (!user) {
        setCheckingProfile(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (requireProfileCompletion && pathname !== '/profile') {
        const userProfile = await getUnifiedProfile(user.uid);
        const hasCompleted = isProfileComplete(userProfile);
        
        if (isMounted) {
          setProfileDone(hasCompleted);
          setCheckingProfile(false);
          
          if (!hasCompleted) {
            router.push('/profile?notice=complete_profile');
          }
        }
      } else {
        if (isMounted) {
          setCheckingProfile(false);
        }
      }
    }

    checkUserAccess();

    return () => {
      isMounted = false;
    };
  }, [user, loading, pathname, requireProfileCompletion, router]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800">Verifying Civic Authentication...</p>
          <p className="text-xs text-slate-500">Connecting securely to Jan-Setu Cloud</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs text-slate-600">
            Please sign in or create an account to access your personalized schemes, document vault, and application tracker.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (requireProfileCompletion && !profileDone && pathname !== '/profile') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
          <UserCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Complete Your Profile First</h2>
          <p className="text-xs text-slate-600">
            To view matching schemes and document readiness, please enter your personal details first.
          </p>
        </div>
        <Link
          href="/profile"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
        >
          Complete My Profile
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
