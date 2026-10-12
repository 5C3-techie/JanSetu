'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EligibilityResult } from '@/lib/storage/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Bookmark,
  BookmarkCheck,
  Building,
  ShieldCheck
} from 'lucide-react';

interface SchemeCardProps {
  result: EligibilityResult;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
  onSetReminder?: (schemeId: string) => void;
}

export default function SchemeCard({ 
  result, 
  isSaved = false, 
  onToggleSave, 
  onSetReminder 
}: SchemeCardProps) {
  const { language, t } = useLanguage();
  const { scheme, matchStatus, matchedCriteria, missingDocuments, readinessLabel, readinessPercentage } = result;

  const [saved, setSaved] = useState(isSaved);

  const isMatched = matchStatus === 'MATCHED';
  const isPartial = matchStatus === 'PARTIAL_MATCH';

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onToggleSave) {
      onToggleSave(scheme.schemeId);
    }
  };

  const levelLabel = scheme.level === 'Central' ? 'Central Government' : scheme.states?.includes('Telangana') ? 'Telangana State' : 'State Government';

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
      isMatched 
        ? 'bg-white/95 border-emerald-300 shadow-sm hover:shadow-md hover:border-emerald-500' 
        : isPartial 
        ? 'bg-white/95 border-amber-300 shadow-sm hover:shadow-md hover:border-amber-500' 
        : 'bg-white/80 border-slate-200 shadow-xs hover:border-slate-300 text-slate-600'
    }`}>
      
      {/* Top Header: Level, Sector & Save Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              scheme.level === 'Central'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-purple-50 text-purple-800 border border-purple-200'
            }`}>
              <Building className="w-3 h-3" />
              <span>{levelLabel}</span>
            </span>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {scheme.sector}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmark}
            title={saved ? 'Remove from Saved Schemes' : 'Save Scheme for Later'}
            className={`p-1.5 rounded-xl border transition-all ${
              saved 
                ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-xs' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 border-transparent'
            }`}
          >
            {saved ? <BookmarkCheck className="w-4 h-4 fill-blue-600" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Scheme Name */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
          {language === 'te' ? scheme.teluguName : scheme.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
          {language === 'te' ? scheme.teluguDescription : scheme.description}
        </p>

        {/* Key Benefits */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Core Benefits
          </span>
          <ul className="space-y-1">
            {(language === 'te' ? scheme.teluguBenefits : scheme.benefits).slice(0, 2).map((benefit, idx) => (
              <li key={idx} className="text-xs text-slate-800 flex items-start gap-1.5 font-medium leading-tight">
                <span className="text-emerald-600 font-bold">•</span>
                <span className="line-clamp-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Match Status Badge */}
        <div className="mt-3 flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isMatched
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : isPartial
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {isMatched ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : isPartial ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isMatched ? t.matched : isPartial ? t.partialMatch : t.notMatched}</span>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {scheme.applicationMode || 'Online'}
          </span>
        </div>

        {/* Why Matched Points */}
        {matchedCriteria.length > 0 && (
          <div className="mt-2.5 space-y-1">
            {matchedCriteria.slice(0, 2).map((criterion, idx) => (
              <p key={idx} className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{criterion}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Readiness & Action */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        
        {/* Document Readiness Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Documents: {readinessLabel}
            </span>
            <span className="font-bold text-emerald-700">{readinessPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                readinessPercentage === 100 
                  ? 'bg-emerald-500' 
                  : readinessPercentage >= 50 
                  ? 'bg-blue-600' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer Meta & Details Button */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">
              {scheme.deadline ? scheme.deadline : 'Rolling'}
            </span>
          </div>

          <Link
            href={`/schemes/${scheme.schemeId}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
