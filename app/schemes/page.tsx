'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedProfile, 
  getUnifiedDocuments, 
  getUnifiedSavedSchemes,
  toggleUnifiedSavedScheme,
  schemeStore, 
  EligibilityResult 
} from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SchemeCard from '@/components/SchemeCard';
import SchemeFilterSidebar, { FilterState } from '@/components/SchemeFilterSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Search, 
  Filter, 
  Loader2, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchTerm: '',
  governmentLevel: 'All',
  state: 'All',
  sector: 'All',
  occupation: 'All',
  category: 'All',
  gender: 'all',
  maxIncome: 0,
  benefitType: 'All',
  applicationMode: 'All',
  onlyMatched: false,
};

function SchemesContent() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync URL search parameters with filter state
  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get('q') || searchParams.get('searchTerm');
    const occ = searchParams.get('occupation');
    const benefit = searchParams.get('benefit') || searchParams.get('benefitType');
    const sec = searchParams.get('sector') || searchParams.get('category');
    const gen = searchParams.get('gender');
    const lvl = searchParams.get('level') || searchParams.get('governmentLevel');

    setFilters(prev => ({
      ...prev,
      searchTerm: q !== null ? q : prev.searchTerm,
      occupation: occ !== null ? occ : prev.occupation,
      benefitType: benefit !== null ? (benefit.charAt(0).toUpperCase() + benefit.slice(1)) : prev.benefitType,
      sector: sec !== null ? (sec.charAt(0).toUpperCase() + sec.slice(1)) : prev.sector,
      gender: gen !== null ? gen : prev.gender,
      governmentLevel: lvl !== null ? lvl : prev.governmentLevel,
    }));
  }, [searchParams]);

  useEffect(() => {
    const loadSchemesData = async () => {
      setIsLoading(true);
      try {
        const [profile, docs, saved] = await Promise.all([
          getUnifiedProfile(user?.uid),
          getUnifiedDocuments(user?.uid),
          getUnifiedSavedSchemes(user?.uid),
        ]);

        setSavedSchemeIds(saved);
        const schemes = schemeStore.getAllSchemes();
        const evaluated = evaluateAllSchemes(profile, schemes, docs);
        setResults(evaluated);
      } catch (err) {
        console.error('Error evaluating schemes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSchemesData();
  }, [user]);

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

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Multi-attribute filtering logic
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const s = r.scheme;

      // 1. Text Search across name, telugu name, description, benefits, department, sector
      if (filters.searchTerm.trim()) {
        const query = filters.searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesTelugu = s.teluguName?.includes(query);
        const matchesDesc = s.description.toLowerCase().includes(query);
        const matchesSector = s.sector.toLowerCase().includes(query);
        const matchesBenefits = s.benefits.some(b => b.toLowerCase().includes(query));
        const matchesMinistry = s.ministry?.toLowerCase().includes(query) || s.department?.toLowerCase().includes(query);

        if (!matchesName && !matchesTelugu && !matchesDesc && !matchesSector && !matchesBenefits && !matchesMinistry) {
          return false;
        }
      }

      // 2. Government Level (Central vs State)
      if (filters.governmentLevel !== 'All') {
        if (s.level !== filters.governmentLevel) return false;
      }

      // 3. State Jurisdiction
      if (filters.state !== 'All') {
        if (s.level === 'State') {
          if (!s.states || !s.states.includes(filters.state)) return false;
        }
      }

      // 4. Sector / Theme
      if (filters.sector !== 'All') {
        if (s.sector.toLowerCase() !== filters.sector.toLowerCase()) return false;
      }

      // 5. Occupation
      if (filters.occupation !== 'All') {
        const occList = s.eligibility.occupation || [];
        if (occList.length > 0 && !occList.includes('all') && !occList.includes(filters.occupation)) {
          return false;
        }
      }

      // 6. Social Category
      if (filters.category !== 'All') {
        const catList = s.eligibility.category || [];
        if (catList.length > 0 && !catList.includes('All') && !catList.includes(filters.category)) {
          return false;
        }
      }

      // 7. Gender
      if (filters.gender !== 'all') {
        const targetGender = s.eligibility.gender;
        if (targetGender && targetGender !== 'all' && targetGender !== filters.gender) {
          return false;
        }
      }

      // 8. Max Income
      if (filters.maxIncome > 0) {
        const schemeMax = s.eligibility.incomeMax;
        if (schemeMax && schemeMax < filters.maxIncome) {
          return false;
        }
      }

      // 9. Benefit Type
      if (filters.benefitType !== 'All') {
        const hasBenefit = s.benefits.some(b => b.toLowerCase().includes(filters.benefitType.toLowerCase()));
        if (!hasBenefit) return false;
      }

      // 10. Application Mode
      if (filters.applicationMode !== 'All') {
        if (s.applicationMode && s.applicationMode !== 'Both' && s.applicationMode !== filters.applicationMode) {
          return false;
        }
      }

      // 11. Likely Matches Only
      if (filters.onlyMatched && r.matchStatus !== 'MATCHED') {
        return false;
      }

      return true;
    });
  }, [results, filters]);

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="space-y-6 py-4">
        
        {/* Top Header Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Government Scheme Directory
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-emerald-700" />
              <span>Government Scheme Explorer</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic rule evaluation, official guidelines, and application links verified against official government portals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{filteredResults.length} Verified Schemes Available</span>
            </span>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search by scheme name, keywords (e.g. 'scholarship', 'farmer', 'housing'), department, or benefits..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400 bg-slate-50/50"
            />
          </div>

          {filters.searchTerm && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl"
            >
              Clear
            </button>
          )}
        </div>

        {/* TWO-COLUMN LAYOUT: SIDEBAR + RESULTS GRID */}
        <div className="flex items-start gap-6">
          
          {/* MULTI-ATTRIBUTE FILTER SIDEBAR */}
          <SchemeFilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            totalResults={filteredResults.length}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* MAIN RESULTS FEED */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/90 rounded-2xl border border-slate-200 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-700">Evaluating deterministic eligibility engine...</p>
                <p className="text-[11px] text-slate-400">Comparing your profile attributes against verified statutory rules.</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredResults.map(res => (
                  <SchemeCard 
                    key={res.schemeId} 
                    result={res} 
                    isSaved={savedSchemeIds.includes(res.schemeId)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                <Search className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">No schemes matched your current filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try broadening your search term or resetting specific filters (such as Income ceiling or Occupation) to discover more schemes.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>

        </div>

      </div>
    </ProtectedRoute>
  );
}

export default function SchemesExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SchemesContent />
    </Suspense>
  );
}
