'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Filter, 
  X, 
  RotateCcw, 
  Building, 
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
  const { language, t } = useLanguage();
  const isTe = language === 'te';

  const update = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const removeChip = (key: keyof FilterState, defaultValue: any) => {
    onFilterChange({ ...filters, [key]: defaultValue });
  };

  // Determine active filter chips
  const activeChips: { label: string; key: keyof FilterState; defaultValue: any }[] = [];
  if (filters.governmentLevel !== 'All') {
    activeChips.push({ 
      label: isTe ? `${filters.governmentLevel === 'Central' ? 'కేంద్ర' : 'రాష్ట్ర'} ప్రభుత్వం` : `${filters.governmentLevel} Govt`, 
      key: 'governmentLevel', 
      defaultValue: 'All' 
    });
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
    activeChips.push({ label: `${isTe ? 'వర్గం' : 'Category'}: ${filters.category}`, key: 'category', defaultValue: 'All' });
  }
  if (filters.gender !== 'all') {
    activeChips.push({ 
      label: `${isTe ? 'లింగం' : 'Gender'}: ${filters.gender === 'female' ? (isTe ? 'మహిళలు' : 'Women') : (isTe ? 'పురుషులు' : 'Men')}`, 
      key: 'gender', 
      defaultValue: 'all' 
    });
  }
  if (filters.maxIncome > 0) {
    activeChips.push({ 
      label: `${isTe ? 'ఆదాయం' : 'Income'} ≤ ₹${(filters.maxIncome / 100000).toFixed(1)}L`, 
      key: 'maxIncome', 
      defaultValue: 0 
    });
  }
  if (filters.benefitType !== 'All') {
    activeChips.push({ label: filters.benefitType, key: 'benefitType', defaultValue: 'All' });
  }
  if (filters.applicationMode !== 'All') {
    activeChips.push({ 
      label: `${isTe ? 'విధానం' : 'Mode'}: ${filters.applicationMode}`, 
      key: 'applicationMode', 
      defaultValue: 'All' 
    });
  }
  if (filters.onlyMatched) {
    activeChips.push({ 
      label: t.likelyMatchesOnly || (isTe ? 'అర్హత ఉన్నవి మాత్రమే' : 'Likely Matches Only'), 
      key: 'onlyMatched', 
      defaultValue: false 
    });
  }

  const content = (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-slate-900 text-sm">{t.filtersTitle || 'Filters & Criteria'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {totalResults} {t.schemesCount || (isTe ? 'పథకాలు' : 'schemes')}
          </span>
          {activeChips.length > 0 && (
            <button
              onClick={onReset}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.btnReset || (isTe ? 'రీసెట్' : 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {t.activeFilters || (isTe ? 'ఎంపిక చేసిన ఫిల్టర్లు' : 'Active Filters')} ({activeChips.length})
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
          <span>{t.likelyMatchesOnly || (isTe ? 'నాకు అర్హత ఉన్నవి మాత్రమే' : 'Likely Matches Only')}</span>
        </label>
        <p className="text-[10px] text-emerald-800 font-medium pl-6">
          {t.likelyMatchesDesc || (isTe ? 'మీ ప్రస్తుత ప్రొఫైల్‌కు సరిపోయే పథకాలను మాత్రమే చూపిస్తుంది.' : 'Filters schemes that strictly align with your current saved profile.')}
        </p>
      </div>

      {/* GROUP 1: GOVERNMENT LEVEL */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.govLevel || (isTe ? 'ప్రభుత్వ స్థాయి' : 'Government Level')}</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'All', label: isTe ? 'అన్నీ' : 'All' },
            { id: 'Central', label: isTe ? 'కేంద్రం' : 'Central' },
            { id: 'State', label: isTe ? 'రాష్ట్రం' : 'State' }
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => update('governmentLevel', lvl.id)}
              className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all text-center border ${
                filters.governmentLevel === lvl.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* GROUP 2: STATE SELECTION */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">{t.stateJurisdiction || (isTe ? 'రాష్ట్ర పరిధి' : 'State Jurisdiction')}</label>
        <select
          value={filters.state}
          onChange={(e) => update('state', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allIndia || (isTe ? 'భారతదేశం అంతటా / ఏదైనా రాష్ట్రం' : 'All India / Any State')}</option>
          <option value="Telangana">{isTe ? 'తెలంగాణ' : 'Telangana'}</option>
          <option value="Andhra Pradesh">{isTe ? 'ఆంధ్రప్రదేశ్' : 'Andhra Pradesh'}</option>
          <option value="Karnataka">{isTe ? 'కర్ణాటక' : 'Karnataka'}</option>
          <option value="Maharashtra">{isTe ? 'మహారాష్ట్ర' : 'Maharashtra'}</option>
        </select>
      </div>

      {/* GROUP 3: OCCUPATION */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.beneficiaryOccupation || (isTe ? 'లబ్ధిదారుని వృత్తి' : 'Beneficiary Occupation')}</span>
        </label>
        <select
          value={filters.occupation}
          onChange={(e) => update('occupation', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allOccupations || (isTe ? 'అన్ని వృత్తులు' : 'All Occupations')}</option>
          <option value="student">{isTe ? 'విద్యార్థి' : 'Student'}</option>
          <option value="farmer">{isTe ? 'రైతు (సాగుదారు)' : 'Farmer (Cultivator)'}</option>
          <option value="small_farmer">{isTe ? 'సన్నకారు & చిన్న రైతు' : 'Small & Marginal Farmer'}</option>
          <option value="agricultural_labourer">{isTe ? 'వ్యవసాయ కూలీ' : 'Agricultural Labourer'}</option>
          <option value="unemployed">{isTe ? 'నిరుద్యోగి / ఉద్యోగార్ధి' : 'Unemployed / Job Seeker'}</option>
          <option value="business_owner">{isTe ? 'చిన్న వ్యాపారి / ఎంఎస్ఎంఈ' : 'MSME Entrepreneur / Trader'}</option>
          <option value="artisan">{isTe ? 'చేతివృత్తులు / చేనేత / కళాకారుడు' : 'Artisan / Weaver / Craftsman'}</option>
          <option value="senior_citizen">{isTe ? 'వయోవృద్ధులు / పెన్షనర్' : 'Senior Citizen / Pensioner'}</option>
          <option value="salaried">{isTe ? 'వేతన ఉద్యోగి' : 'Salaried Employee'}</option>
          <option value="homemaker">{isTe ? 'గృహిణి' : 'Homemaker'}</option>
        </select>
      </div>

      {/* GROUP 4: SECTOR / CATEGORY */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">{t.sectorsAndThemes || (isTe ? 'రంగాలు & విభాగాలు' : 'Sectors & Themes')}</label>
        <select
          value={filters.sector}
          onChange={(e) => update('sector', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allSectors || (isTe ? 'అన్ని రంగాలు' : 'All Sectors')}</option>
          <option value="Agriculture">{isTe ? 'వ్యవసాయం & అనుబంధ రంగాలు' : 'Agriculture & Farming'}</option>
          <option value="Education">{isTe ? 'విద్య & స్కాలర్‌షిప్‌లు' : 'Education & Scholarships'}</option>
          <option value="Health">{isTe ? 'ఆరోగ్యం & వైద్య బీమా' : 'Health & Medical Insurance'}</option>
          <option value="Housing">{isTe ? 'గృహ నిర్మాణం & ఇళ్ళు' : 'Housing & Shelter'}</option>
          <option value="Social Welfare">{isTe ? 'సామాజిక సంక్షేమం & భద్రత' : 'Social Welfare & Security'}</option>
          <option value="Women and Child">{isTe ? 'మహిళా & శిశు అభివృద్ధి' : 'Women & Child Development'}</option>
          <option value="Skill Development">{isTe ? 'నైపుణ్యాభివృద్ధి & శిక్షణ' : 'Skill Development & Training'}</option>
          <option value="Employment">{isTe ? 'ఉపాధి & జీవనోపాధి' : 'Employment & Livelihood'}</option>
          <option value="Senior Citizens">{isTe ? 'వయోవృద్ధుల సంక్షేమం' : 'Senior Citizens Welfare'}</option>
          <option value="Disability">{isTe ? 'దివ్యాంగుల సంక్షేమం' : 'Disability (PwD) Welfare'}</option>
        </select>
      </div>

      {/* GROUP 5: SOCIAL CATEGORY */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.socialCategory || (isTe ? 'సామాజిక వర్గం' : 'Social Category')}</span>
        </label>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allCategories || (isTe ? 'అన్ని వర్గాలు / ఓపెన్' : 'All Categories / Open')}</option>
          <option value="General">{isTe ? 'జనరల్ / ఓపెన్' : 'General / Open Category'}</option>
          <option value="BC">{isTe ? 'వెనుకబడిన తరగతులు (BC / OBC)' : 'Backward Classes (BC / OBC)'}</option>
          <option value="SC">{isTe ? 'షెడ్యూల్డ్ కులాలు (SC)' : 'Scheduled Caste (SC)'}</option>
          <option value="ST">{isTe ? 'షెడ్యూల్డ్ తెగలు (ST)' : 'Scheduled Tribe (ST)'}</option>
          <option value="EBC">{isTe ? 'ఆర్థికంగా వెనుకబడిన (EWS / EBC)' : 'Economically Backward (EWS / EBC)'}</option>
          <option value="Minority">{isTe ? 'మైనారిటీ వర్గాలు' : 'Minority Communities'}</option>
        </select>
      </div>

      {/* GROUP 6: BENEFIT TYPE */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.primaryBenefitType || (isTe ? 'ప్రయోజనం రకం' : 'Primary Benefit Type')}</span>
        </label>
        <select
          value={filters.benefitType}
          onChange={(e) => update('benefitType', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allBenefitTypes || (isTe ? 'అన్ని రకాల ప్రయోజనాలు' : 'All Benefit Types')}</option>
          <option value="Scholarship">{isTe ? 'స్కాలర్‌షిప్ & ఫీజు రీయింబర్స్‌మెంట్' : 'Scholarship & Fee Waiver'}</option>
          <option value="Subsidy">{isTe ? 'సబ్సిడీ & ఆర్థిక గ్రాంట్' : 'Subsidy & Financial Grant'}</option>
          <option value="Pension">{isTe ? 'నెలవారీ పెన్షన్' : 'Monthly Pension'}</option>
          <option value="Loan">{isTe ? 'రుణం / మైక్రో లోన్' : 'Credit / Micro-Loan'}</option>
          <option value="Insurance">{isTe ? 'బీమా రక్షణ' : 'Insurance Cover'}</option>
          <option value="Cash assistance">{isTe ? 'ప్రత్యక్ష నగదు బదిలీ (DBT)' : 'Direct Cash Support (DBT)'}</option>
          <option value="Healthcare">{isTe ? 'ఉచిత వైద్య చికిత్స' : 'Free Medical Care'}</option>
          <option value="Housing">{isTe ? 'ఉచిత ఇల్లు / నిర్మాణ సాయం' : 'Free House / Financial Aid for House'}</option>
        </select>
      </div>

      {/* GROUP 7: INCOME CEILING */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.annualFamilyIncome || (isTe ? 'కుటుంబ వార్షిక ఆదాయం' : 'Annual Family Income')}</span>
        </label>
        <select
          value={filters.maxIncome}
          onChange={(e) => update('maxIncome', parseInt(e.target.value, 10))}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value={0}>{t.anyIncome || (isTe ? 'పరిమితి లేదు / ఏదైనా ఆదాయం' : 'Any Income / No Limit')}</option>
          <option value={150000}>{isTe ? 'ఏడాదికి ₹1.5 లక్షల వరకు' : 'Up to ₹1.5 Lakh / year'}</option>
          <option value={200000}>{isTe ? 'ఏడాదికి ₹2.0 లక్షల వరకు' : 'Up to ₹2.0 Lakh / year'}</option>
          <option value={250000}>{isTe ? 'ఏడాదికి ₹2.5 లక్షల వరకు' : 'Up to ₹2.5 Lakh / year'}</option>
          <option value={500000}>{isTe ? 'ఏడాదికి ₹5.0 లక్షల వరకు' : 'Up to ₹5.0 Lakh / year'}</option>
        </select>
      </div>

      {/* GROUP 8: GENDER */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">{t.targetGender || (isTe ? 'లక్ష్య లింగం' : 'Target Gender')}</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'all', label: isTe ? 'అందరికీ' : 'All' },
            { id: 'female', label: isTe ? 'మహిళలు' : 'Women' },
            { id: 'male', label: isTe ? 'పురుషులు' : 'Men' },
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

      {/* GROUP 9: APPLICATION METHOD */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 block">{t.applicationMethod || (isTe ? 'దరఖాస్తు విధానం' : 'Application Method')}</label>
        <select
          value={filters.applicationMode}
          onChange={(e) => update('applicationMode', e.target.value)}
          className="w-full p-2 rounded-xl border border-slate-200 text-slate-900 font-medium bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{t.allMethods || (isTe ? 'అన్ని విధానాలు (ఆన్‌లైన్ / ఆఫ్‌లైన్)' : 'All Methods (Online / Offline)')}</option>
          <option value="Online">{t.onlinePortal || (isTe ? 'ఆన్‌లైన్ పోర్టల్' : 'Online Portal')}</option>
          <option value="Offline">{t.offlineOffice || (isTe ? 'ఆఫ్‌లైన్ / కార్యాలయం ద్వారా' : 'Offline / Physical Office')}</option>
          <option value="Both">{t.bothOnlineOffline || (isTe ? 'ఆన్‌లైన్ & ఆఫ్‌లైన్ / CSC' : 'Both Online & Offline / CSC')}</option>
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
              <h3 className="font-extrabold text-base text-slate-900">
                {isTe ? 'ప్రభుత్వ పథకాల వడపోత' : 'Filter Government Schemes'}
              </h3>
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
                {isTe 
                  ? `${t.btnApplyFilters || 'ఫిల్టర్లను వర్తింపజేయండి'} (${totalResults} పథకాలు)`
                  : `Apply Filters (${totalResults} Schemes)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
