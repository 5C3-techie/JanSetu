'use client';

import React from 'react';
import { 
  Filter, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ShieldCheck,
  Building,
  GraduationCap,
  Briefcase,
  IndianRupee,
  Users,
  HeartHandshake
} from 'lucide-react';

export interface FilterState {
  searchTerm: string;
  governmentLevel: string; // 'All' | 'Central' | 'State'
  state: string; // 'All' | 'Telangana' | 'Andhra Pradesh' | etc.
  sector: string; // 'All' | 'Agriculture' | 'Education' | etc.
  occupation: string; // 'All' | 'student' | 'farmer' | etc.
  category: string; // 'All' | 'SC' | 'ST' | 'BC' | 'General' | 'Minority'
  gender: string; // 'all' | 'female' | 'male'
  maxIncome: number; // 0 for unlimited, or e.g. 150000, 250000, 500000
  benefitType: string; // 'All' | 'Scholarship' | 'Subsidy' | 'Pension' | 'Loan' | 'Insurance' | 'Cash assistance' | 'Healthcare' | 'Housing'
  applicationMode: string; // 'All' | 'Online' | 'Offline' | 'Both'
  onlyMatched: boolean;
}

interface SchemeFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function SchemeFilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  isOpenMobile,
  onCloseMobile,
}: SchemeFilterSidebarProps) {

  const update = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const removeChip = (key: keyof FilterState, defaultValue: any) => {
    onFilterChange({ ...filters, [key]: defaultValue });
  };

  // Determine active filter chips
  const activeChips: { label: string; key: keyof FilterState; defaultValue: any }[] = [];
  if (filters.governmentLevel !== 'All') {
    activeChips.push({ label: `${filters.governmentLevel} Govt`, key: 'governmentLevel', defaultValue: 'All' });
  }
  if (filters.state !== 'All') {
    activeChips.push({ label: filters.state, key: 'state', defaultValue: 'All' });
  }
  if (filters.sector !== 'All') {
    activeChips.push({ label: filters.sector, key: 'sector', defaultValue: 'All' });
  }
  if (filters.occupation !== 'All') {
    activeChips.push({ label: filters.occupation, key: 'occupation', defaultValue: 'All' });
  }
  if (filters.category !== 'All') {
    activeChips.push({ label: `Category: ${filters.category}`, key: 'category', defaultValue: 'All' });
  }
  if (filters.gender !== 'all') {
    activeChips.push({ label: `Gender: ${filters.gender}`, key: 'gender', defaultValue: 'all' });
  }
  if (filters.maxIncome > 0) {
    activeChips.push({ label: `Income ≤ ₹${(filters.maxIncome / 100000).toFixed(1)}L`, key: 'maxIncome', defaultValue: 0 });
  }
  if (filters.benefitType !== 'All') {
    activeChips.push({ label: filters.benefitType, key: 'benefitType', defaultValue: 'All' });
  }
  if (filters.applicationMode !== 'All') {
    activeChips.push({ label: `Mode: ${filters.applicationMode}`, key: 'applicationMode', defaultValue: 'All' });
  }
  if (filters.onlyMatched) {
    activeChips.push({ label: 'Likely Matches Only', key: 'onlyMatched', defaultValue: false });
  }

  const content = (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-slate-900 text-sm">Filters & Criteria</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {totalResults} schemes
          </span>
          {activeChips.length > 0 && (
            <button
              onClick={onReset}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Filters ({activeChips.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 font-bold text-[11px] border border-emerald-300"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key, chip.defaultValue)}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* MATCHED ONLY TOGGLE */}
      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-1">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
          <input
            type="checkbox"
            checked={filters.onlyMatched}
            onChange={(e) => update('onlyMatched', e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
          />
          <span>Likely Matches Only</span>
        </label>
        <p className="text-[10px] text-emerald-800 font-medium pl-6">
          Filters schemes that strictly align with your current saved profile.
        </p>
      </div>

      {/* GROUP 1: GOVERNMENT LEVEL */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>Government Level</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['All', 'Central', 'State'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => update('governmentLevel', lvl)}
              className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all text-center border ${
                filters.governmentLevel === lvl
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* GROUP 2: STATE SELECTION */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">State Jurisdiction</label>
        <select
          value={filters.state}
          onChange={(e) => update('state', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All India / Any State</option>
          <option value="Telangana">Telangana</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>
      </div>

      {/* GROUP 3: OCCUPATION */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>Beneficiary Occupation</span>
        </label>
        <select
          value={filters.occupation}
          onChange={(e) => update('occupation', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Occupations</option>
          <option value="student">Student</option>
          <option value="farmer">Farmer (Cultivator)</option>
          <option value="small_farmer">Small & Marginal Farmer</option>
          <option value="agricultural_labourer">Agricultural Labourer</option>
          <option value="unemployed">Unemployed / Job Seeker</option>
          <option value="business_owner">MSME Entrepreneur / Trader</option>
          <option value="artisan">Artisan / Weaver / Craftsman</option>
          <option value="senior_citizen">Senior Citizen / Pensioner</option>
          <option value="salaried">Salaried Employee</option>
        </select>
      </div>

      {/* GROUP 4: SECTOR / CATEGORY */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">Sectors & Themes</label>
        <select
          value={filters.sector}
          onChange={(e) => update('sector', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Sectors</option>
          <option value="Agriculture">Agriculture & Farming</option>
          <option value="Education">Education & Scholarships</option>
          <option value="Health">Health & Medical Insurance</option>
          <option value="Housing">Housing & Shelter</option>
          <option value="Social Welfare">Social Welfare & Security</option>
          <option value="Women and Child">Women & Child Development</option>
          <option value="Skill Development">Skill Development & Training</option>
          <option value="Employment">Employment & Livelihood</option>
          <option value="Senior Citizens">Senior Citizens Welfare</option>
          <option value="Disability">Disability (PwD) Welfare</option>
        </select>
      </div>

      {/* GROUP 5: SOCIAL CATEGORY */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Social Category</span>
        </label>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Categories / Open</option>
          <option value="General">General / Open Category</option>
          <option value="BC">Backward Classes (BC / OBC)</option>
          <option value="SC">Scheduled Caste (SC)</option>
          <option value="ST">Scheduled Tribe (ST)</option>
          <option value="EBC">Economically Backward (EWS / EBC)</option>
          <option value="Minority">Minority Communities</option>
        </select>
      </div>

      {/* GROUP 6: BENEFIT TYPE */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
          <span>Primary Benefit Type</span>
        </label>
        <select
          value={filters.benefitType}
          onChange={(e) => update('benefitType', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Benefit Types</option>
          <option value="Scholarship">Scholarship & Fee Waiver</option>
          <option value="Subsidy">Subsidy & Financial Grant</option>
          <option value="Pension">Monthly Pension</option>
          <option value="Loan">Credit / Micro-Loan</option>
          <option value="Insurance">Insurance Cover</option>
          <option value="Cash assistance">Direct Cash Support (DBT)</option>
          <option value="Healthcare">Free Medical Care</option>
          <option value="Housing">Free House / Financial Aid for House</option>
        </select>
      </div>

      {/* GROUP 7: INCOME CEILING */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
          <span>Annual Family Income</span>
        </label>
        <select
          value={filters.maxIncome}
          onChange={(e) => update('maxIncome', parseInt(e.target.value, 10))}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value={0}>Any Income / No Limit</option>
          <option value={150000}>Up to ₹1.5 Lakh / year</option>
          <option value={200000}>Up to ₹2.0 Lakh / year</option>
          <option value={250000}>Up to ₹2.5 Lakh / year</option>
          <option value={500000}>Up to ₹5.0 Lakh / year</option>
        </select>
      </div>

      {/* GROUP 8: GENDER */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">Target Gender</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'female', label: 'Women' },
            { id: 'male', label: 'Men' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update('gender', item.id)}
              className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all text-center border ${
                filters.gender === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* GROUP 9: APPLICATION MODE */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">Application Method</label>
        <select
          value={filters.applicationMode}
          onChange={(e) => update('applicationMode', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Methods (Online / Offline)</option>
          <option value="Online">Online Portal</option>
          <option value="Offline">Offline / Physical Office</option>
          <option value="Both">Both Online & Offline / CSC</option>
        </select>
      </div>

    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs self-start sticky top-24">
        {content}
      </aside>

      {/* MOBILE DRAWER MODAL */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm p-0 animate-in fade-in duration-200">
          <div 
            className="w-full max-h-[85vh] bg-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Filter Government Schemes</h3>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-md"
              >
                Apply Filters ({totalResults} Schemes)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
