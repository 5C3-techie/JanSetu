'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedProfile, 
  getUnifiedDocuments, 
  getUnifiedReminders, 
  getUnifiedSavedSchemes,
  toggleUnifiedSavedScheme,
  schemeStore, 
  CitizenProfile, 
  EligibilityResult, 
  VaultDocument, 
  DeadlineReminder 
} from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import DashboardSchemeCard from '@/components/dashboard/DashboardSchemeCard';
import HelpSupportModal from '@/components/dashboard/HelpSupportModal';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  FolderLock,
  Bookmark,
  Bell,
  ArrowRight,
  UserCheck,
  Sparkles,
  Loader2,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Compass,
  PlusCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface LocalApplicationRecord {
  id: string;
  schemeName: string;
  applicationNumber: string;
  status: string;
  appliedDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<LocalApplicationRecord[]>([]);
  const [results, setResults] = useState<EligibilityResult[]>([]);
  
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'partial'>('matched');
  const [searchQuery, setSearchQuery] = useState('');
  const [askAiQuery, setAskAiQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [currentProfile, docs, rems, savedIds] = await Promise.all([
        getUnifiedProfile(user?.uid),
        getUnifiedDocuments(user?.uid),
        getUnifiedReminders(user?.uid),
        getUnifiedSavedSchemes(user?.uid),
      ]);

      const allSchemes = schemeStore.getAllSchemes();

      setProfile(currentProfile);
      setDocuments(docs);
      setReminders(rems);
      setSavedSchemeIds(savedIds);

      // Evaluate schemes deterministically based on real profile & documents
      const evaluated = evaluateAllSchemes(currentProfile, allSchemes, docs);
      setResults(evaluated);

      // Load applications logged in localStorage
      if (typeof window !== 'undefined') {
        const storedApps = localStorage.getItem('jan_setu_applications');
        if (storedApps) {
          try {
            setApplications(JSON.parse(storedApps));
          } catch {
            setApplications([]);
          }
        } else {
          setApplications([]);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (schemeId: string) => {
    try {
      const isNowSaved = await toggleUnifiedSavedScheme(schemeId, user?.uid);
      setSavedSchemeIds(prev => 
        isNowSaved ? [...prev, schemeId] : prev.filter(id => id !== schemeId)
      );
    } catch (err) {
      console.error('Error toggling saved scheme:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/schemes');
    }
  };

  const handleAskJanSetuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askAiQuery.trim()) {
      router.push(`/ask?q=${encodeURIComponent(askAiQuery.trim())}`);
    } else {
      router.push('/ask');
    }
  };

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'te' ? 'శుభోదయం' : 'Good morning';
    if (hour < 17) return language === 'te' ? 'శుభ మధ్యాహ్నం' : 'Good afternoon';
    return language === 'te' ? 'శుభ సాయంత్రం' : 'Good evening';
  };

  // Actual missing fields calculation
  const missingFields = useMemo(() => {
    if (!profile) return [];
    const missing: { key: string; label: string }[] = [];

    if (!profile.name || !profile.name.trim()) {
      missing.push({ key: 'name', label: language === 'te' ? 'పూర్తి పేరు' : 'Full Name' });
    }
    if (!profile.age || profile.age <= 0) {
      missing.push({ key: 'age', label: language === 'te' ? 'వయస్సు' : 'Age' });
    }
    if (!profile.occupation || profile.occupation.trim() === '') {
      missing.push({ key: 'occupation', label: language === 'te' ? 'వృత్తి / ఉద్యోగం' : 'Occupation' });
    }
    if (!profile.annualIncome || profile.annualIncome <= 0) {
      missing.push({ key: 'income', label: language === 'te' ? 'వార్షిక కుటుంబ ఆదాయం' : 'Annual family income' });
    }
    if (!profile.state || !profile.state.trim()) {
      missing.push({ key: 'state', label: language === 'te' ? 'రాష్ట్రం' : 'State' });
    }
    if (!profile.district || !profile.district.trim()) {
      missing.push({ key: 'district', label: language === 'te' ? 'జిల్లా' : 'District' });
    }
    if (!profile.category || profile.category === 'All') {
      missing.push({ key: 'category', label: language === 'te' ? 'సామాజిక వర్గం' : 'Social Category' });
    }
    if (!profile.educationLevel) {
      missing.push({ key: 'education', label: language === 'te' ? 'విద్యార్హత' : 'Education Level' });
    }

    return missing;
  }, [profile, language]);

  // Profile completion percentage
  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const totalFields = 8;
    const filled = totalFields - missingFields.length;
    return Math.max(0, Math.min(100, Math.round((filled / totalFields) * 100)));
  }, [profile, missingFields]);

  // Deterministic eligibility subsets
  const matchedList = useMemo(() => results.filter(r => r.matchStatus === 'MATCHED'), [results]);
  const partialList = useMemo(() => results.filter(r => r.matchStatus === 'PARTIAL_MATCH'), [results]);

  // Recommended schemes to display (2-4 schemes)
  const displayedSchemes = useMemo(() => {
    if (activeTab === 'matched') {
      return matchedList.slice(0, 4);
    }
    if (activeTab === 'partial') {
      return partialList.slice(0, 4);
    }
    // 'all': prioritize matched, then partial
    return [...matchedList, ...partialList].slice(0, 4);
  }, [activeTab, matchedList, partialList]);

  // Document Readiness calculations
  const { schemesReadyToApply, schemesMissingDocuments } = useMemo(() => {
    let ready = 0;
    let missing = 0;
    matchedList.forEach(r => {
      if (r.missingDocuments.length === 0) {
        ready++;
      } else {
        missing++;
      }
    });
    return { schemesReadyToApply: ready, schemesMissingDocuments: missing };
  }, [matchedList]);

  // Saved scheme results preview
  const savedSchemeResults = useMemo(() => {
    return results.filter(r => savedSchemeIds.includes(r.schemeId)).slice(0, 3);
  }, [results, savedSchemeIds]);

  // Is this a brand new user with no profile info?
  const isNewUser = !profile || (!profile.name && profile.age === 0 && completionPercentage === 0);

  const citizenName = profile?.name || profile?.fullName || user?.displayName;

  return (
    <div className="flex flex-col min-h-full">
      <main className="flex-1 w-full space-y-6">
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">
                  {language === 'te' ? 'డ్యాష్‌బోర్డ్ సమాచారాన్ని లోడ్ చేస్తోంది...' : 'Loading citizen benefit dashboard...'}
                </p>
              </div>
            ) : (
              <>
                {/* 1. DASHBOARD GREETING */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {citizenName ? `${getGreeting()}, ${citizenName}` : (language === 'te' ? 'జన్-సేతు కి స్వాగతం' : 'Welcome to Jan-Setu')}
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {language === 'te' 
                        ? 'మీకు వర్తించే ప్రభుత్వ పథకాలు మరియు ప్రయోజనాలను ఇక్కడ తెలుసుకోండి.' 
                        : 'Discover government schemes and benefits relevant to you.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>{language === 'te' ? 'ధృవీకరించబడిన నిబంధనల ఇంజిన్' : 'Deterministic Rules Engine'}</span>
                    </span>
                  </div>
                </div>

                {/* 2. TOP SUMMARY CARDS (Meaningful Citizen Metrics) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: RELEVANT SCHEMES */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'te' ? 'సంబంధిత పథకాలు' : 'Relevant Schemes'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Compass className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      {isNewUser || completionPercentage < 25 ? (
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-700 block">Complete profile</span>
                          <span className="text-[11px] text-slate-400">To calculate matches</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-2xl font-black text-slate-900 block">{results.length}</span>
                          <span className="text-[11px] text-slate-500 font-medium">Evaluated programs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: ELIGIBLE SCHEMES */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'te' ? 'అర్హతగల పథకాలు' : 'Eligible Schemes'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      {isNewUser || completionPercentage < 25 ? (
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-700 block">Complete profile</span>
                          <span className="text-[11px] text-slate-400">Rules verification pending</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-2xl font-black text-emerald-700 block">{matchedList.length}</span>
                          <span className="text-[11px] text-emerald-800 font-medium">Criteria fully satisfied</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: DOCUMENTS READY */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'te' ? 'పత్రాల సంసిద్ధత' : 'Documents Ready'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FolderLock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      {documents.length === 0 ? (
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-700 block">Vault empty</span>
                          <span className="text-[11px] text-slate-400">0 documents stored</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-2xl font-black text-indigo-900 block">{documents.length}</span>
                          <span className="text-[11px] text-indigo-700 font-medium">Stored in your vault</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: SAVED SCHEMES */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {language === 'te' ? 'సేవ్ చేసిన పథకాలు' : 'Saved Schemes'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Bookmark className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900 block">{savedSchemeIds.length}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Bookmarked for review</span>
                    </div>
                  </div>

                </div>

                {/* 3. PRIMARY ACTION: FIND GOVERNMENT SCHEMES & QUICK FILTERS */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {language === 'te' ? 'ప్రభుత్వ పథకాలను వెతకండి' : 'Find Government Schemes'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'te'
                        ? 'కేంద్ర మరియు రాష్ట్ర ప్రభుత్వాల పథకాల కోసం వెతకండి లేదా క్రింది వర్గాల నుండి ఎంచుకోండి.'
                        : 'Search across 100+ verified Central and State welfare programs.'}
                    </p>
                  </div>

                  {/* Large Search Input */}
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try: scholarships for students, farmer subsidies, housing loans..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                  </form>

                  {/* Popular Searches / Quick Filters */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 mr-1">
                      Popular Filters:
                    </span>

                    <Link
                      href="/schemes?occupation=student"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Student
                    </Link>

                    <Link
                      href="/schemes?benefit=scholarship"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Scholarship
                    </Link>

                    <Link
                      href="/schemes?occupation=farmer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Farmer
                    </Link>

                    <Link
                      href="/schemes?gender=female"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Women
                    </Link>

                    <Link
                      href="/schemes?sector=Healthcare"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Healthcare
                    </Link>

                    <Link
                      href="/schemes?sector=Housing"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Housing
                    </Link>

                    <Link
                      href="/schemes?sector=Employment"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-all"
                    >
                      Employment
                    </Link>
                  </div>
                </div>

                {/* 4. COMPACT QUICK ACTIONS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Link
                    href="/schemes"
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 shadow-xs flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Explore Schemes</span>
                      <span className="text-[10px] text-slate-400">All 100+ programs</span>
                    </div>
                  </Link>

                  <Link
                    href="/profile"
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-xs flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Complete Profile</span>
                      <span className="text-[10px] text-slate-400">{completionPercentage}% complete</span>
                    </div>
                  </Link>

                  <Link
                    href="/documents"
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-xs flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Upload Documents</span>
                      <span className="text-[10px] text-slate-400">Application vault</span>
                    </div>
                  </Link>

                  <Link
                    href="/saved"
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/50 shadow-xs flex items-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Saved Schemes</span>
                      <span className="text-[10px] text-slate-400">{savedSchemeIds.length} bookmarked</span>
                    </div>
                  </Link>
                </div>

                {/* 5. BALANCED 2-COLUMN DESKTOP GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* LEFT COLUMN: 2/3 Width on Desktop */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* RECOMMENDED SCHEMES SECTION */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {language === 'te' ? 'మీ కోసం సిఫార్సు చేసినవి' : 'Recommended for You'}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {language === 'te' 
                              ? 'మీ ప్రొఫైల్ వివరాల ఆధారంగా ఎంపిక చేయబడ్డాయి.' 
                              : 'Based on the information in your profile.'}
                          </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setActiveTab('matched')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'matched'
                                ? 'bg-white text-emerald-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Eligible ({matchedList.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('partial')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'partial'
                                ? 'bg-white text-amber-800 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Needs Info ({partialList.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'all'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            All ({results.length})
                          </button>
                        </div>
                      </div>

                      {/* Schemes List (2-4 Schemes) */}
                      {displayedSchemes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {displayedSchemes.map((res) => (
                            <DashboardSchemeCard
                              key={res.schemeId}
                              result={res}
                              isSaved={savedSchemeIds.includes(res.schemeId)}
                              onToggleSave={handleToggleSave}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <Search className="w-8 h-8 text-slate-300 mx-auto" />
                          <h3 className="text-sm font-bold text-slate-800">
                            {isNewUser 
                              ? 'Complete your profile to get personalized scheme recommendations.' 
                              : 'No schemes matched your current filters.'}
                          </h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            {isNewUser
                              ? 'Provide your age, occupation, and state to activate deterministic scheme matching.'
                              : 'Try updating your profile or exploring the entire government scheme catalog.'}
                          </p>
                          <Link
                            href={isNewUser ? '/profile' : '/schemes'}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all mt-2"
                          >
                            <span>{isNewUser ? 'Complete Profile' : 'Explore Schemes'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* Link to view all schemes */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                        <span className="text-slate-400">
                          Showing {displayedSchemes.length} of {results.length} evaluated schemes
                        </span>
                        <Link
                          href="/schemes"
                          className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Explore All Schemes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* SAVED SCHEMES SECTION */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {language === 'te' ? 'సేవ్ చేసిన పథకాలు' : 'Saved Schemes'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {language === 'te' ? 'మీరు బుక్‌మార్క్ చేసిన పథకాలు' : 'Quickly revisit schemes you marked for later.'}
                          </p>
                        </div>
                        {savedSchemeResults.length > 0 && (
                          <Link
                            href="/saved"
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>View All ({savedSchemeIds.length})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {savedSchemeResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {savedSchemeResults.map(res => (
                            <div
                              key={res.schemeId}
                              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col justify-between gap-2.5 transition-all"
                            >
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  {res.scheme.level || 'Central'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                                  {res.scheme.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                                  {res.scheme.description}
                                </p>
                              </div>
                              <Link
                                href={`/schemes/${res.schemeId}`}
                                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 pt-1"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-100">
                          <Bookmark className="w-6 h-6 text-slate-300 mx-auto" />
                          <p className="text-xs text-slate-600 font-medium">Save schemes you want to revisit later.</p>
                          <Link
                            href="/schemes"
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Explore Schemes</span>
                          </Link>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT COLUMN: 1/3 Width on Desktop */}
                  <div className="space-y-6">
                    
                    {/* PROFILE COMPLETION CARD */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">
                          {completionPercentage === 100 
                            ? 'Profile Complete' 
                            : 'Complete your profile'}
                        </h3>
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {completionPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            completionPercentage === 100 
                              ? 'bg-emerald-600' 
                              : completionPercentage >= 50 
                              ? 'bg-blue-600' 
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {completionPercentage === 100
                          ? 'Your profile is complete. All deterministic criteria are fully up to date.'
                          : 'Add more information to improve your scheme matching.'}
                      </p>

                      {/* Show ONLY actual missing fields */}
                      {missingFields.length > 0 ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 block">Missing details:</span>
                          <ul className="space-y-1">
                            {missingFields.slice(0, 3).map((item) => (
                              <li key={item.key} className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{item.label}</span>
                              </li>
                            ))}
                            {missingFields.length > 3 && (
                              <li className="text-[11px] text-slate-400 pl-3">
                                + {missingFields.length - 3} more fields
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>All personal criteria registered</span>
                        </div>
                      )}

                      <Link
                        href="/profile"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{completionPercentage === 100 ? 'Review Profile Details' : 'Complete Profile'}</span>
                      </Link>
                    </div>

                    {/* DOCUMENT READINESS CARD */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Document Readiness</h3>
                        <FolderLock className="w-4 h-4 text-indigo-600" />
                      </div>

                      {documents.length > 0 ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-700">
                              <span>Stored documents:</span>
                              <strong className="text-slate-900">{documents.length} files</strong>
                            </div>
                            <div className="flex justify-between items-center text-emerald-800">
                              <span>Schemes ready to apply:</span>
                              <strong>{schemesReadyToApply}</strong>
                            </div>
                            {schemesMissingDocuments > 0 && (
                              <div className="flex justify-between items-center text-amber-800">
                                <span>Schemes missing documents:</span>
                                <strong>{schemesMissingDocuments}</strong>
                              </div>
                            )}
                          </div>

                          <Link
                            href="/documents"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                          >
                            <span>View Documents</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <p className="font-semibold text-slate-800">Your document vault is empty.</p>
                          <p className="text-slate-500 leading-relaxed">
                            Upload documents when you're ready to prepare for applications.
                          </p>
                          <Link
                            href="/documents"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            <span>Open Document Vault</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* MY APPLICATIONS CARD */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">My Applications</h3>
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                      </div>

                      {applications.length > 0 ? (
                        <div className="space-y-2.5">
                          {applications.slice(0, 3).map((app) => (
                            <div
                              key={app.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{app.schemeName}</p>
                                <p className="text-[10px] text-slate-400">Ref: {app.applicationNumber}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold shrink-0">
                                {app.status?.replace('_', ' ')}
                              </span>
                            </div>
                          ))}

                          <Link
                            href="/applications"
                            className="w-full inline-flex items-center justify-center gap-1 py-2 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <span>View Applications ({applications.length})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-center py-2">
                          <p className="text-slate-500">You haven't added any applications yet.</p>
                          <Link
                            href="/schemes"
                            className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                          >
                            <span>Explore Schemes</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* UPCOMING REMINDERS CARD */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Upcoming Reminders</h3>
                        <Bell className="w-4 h-4 text-purple-600" />
                      </div>

                      {reminders.filter(r => r.status === 'active').length > 0 ? (
                        <div className="space-y-2.5">
                          {reminders.filter(r => r.status === 'active').slice(0, 3).map((rem) => (
                            <div
                              key={rem.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{rem.schemeName}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{rem.deadline}</span>
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold shrink-0">
                                Active
                              </span>
                            </div>
                          ))}

                          <Link
                            href="/reminders"
                            className="w-full inline-flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-purple-700 hover:underline"
                          >
                            <span>Manage Reminders</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-center py-2">
                          <p className="text-slate-500">No upcoming reminders.</p>
                          <Link
                            href="/reminders"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Create Reminder</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* ASK JAN-SETU (AI ASSISTANT CARD) */}
                    <div className="bg-linear-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl p-5 border border-indigo-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Need help finding a scheme?</h4>
                          <p className="text-[11px] text-slate-500">Tell Jan-Setu what you're looking for.</p>
                        </div>
                      </div>

                      <form onSubmit={handleAskJanSetuSubmit} className="space-y-2">
                        <input
                          type="text"
                          value={askAiQuery}
                          onChange={(e) => setAskAiQuery(e.target.value)}
                          placeholder="I'm a student looking for scholarships."
                          className="w-full px-3 py-2 bg-white border border-indigo-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ask Jan-Setu</span>
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              </>
            )}

          </main>

        {/* Civic Help & Support Modal */}
        <HelpSupportModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
    </div>
  );
}
