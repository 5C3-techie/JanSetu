'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ShieldCheck, Info, Heart, Lock } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                <img 
                  src="/images/logo.png" 
                  alt="Jan-Setu Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">{t.appName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {t.tagline} {t.heroSubtitle}
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/80 rounded-lg p-3">
              <Info className="w-4 h-4 shrink-0" />
              <span>{t.disclaimerText}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">{t.navDashboard}</Link></li>
              <li><Link href="/schemes" className="hover:text-white transition-colors">{t.navFindSchemes}</Link></li>
              <li><Link href="/documents" className="hover:text-white transition-colors">{t.navDocuments}</Link></li>
              <li><Link href="/saved" className="hover:text-white transition-colors">Saved Schemes</Link></li>
              <li><Link href="/applications" className="hover:text-white transition-colors">Application Tracker</Link></li>
              <li><Link href="/reminders" className="hover:text-white transition-colors">{t.navReminders}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors text-emerald-400 font-semibold">Privacy & Data Controls</Link></li>
            </ul>
          </div>

          {/* Col 3: Specialized Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Assistance Tools</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/what-if" className="hover:text-white transition-colors">{t.navWhatIf}</Link></li>
              <li><Link href="/ask" className="hover:text-white transition-colors">{t.navAsk}</Link></li>
              <li><Link href="/csc" className="hover:text-white transition-colors">{t.navCSC}</Link></li>
              <li><Link href="/report" className="hover:text-white transition-colors">{t.navReport}</Link></li>
              <li><Link href="/admin/schemes" className="hover:text-white transition-colors text-amber-400 font-medium">Admin Verification</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider & Sub-footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{t.footerCopyright}</p>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="flex items-center gap-1 hover:text-slate-300"><Lock className="w-3.5 h-3.5" /> Privacy & Security Controls</Link>
            <span>•</span>
            <span className="flex items-center gap-1">Deterministic Engine + Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
