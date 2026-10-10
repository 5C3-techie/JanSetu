'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Search, 
  FolderLock, 
  Bell, 
  GitCompare, 
  Sliders, 
  MessageSquare, 
  UserCheck, 
  Building2, 
  Menu, 
  X, 
  LogIn,
  LogOut,
  User as UserIcon,
  Bookmark,
  FileCheck,
  Globe
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { href: '/schemes', label: t.navFindSchemes, icon: Search },
    { href: '/documents', label: t.navDocuments, icon: FolderLock },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/applications', label: 'Tracker', icon: FileCheck },
    { href: '/reminders', label: t.navReminders, icon: Bell },
    { href: '/compare', label: t.navCompare, icon: GitCompare },
    { href: '/what-if', label: t.navWhatIf, icon: Sliders },
    { href: '/ask', label: t.navAsk, icon: MessageSquare },
    { href: '/profile', label: t.navProfile, icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="Jan-Setu Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                Jan-Setu
              </span>
              <span className="hidden md:block text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
                {language === 'te' ? 'సంక్షేమ పథకాల వారధి' : 'Bridging Citizens to Opportunities'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 font-bold border border-blue-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: Auth + Language Switcher */}
          <div className="flex items-center space-x-2.5">
            
            {/* User Authentication Status */}
            {user ? (
              <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-100 pl-2.5 pr-1 py-1 rounded-xl">
                <div className="flex items-center space-x-1.5 text-xs text-blue-900 font-semibold max-w-[130px] truncate">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Language Switcher (Image 1 minimal pill style) */}
            <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  language === 'te'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-white/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-xl animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
