'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DeadlineReminder, CitizenProfile } from '@/lib/storage/types';
import {
  Search,
  Bell,
  Menu,
  User as UserIcon,
  LogOut,
  Settings,
  UserCheck,
  ChevronDown,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  profile?: CitizenProfile | null;
  reminders?: DeadlineReminder[];
}

export default function DashboardHeader({
  onToggleSidebar,
  profile,
  reminders = [],
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/schemes');
    }
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  // Generate neutral initials from real user name or email
  const getInitials = (): string => {
    const rawName = profile?.name || profile?.fullName || user?.displayName;
    if (rawName && rawName.trim()) {
      const parts = rawName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return '';
  };

  const displayName = profile?.name || profile?.fullName || user?.displayName || user?.email?.split('@')[0] || (language === 'te' ? 'పౌరుడు' : 'Citizen');
  const activeReminders = reminders.filter(r => r.status === 'active');
  const initials = getInitials();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all shadow-xs">
      
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'te' 
                ? 'ప్రభుత్వ పథకాలు లేదా ప్రయోజనాలను వెతకండి...' 
                : 'Search government schemes...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </form>
      </div>

      {/* Right Side: Notifications, Language Selector, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeReminders.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-3 z-30 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {language === 'te' ? 'జ్ఞాపికలు & గడువులు' : 'Reminders & Deadlines'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {activeReminders.length} Active
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {activeReminders.length > 0 ? (
                  activeReminders.slice(0, 4).map((rem) => (
                    <div key={rem.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                      <p className="font-semibold text-slate-800 line-clamp-1">{rem.schemeName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Deadline: {rem.deadline}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-1.5" />
                    <p className="font-medium text-slate-700">All caught up</p>
                    <p className="text-[11px] text-slate-400">No pending deadline reminders</p>
                  </div>
                )}
              </div>

              <div className="pt-2 px-3 border-t border-slate-100">
                <Link
                  href="/reminders"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <span>{language === 'te' ? 'అన్ని జ్ఞాపికలను చూడండి' : 'Manage Reminders'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Language Selector: English / తెలుగు */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('te')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              language === 'te'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            తెలుగు
          </button>
        </div>

        {/* User Avatar & Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left"
          >
            {/* Neutral initials avatar or generic icon - NO fake photos */}
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold tracking-tight">
              {initials ? initials : <UserIcon className="w-4 h-4 text-blue-600" />}
            </div>

            <span className="hidden sm:block text-xs font-semibold text-slate-800 max-w-[120px] truncate">
              {displayName}
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-30 animate-fadeIn">
              {/* User Header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Authenticated Citizen'}</p>
                {user && (
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified Citizen
                  </span>
                )}
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>{language === 'te' ? 'నా ప్రొఫైల్' : 'My Profile'}</span>
                </Link>

                <Link
                  href="/profile#settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{language === 'te' ? 'సెట్టింగులు' : 'Settings'}</span>
                </Link>
              </div>

              {/* Logout Option */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>{language === 'te' ? 'లాగ్ అవుట్' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
