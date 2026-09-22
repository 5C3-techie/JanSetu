'use client';

import React, { useState, useEffect } from 'react';
import { profileStore, schemeStore, documentStore, CitizenProfile, EligibilityResult } from '@/lib/storage';
import { evaluateAllSchemes } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SchemeCard from '@/components/SchemeCard';
import { SlidersHorizontal, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WhatIfPage() {
  const { language, t } = useLanguage();
  const [baseProfile, setBaseProfile] = useState<CitizenProfile | null>(null);
  const [simProfile, setSimProfile] = useState<CitizenProfile | null>(null);
  
  const [baseResults, setBaseResults] = useState<EligibilityResult[]>([]);
  const [simResults, setSimResults] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    const current = profileStore.getProfile();
    const schemes = schemeStore.getAllSchemes();
    const docs = documentStore.getDocuments();

    setBaseProfile(current);
    setSimProfile({ ...current });

    const baseEval = evaluateAllSchemes(current, schemes, docs);
    setBaseResults(baseEval);
    setSimResults(baseEval);
  }, []);

  const handleAttributeChange = (field: keyof CitizenProfile, value: any) => {
    if (!simProfile) return;
    const updated = { ...simProfile, [field]: value };
    setSimProfile(updated);

    const schemes = schemeStore.getAllSchemes();
    const docs = documentStore.getDocuments();
    const newEval = evaluateAllSchemes(updated, schemes, docs);
    setSimResults(newEval);
  };

  if (!baseProfile || !simProfile) return null;

  const baseMatchedCount = baseResults.filter(r => r.matchStatus === 'MATCHED').length;
  const simMatchedCount = simResults.filter(r => r.matchStatus === 'MATCHED').length;

  const newlyMatched = simResults.filter(r => 
    r.matchStatus === 'MATCHED' && 
    baseResults.find(b => b.schemeId === r.schemeId)?.matchStatus !== 'MATCHED'
  );

  return (
    <div className="space-y-8 py-2">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-600" />
            <span>"What If?" Eligibility Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate profile attribute changes (e.g. income or land ownership) to see real-time rule engine matching results.
          </p>
        </div>

        <button
          onClick={() => {
            const current = profileStore.getProfile();
            setSimProfile({ ...current });
            setSimResults(baseResults);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* SIMULATION CONTROLS BOX */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Modify Simulation Attributes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Income Slider / Input */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">Annual Income (INR ₹)</label>
            <input
              type="number"
              value={simProfile.annualIncome}
              onChange={(e) => handleAttributeChange('annualIncome', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Original: ₹{baseProfile.annualIncome.toLocaleString('en-IN')}</span>
              <span className="font-bold text-amber-700">Simulated: ₹{simProfile.annualIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Land Ownership Toggle */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">Land Ownership Status</label>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="simLand"
                  checked={simProfile.landOwnership === true}
                  onChange={() => handleAttributeChange('landOwnership', true)}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Owns Land</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="simLand"
                  checked={simProfile.landOwnership === false}
                  onChange={() => handleAttributeChange('landOwnership', false)}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Landless</span>
              </label>
            </div>
          </div>

          {/* Occupation Selection */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-slate-800 block">Occupation Category</label>
            <select
              value={simProfile.occupation}
              onChange={(e) => handleAttributeChange('occupation', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="agricultural_labourer">Agricultural Labourer</option>
              <option value="farmer">Landholding Farmer</option>
              <option value="street_vendor">Street Vendor</option>
              <option value="artisan">Artisan</option>
              <option value="unorganised_worker">Unorganised Worker</option>
            </select>
          </div>
        </div>
      </div>

      {/* BEFORE VS AFTER IMPACT SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BEFORE BOX */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-2 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            BEFORE (Current Profile)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{baseMatchedCount}</span>
            <span className="text-xs text-slate-300">Likely Matches</span>
          </div>
          <p className="text-xs text-slate-400">
            Based on income ₹{baseProfile.annualIncome.toLocaleString('en-IN')}, land: {baseProfile.landOwnership ? 'Yes' : 'No'}
          </p>
        </div>

        {/* AFTER BOX */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 text-white p-6 rounded-2xl shadow-md space-y-2">
          <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wider block">
            AFTER (Simulated Profile)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{simMatchedCount}</span>
            <span className="text-xs text-amber-100">Likely Matches</span>
          </div>
          <p className="text-xs text-amber-100">
            Based on simulated income ₹{simProfile.annualIncome.toLocaleString('en-IN')}, land: {simProfile.landOwnership ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* NEWLY UNLOCKED / MATCHED SCHEMES */}
      {newlyMatched.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold">Newly Unlocked Scheme Matches ({newlyMatched.length})</h3>
          </div>
          <p className="text-xs text-emerald-800">
            Changing these attributes satisfied the rule conditions for the following schemes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {newlyMatched.map(res => (
              <SchemeCard key={res.schemeId} result={res} />
            ))}
          </div>
        </div>
      )}

      {/* ALL SIMULATED MATCH RESULTS */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">All Simulated Rule Engine Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {simResults.map(res => (
            <SchemeCard key={res.schemeId} result={res} />
          ))}
        </div>
      </div>

    </div>
  );
}
