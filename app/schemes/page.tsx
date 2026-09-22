'use client';

import React, { useState, useEffect } from 'react';
import { profileStore, schemeStore, documentStore, CitizenProfile, EligibilityResult } from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SchemeCard from '@/components/SchemeCard';
import { Search, Filter, Layers } from 'lucide-react';

export default function SchemesExplorerPage() {
  const { language, t } = useLanguage();
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [onlyMatched, setOnlyMatched] = useState<boolean>(false);

  useEffect(() => {
    const profile = profileStore.getProfile();
    const schemes = schemeStore.getAllSchemes();
    const docs = documentStore.getDocuments();

    const evaluated = evaluateAllSchemes(profile, schemes, docs);
    setResults(evaluated);
  }, []);

  const sectors = ['All', 'Agriculture', 'Health', 'Housing', 'Social Welfare', 'Livelihood', 'Education'];

  const filtered = results.filter(r => {
    const matchesSearch = 
      r.scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.scheme.teluguName.includes(searchTerm) ||
      r.scheme.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = selectedSector === 'All' || r.scheme.sector.toLowerCase() === selectedSector.toLowerCase();
    const matchesOnlyLikely = !onlyMatched || r.matchStatus === 'MATCHED';

    return matchesSearch && matchesSector && matchesOnlyLikely;
  });

  return (
    <div className="space-y-6 py-2">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            <span>Scheme Explorer & Knowledge Base</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all 15+ curated government welfare schemes with structured rules, verified deadlines, and document checklists.
          </p>
        </div>

        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          {filtered.length} Schemes Available
        </span>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scheme name, benefit, or sector..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Sector Filter Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSector === sector
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Likely Match Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 whitespace-nowrap bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <input
            type="checkbox"
            checked={onlyMatched}
            onChange={(e) => setOnlyMatched(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span>Likely Matches Only</span>
        </label>
      </div>

      {/* SCHEME CARDS GRID */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(res => (
            <SchemeCard key={res.schemeId} result={res} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes found matching your search</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search keywords or switching sector filters.
          </p>
        </div>
      )}

    </div>
  );
}
