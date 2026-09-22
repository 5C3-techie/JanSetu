'use client';

import React from 'react';
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
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SchemeCardProps {
  result: EligibilityResult;
  onSetReminder?: (schemeId: string) => void;
}

export default function SchemeCard({ result, onSetReminder }: SchemeCardProps) {
  const { language, t } = useLanguage();
  const { scheme, matchStatus, statusLabel, matchedCriteria, availableDocuments, missingDocuments, readinessLabel, readinessPercentage } = result;

  const isMatched = matchStatus === 'MATCHED';
  const isPartial = matchStatus === 'PARTIAL_MATCH';

  return (
    <div className={`rounded-xl border p-5 transition-all shadow-xs ${
      isMatched 
        ? 'bg-white border-emerald-200/90 hover:border-emerald-400 hover:shadow-md' 
        : isPartial 
        ? 'bg-white border-amber-200/90 hover:border-amber-400 hover:shadow-md' 
        : 'bg-slate-50/70 border-slate-200 text-slate-500'
    }`}>
      {/* Top Bar: Sector & Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {scheme.sector}
        </span>

        {/* Match Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isMatched
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : isPartial
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-slate-200 text-slate-700'
        }`}>
          {isMatched ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : isPartial ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{isMatched ? t.matched : isPartial ? t.partialMatch : t.notMatched}</span>
        </div>
      </div>

      {/* Scheme Title */}
      <h3 className="text-lg font-bold text-slate-900 leading-snug">
        {language === 'te' ? scheme.teluguName : scheme.name}
      </h3>

      {/* Short Description */}
      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
        {language === 'te' ? scheme.teluguDescription : scheme.description}
      </p>

      {/* Benefit Highlights */}
      <div className="mt-3.5 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
          Key Benefits
        </span>
        <ul className="space-y-1">
          {(language === 'te' ? scheme.teluguBenefits : scheme.benefits).slice(0, 2).map((benefit, idx) => (
            <li key={idx} className="text-xs text-blue-950 flex items-start gap-1.5 font-medium">
              <span className="text-blue-600 font-bold">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why You May Match */}
      {matchedCriteria.length > 0 && (
        <div className="mt-3">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
            {t.whyMatch}
          </span>
          <div className="space-y-1">
            {matchedCriteria.slice(0, 2).map((criterion, idx) => (
              <p key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{criterion}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Document Readiness Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Application Readiness
          </span>
          <span className="font-bold text-blue-700">{readinessLabel}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              readinessPercentage === 100 
                ? 'bg-emerald-500' 
                : readinessPercentage >= 50 
                ? 'bg-blue-600' 
                : 'bg-amber-500'
            }`}
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>

        {/* Missing docs tag */}
        {missingDocuments.length > 0 && (
          <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Missing: {missingDocuments.slice(0, 2).join(', ')}{missingDocuments.length > 2 ? '...' : ''}</span>
          </p>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{scheme.deadline ? `Deadline: ${scheme.deadline}` : 'Rolling Window'}</span>
        </div>

        <Link
          href={`/schemes/${scheme.schemeId}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
