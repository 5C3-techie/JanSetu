'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedProfile, 
  getUnifiedDocuments, 
  addUnifiedReminder, 
  toggleUnifiedSavedScheme,
  getUnifiedSavedSchemes,
  schemeStore, 
  EligibilityResult 
} from '@/lib/storage';
import { evaluateEligibility } from '@/lib/eligibility/engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import OfficialRedirectModal from '@/components/OfficialRedirectModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Calendar, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles, 
  Bell, 
  FolderLock, 
  Info,
  Loader2,
  ShieldCheck,
  Building,
  Bookmark,
  BookmarkCheck,
  Check,
  Share2
} from 'lucide-react';

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const schemeId = params.id as string;

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [explanation, setExplanation] = useState<{ whyMatched: string[]; missingRequirements: string[]; friendlySummary: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [redirectModalUrl, setRedirectModalUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadSchemeDetail = async () => {
      const [profile, docs, savedIds] = await Promise.all([
        getUnifiedProfile(user?.uid),
        getUnifiedDocuments(user?.uid),
        getUnifiedSavedSchemes(user?.uid),
      ]);

      const scheme = schemeStore.getSchemeById(schemeId);

      if (scheme) {
        setIsSaved(savedIds.includes(scheme.schemeId));
        const evalResult = evaluateEligibility(profile, scheme, docs);
        setResult(evalResult);

        // Fetch Gemini grounded explanation
        setLoadingAi(true);
        fetch('/api/explain-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, result: evalResult, lang: language }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.explanation) setExplanation(data.explanation);
          })
          .catch(err => console.error('Gemini explanation error:', err))
          .finally(() => setLoadingAi(false));
      }
    };

    loadSchemeDetail();
  }, [schemeId, language, user]);

  if (!result) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-500">Scheme details not found in verified knowledge base.</p>
        <Link href="/schemes" className="text-xs font-bold text-emerald-700 hover:underline">
          Return to Scheme Explorer
        </Link>
      </div>
    );
  }

  const { scheme, matchStatus, availableDocuments, missingDocuments, readinessLabel, readinessPercentage } = result;

  const isMatched = matchStatus === 'MATCHED';
  const isPartial = matchStatus === 'PARTIAL_MATCH';

  const handleSetReminder = async () => {
    const deadline = scheme.deadline || scheme.applicationDeadline || '2026-11-30';
    await addUnifiedReminder({
      userId: user?.uid || 'guest_user',
      schemeId: scheme.schemeId,
      schemeName: scheme.name,
      deadline,
      reminderDate: deadline,
      reminderType: '7_days_before',
      notes: `Application deadline reminder for ${scheme.name}`,
    }, user?.uid);

    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  const handleToggleSave = async () => {
    try {
      const nowSaved = await toggleUnifiedSavedScheme(scheme.schemeId, user?.uid);
      setIsSaved(nowSaved);
    } catch (err) {
      console.error('Error toggling saved scheme:', err);
    }
  };

  const officialAppUrl = scheme.applicationUrl || scheme.officialSourceUrl || scheme.officialSource;

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        
        {/* Back and Bookmark Nav */}
        <div className="flex items-center justify-between">
          <Link href="/schemes" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Scheme Explorer</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isSaved 
                  ? 'bg-blue-50 text-blue-700 border-blue-300' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-blue-600 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved in Vault' : 'Save Scheme'}</span>
            </button>
          </div>
        </div>

        {/* HEADER CARD */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                scheme.level === 'Central' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
              }`}>
                {scheme.level === 'Central' ? 'Central Government' : 'State Government Scheme'}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {scheme.sector} Sector
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Official Data</span>
              </span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              isMatched
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : isPartial
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {isMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{isMatched ? t.matched : isPartial ? t.partialMatch : t.notMatched}</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">
              {language === 'te' ? scheme.teluguName : scheme.name}
            </h1>
            {scheme.officialName && (
              <p className="text-xs font-bold text-slate-500 mt-1">
                Official Gazetted Title: {scheme.officialName}
              </p>
            )}
            <p className="text-xs md:text-sm text-slate-600 mt-3 leading-relaxed">
              {language === 'te' ? scheme.teluguDescription : scheme.description}
            </p>
          </div>

          {/* MINISTRY AUDIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Responsible Ministry</span>
              <span className="font-bold text-slate-800">{scheme.ministry || 'Ministry of Rural Development'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Department & Level</span>
              <span className="font-bold text-slate-800">{scheme.department || 'Welfare Division'} ({scheme.level || 'State/Central'})</span>
            </div>
          </div>

          {/* OFFICIAL APPLY BUTTON BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Verified Portal Link
              </span>
              <p className="text-xs text-blue-100 font-medium">
                Apply directly on the designated government portal without middlemen.
              </p>
            </div>

            {officialAppUrl ? (
              <button
                type="button"
                onClick={() => setRedirectModalUrl(officialAppUrl)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-md transition-all shrink-0"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">
                Official application link unavailable
              </span>
            )}
          </div>
        </div>

        {/* GEMINI AI MATCH EXPLANATION SECTION */}
        <div className="bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">Jan-Setu AI Explanation Layer</h2>
          </div>

          {loadingAi ? (
            <div className="flex items-center gap-2 text-xs text-slate-300 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>Generating grounded explanation with Gemini AI...</span>
            </div>
          ) : explanation ? (
            <div className="space-y-4 text-xs">
              <p className="text-slate-200 text-sm font-medium leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/10">
                "{explanation.friendlySummary}"
              </p>

              {explanation.whyMatched.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Why You Qualify</h4>
                  <ul className="space-y-1.5 text-slate-200">
                    {explanation.whyMatched.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.missingRequirements.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Missing Eligibility Factors</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {explanation.missingRequirements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Deterministic criteria evaluated based on statutory rules.</p>
          )}
        </div>

        {/* DOCUMENT READINESS VAULT CARD */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-emerald-700" />
                <span>Document Readiness Checklist</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cross-referenced automatically against your private Document Vault.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {readinessLabel} ({readinessPercentage}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Ready Documents */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Ready in Vault ({availableDocuments.length})</h4>
              {availableDocuments.length > 0 ? (
                <ul className="space-y-1 text-xs text-emerald-900">
                  {availableDocuments.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">None of the required documents are currently uploaded.</p>
              )}
            </div>

            {/* Missing Documents */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">Missing Documents ({missingDocuments.length})</h4>
              {missingDocuments.length > 0 ? (
                <ul className="space-y-1 text-xs text-rose-900">
                  {missingDocuments.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-bold">All required documents are ready in your vault!</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <FolderLock className="w-4 h-4" />
              <span>Open Document Vault to Upload</span>
            </Link>
          </div>
        </div>

        {/* BENEFITS & APPLICATION STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Benefits */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Statutory Benefits</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {(language === 'te' ? scheme.teluguBenefits : scheme.benefits).map((b, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Steps */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Application Procedure</h3>
            <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
              {scheme.applicationSteps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {scheme.guidelineSourceUrl && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Official Guidelines:</span>
                <a
                  href={scheme.guidelineSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                >
                  <span>View Official PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Application Deadline:{' '}
              <strong>{scheme.deadline || scheme.applicationDeadline || 'Rolling / Open through financial year'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSetReminder}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>{reminderSet ? 'Reminder Scheduled!' : 'Set Deadline Reminder'}</span>
            </button>
          </div>
        </div>

        {/* OFFICIAL REDIRECT SAFETY MODAL */}
        {redirectModalUrl && (
          <OfficialRedirectModal
            isOpen={Boolean(redirectModalUrl)}
            onClose={() => setRedirectModalUrl(null)}
            destinationUrl={redirectModalUrl}
            schemeName={scheme.name}
            ministry={scheme.ministry}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
