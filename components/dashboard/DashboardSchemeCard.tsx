'use client';

import React from 'react';
import Link from 'next/link';
import { EligibilityResult } from '@/lib/storage/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface DashboardSchemeCardProps {
  result: EligibilityResult;
  isSaved?: boolean;
  onToggleSave?: (schemeId: string) => void;
}

export default function DashboardSchemeCard({
  result,
  isSaved = false,
  onToggleSave,
}: DashboardSchemeCardProps) {
  const { language } = useLanguage();
  const { scheme, matchStatus, matchedCriteria, missingDocuments, readinessLabel, readinessPercentage } = result;

  const isMatched = matchStatus === 'MATCHED';
  const isPartial = matchStatus === 'PARTIAL_MATCH';

  // Government & Ministry Label
  const govLabel = 
    scheme.level === 'Central'
      ? 'GOVERNMENT OF INDIA'
      : scheme.states?.includes('Telangana')
      ? 'GOVERNMENT OF TELANGANA'
      : 'STATE GOVERNMENT';

  const ministryOrDept = scheme.ministry || scheme.department || scheme.sector;

  // Primary benefit excerpt
  const primaryBenefit = 
    language === 'te' && scheme.teluguBenefits?.length > 0
      ? scheme.teluguBenefits[0]
      : scheme.benefits?.length > 0
      ? scheme.benefits[0]
      : null;

  // Total required documents count & available
  const totalDocs = scheme.requiredDocuments?.length || 0;
  const missingCount = missingDocuments?.length || 0;
  const readyCount = Math.max(0, totalDocs - missingCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between group">
      
      <div>
        {/* Top: Government Level & Ministry */}
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          <span>{govLabel}</span>
          <span className="text-slate-400 font-semibold truncate max-w-[140px] text-right">
            {ministryOrDept}
          </span>
        </div>

        {/* Scheme Name */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
          {language === 'te' && scheme.teluguName ? scheme.teluguName : scheme.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
          {language === 'te' && scheme.teluguDescription ? scheme.teluguDescription : scheme.description}
        </p>

        {/* Core Benefit */}
        {primaryBenefit && (
          <div className="mt-3 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-1.5">
            <span className="text-blue-600 font-bold shrink-0">•</span>
            <span className="line-clamp-1 font-medium">{primaryBenefit}</span>
          </div>
        )}

        {/* Transparent Eligibility Status Badge (No arbitrary AI percentages!) */}
        <div className="mt-3.5 flex items-center justify-between">
          {isMatched ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'te' ? 'అర్హత నిబంధనలు సరిపోయాయి' : 'Eligibility requirements satisfied'}
              </span>
            </div>
          ) : isPartial ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {language === 'te' ? 'మరింత సమాచారం అవసరం' : 'More information needed'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {language === 'te' ? 'బహుశా అర్హులు' : 'Possibly eligible'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Document Readiness & Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
        
        {/* Document Readiness Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Documents</span>
            </span>
            <span className="font-bold text-slate-700">
              {totalDocs > 0 ? `${readyCount}/${totalDocs}` : 'Not Specified'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                readinessPercentage === 100 
                  ? 'bg-emerald-600' 
                  : readinessPercentage >= 50 
                  ? 'bg-blue-600' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${totalDocs > 0 ? readinessPercentage : 0}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/schemes/${scheme.schemeId}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <span>{language === 'te' ? 'పథకం వివరాలు' : 'View Scheme'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onToggleSave) onToggleSave(scheme.schemeId);
            }}
            title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
