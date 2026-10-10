'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShieldCheck,
  LayoutDashboard,
  User,
  Search,
  FolderLock,
  Bookmark,
  Bell,
  ClipboardList,
  Sparkles,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenHelp?: () => void;
  savedCount?: number;
  remindersCount?: number;
  applicationsCount?: number;
}

export default function DashboardSidebar({
  isOpen = false,
  onClose,
  onOpenHelp,
  savedCount,
  remindersCount,
  applicationsCount,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { language } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    {
      href: '/dashboard',
      label: language === 'te' ? 'డ్యాష్‌బోర్డ్' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/profile',
      label: language === 'te' ? 'నా ప్రొఫైల్' : 'My Profile',
      icon: User,
      badge: null,
    },
    {
      href: '/schemes',
      label: language === 'te' ? 'పథకాల అన్వేషణ' : 'Explore Schemes',
      icon: Search,
      badge: null,
    },
    {
      href: '/documents',
      label: language === 'te' ? 'నా పత్రాలు' : 'My Documents',
      icon: FolderLock,
      badge: null,
    },
    {
      href: '/saved',
      label: language === 'te' ? 'సేవ్ చేసిన పథకాలు' : 'Saved Schemes',
      icon: Bookmark,
      badge: savedCount && savedCount > 0 ? savedCount : null,
    },
    {
      href: '/reminders',
      label: language === 'te' ? 'జ్ఞాపికలు' : 'Reminders',
      icon: Bell,
      badge: remindersCount && remindersCount > 0 ? remindersCount : null,
    },
    {
      href: '/applications',
      label: language === 'te' ? 'నా దరఖాస్తులు' : 'My Applications',
      icon: ClipboardList,
      badge: applicationsCount && applicationsCount > 0 ? applicationsCount : null,
    },
    {
      href: '/ask',
      label: language === 'te' ? 'జన్-సేతు ని అడగండి' : 'Ask Jan-Setu',
      icon: Sparkles,
      badge: 'AI',
    },
  ];

  const bottomLinks = [
    {
      href: '/profile',
      label: language === 'te' ? 'సెట్టింగులు' : 'Settings',
      icon: Settings,
      action: null,
    },
    {
      href: '/privacy',
      label: language === 'te' ? 'గోప్యత & భద్రత' : 'Privacy',
      icon: Shield,
      action: null,
    },
    {
      href: '#help',
      label: language === 'te' ? 'సహాయం & మద్దతు' : 'Help & Support',
      icon: HelpCircle,
      action: onOpenHelp,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
        <Link 
          href="/dashboard" 
          onClick={onClose}
          className="flex items-center gap-3 group transition-transform focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
              JAN-SETU
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
              {language === 'te' ? 'సంక్షేమ పథకాల వారధి' : 'Civic Welfare Bridge'}
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
        <div className="px-2.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {language === 'te' ? 'ప్రధాన నావిగేషన్' : 'Main Menu'}
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    item.badge === 'AI'
                      ? 'bg-indigo-100 text-indigo-700'
                      : isActive
                      ? 'bg-blue-200/60 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Separated Section */}
      <div className="p-3.5 border-t border-slate-100 space-y-1 bg-slate-50/50">
        <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {language === 'te' ? 'సహాయం & వ్యవస్థ' : 'Support & Settings'}
        </div>

        {bottomLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const actionFn = item.action;

          if (actionFn) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  actionFn();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all text-left"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left mt-1"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>{language === 'te' ? 'లాగ్ అవుట్' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200/80 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
