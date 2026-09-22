'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { profileStore, schemeStore, documentStore, reminderStore, CitizenProfile, EligibilityResult } from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SchemeCard from '@/components/SchemeCard';
import { 
  CheckCircle2, 
  AlertCircle, 
  FolderLock, 
  Bell, 
  UserCheck, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'partial'>('matched');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentProfile = profileStore.getProfile();
    const schemes = schemeStore.getAllSchemes();
    const docs = documentStore.getDocuments();

    setProfile(currentProfile);

    const evaluated = evaluateAllSchemes(currentProfile, schemes, docs);
    setResults(evaluated);
  };

  const handleReloadDemo = () => {
    const demo = profileStore.resetProfileToDemo();
    setProfile(demo);
    loadData();
  };

  if (!profile) return null;

  const matchedList = results.filter(r => r.matchStatus === 'MATCHED');
  const partialList = results.filter(r => r.matchStatus === 'PARTIAL_MATCH');
  const notMatchedList = results.filter(r => r.matchStatus === 'NOT_MATCHED');

  // Total missing documents across likely & partial matches
  const allMissingDocs = new Set<string>();
  [...matchedList, ...partialList].forEach(r => r.missingDocuments.forEach(d => allMissingDocs.add(d)));

  // Profile completion calculation
  const profileFields = [
    profile.name,
    profile.age,
    profile.state,
    profile.occupation,
    profile.annualIncome !== undefined,
    profile.landOwnership !== undefined,
    profile.category,
    profile.hasAadhaar
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const completionPercentage = Math.round((filledCount / profileFields.length) * 100);

  const displayedResults = 
    activeTab === 'matched' 
      ? matchedList 
      : activeTab === 'partial' 
      ? partialList 
      : results;

  return (
    <div className="space-y-8 py-2">
      
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Benefit Radar</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Active Assessment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Citizen Profile: <strong className="text-slate-800">{profile.name}</strong> ({profile.age} yrs, {profile.occupation.replace(/_/g, ' ')}, {profile.state})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReloadDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Persona</span>
          </button>
          
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* BENCHMARK STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Profile Completion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.profileCompletion}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700">{completionPercentage}%</span>
            <span className="text-[11px] text-slate-400">Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-blue-600" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* Likely Matches */}
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.likelyMatches}
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 block">{matchedList.length}</span>
          <span className="text-[11px] text-emerald-700">Rules Satisfied</span>
        </div>

        {/* Needs Verification */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            {t.needsVerification}
          </span>
          <span className="text-2xl font-extrabold text-amber-700 block">{partialList.length}</span>
          <span className="text-[11px] text-amber-700">Missing Info/Close</span>
        </div>

        {/* Missing Documents */}
        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <FolderLock className="w-3.5 h-3.5 text-rose-600" />
            {t.missingDocs}
          </span>
          <span className="text-2xl font-extrabold text-rose-700 block">{allMissingDocs.size}</span>
          <span className="text-[11px] text-rose-700">Action Required</span>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200/80 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-purple-600" />
            {t.upcomingDeadlines}
          </span>
          <span className="text-2xl font-extrabold text-purple-700 block">
            {reminderStore.getReminders().filter(r => r.status === 'active').length}
          </span>
          <span className="text-[11px] text-purple-700">Active Reminders</span>
        </div>
      </div>

      {/* FILTER TABS & SCHEME LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matched'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Likely Matches ({matchedList.length})
            </button>
            <button
              onClick={() => setActiveTab('partial')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'partial'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Needs Verification ({partialList.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Schemes ({results.length})
            </button>
          </div>

          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
          >
            <span>{t.btnPrepareMissing}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scheme Cards Grid */}
        {displayedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedResults.map((res) => (
              <SchemeCard key={res.schemeId} result={res} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching schemes in this view</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't identify schemes matching this specific tab. Try updating your profile details or view all schemes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
