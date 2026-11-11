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
import dynamic from 'next/dynamic';
import { translateGovLevel, translateSector } from '@/lib/i18n/translations';
import ProtectedRoute from '@/components/ProtectedRoute';

const OfficialRedirectModal = dynamic(
  () => import('@/components/OfficialRedirectModal'),
  { ssr: false }
);
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
  const [redirectModalData, setRedirectModalData] = useState<{ url: string; portalName?: string } | null>(null);

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
        const evalResult = evaluateEligibility(profile, scheme, docs, language);
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
        <p className="text-sm font-semibold text-slate-500">
          {language === 'te' ? 'పథకం వివరాలు డేటాబేస్‌లో కనుగొనబడలేదు.' : 'Scheme details not found in verified knowledge base.'}
        </p>
        <Link href="/schemes" className="text-xs font-bold text-emerald-700 hover:underline">
          {language === 'te' ? 'పథకాల శోధనకు తిరిగి వెళ్లండి' : 'Return to Scheme Explorer'}
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
            <span>{language === 'te' ? 'పథకాల శోధనకు తిరిగి వెళ్లండి' : 'Back to Scheme Explorer'}</span>
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
              <span>{isSaved ? (language === 'te' ? 'వాల్ట్‌లో భద్రపరచబడింది' : 'Saved in Vault') : (language === 'te' ? 'పథకాన్ని దాచు' : 'Save Scheme')}</span>
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
                {translateGovLevel(scheme.level, language, scheme.states)}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {translateSector(scheme.sector, language)} {language === 'te' ? 'రంగం' : 'Sector'}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'te' ? 'ధృవీకరించబడిన అధికారిక సమాచారం' : 'Verified Official Data'}</span>
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
                {language === 'te' ? 'అధికారిక గెజిట్ శీర్షిక:' : 'Official Gazetted Title:'} {scheme.officialName}
              </p>
            )}
            <p className="text-xs md:text-sm text-slate-600 mt-3 leading-relaxed">
              {language === 'te' ? scheme.teluguDescription : scheme.description}
            </p>
          </div>

          {/* MINISTRY AUDIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === 'te' ? 'బాధ్యతాయుత మంత్రిత్వ శాఖ' : 'Responsible Ministry'}
              </span>
              <span className="font-bold text-slate-800">{scheme.ministry || (language === 'te' ? 'గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ' : 'Ministry of Rural Development')}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                {language === 'te' ? 'విభాగం & స్థాయి' : 'Department & Level'}
              </span>
              <span className="font-bold text-slate-800">
                {scheme.department || (language === 'te' ? 'సంక్షేమ విభాగం' : 'Welfare Division')} ({translateGovLevel(scheme.level, language, scheme.states)})
              </span>
            </div>
          </div>

          {/* OFFICIAL APPLY BUTTON BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-900/80 px-2.5 py-0.5 rounded-full inline-block border border-blue-400/20">
                  {language === 'te' ? 'ధృవీకరించబడిన పోర్టల్ నావిగేషన్' : 'Verified Portal Navigation'}
                </span>
                {scheme.portalName && (
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{scheme.portalName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 font-medium leading-relaxed max-w-xl">
                {language === 'te' 
                  ? 'దళారులు లేదా రుసుములు లేకుండా నేరుగా ప్రభుత్వం కేటాయించిన పోర్టల్‌లో దరఖాస్తు చేసుకోండి.' 
                  : 'Apply directly on the designated government portal without middlemen or fees.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {officialAppUrl ? (
                <button
                  type="button"
                  onClick={() => setRedirectModalData({ url: officialAppUrl, portalName: scheme.portalName })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  <span>
                    {language === 'te' 
                      ? (scheme.portalName ? `${scheme.portalName.split('(')[0].trim()} లో దరఖాస్తు చేయండి` : 'అధికారిక పోర్టల్‌లో దరఖాస్తు చేయండి') 
                      : (scheme.portalName ? `Apply on ${scheme.portalName.split('(')[0].trim()}` : 'Apply on Official Portal')}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">
                  {language === 'te' ? 'అధికారిక దరఖాస్తు లింక్ అందుబాటులో లేదు' : 'Official application link unavailable'}
                </span>
              )}

              {scheme.secondaryPortalUrl && (
                <button
                  type="button"
                  onClick={() => setRedirectModalData({ url: scheme.secondaryPortalUrl!, portalName: scheme.secondaryPortalName })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  <span>{scheme.secondaryPortalName || (language === 'te' ? 'శాఖ పోర్టల్' : 'Department Portal')}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GEMINI AI MATCH EXPLANATION SECTION */}
        <div className="bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">
              {language === 'te' ? 'జన్-సేతు AI వివరణ' : 'Jan-Setu AI Explanation Layer'}
            </h2>
          </div>

          {loadingAi ? (
            <div className="flex items-center gap-2 text-xs text-slate-300 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>{language === 'te' ? 'Gemini AI తో స్పష్టమైన వివరణ రూపొందిస్తోంది...' : 'Generating grounded explanation with Gemini AI...'}</span>
            </div>
          ) : explanation ? (
            <div className="space-y-4 text-xs">
              <p className="text-slate-200 text-sm font-medium leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/10">
                "{explanation.friendlySummary}"
              </p>

              {explanation.whyMatched.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                    {language === 'te' ? 'మీరు ఎందుకు అర్హులు' : 'Why You Qualify'}
                  </h4>
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
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    {language === 'te' ? 'అర్హతకు అవసరమైన అంశాలు' : 'Missing Eligibility Factors'}
                  </h4>
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
            <p className="text-xs text-slate-400">
              {language === 'te' ? 'చట్టబద్ధమైన నిబంధనల ఆధారంగా అర్హత నిర్ణయించబడింది.' : 'Deterministic criteria evaluated based on statutory rules.'}
            </p>
          )}
        </div>

        {/* DOCUMENT READINESS VAULT CARD */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-emerald-700" />
                <span>{language === 'te' ? 'పత్రాల సన్నద్ధత చెక్‌లిస్ట్' : 'Document Readiness Checklist'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'te' 
                  ? 'మీ ప్రైవేట్ డాక్యుమెంట్ వాల్ట్‌తో స్వయంచాలకంగా సరిపోల్చబడింది.' 
                  : 'Cross-referenced automatically against your private Document Vault.'}
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
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                {language === 'te' ? `వాల్ట్‌లో సిద్ధంగా ఉన్నాయి (${availableDocuments.length})` : `Ready in Vault (${availableDocuments.length})`}
              </h4>
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
                <p className="text-xs text-slate-500 italic">
                  {language === 'te' ? 'అవసరమైన పత్రాలు ఏవీ ప్రస్తుతం అప్‌లోడ్ చేయబడలేదు.' : 'None of the required documents are currently uploaded.'}
                </p>
              )}
            </div>

            {/* Missing Documents */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                {language === 'te' ? `లేని పత్రాలు (${missingDocuments.length})` : `Missing Documents (${missingDocuments.length})`}
              </h4>
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
                <p className="text-xs text-emerald-700 font-bold">
                  {language === 'te' ? 'అవసరమైన అన్ని పత్రాలు మీ వాల్ట్‌లో సిద్ధంగా ఉన్నాయి!' : 'All required documents are ready in your vault!'}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <FolderLock className="w-4 h-4" />
              <span>{language === 'te' ? 'అప్‌లోడ్ చేయడానికి డాక్యుమెంట్ వాల్ట్ తెరవండి' : 'Open Document Vault to Upload'}</span>
            </Link>
          </div>
        </div>

        {/* BENEFITS & APPLICATION STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Benefits */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {language === 'te' ? 'చట్టబద్ధమైన ప్రయోజనాలు' : 'Statutory Benefits'}
            </h3>
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
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {language === 'te' ? 'దరఖాస్తు విధానం' : 'Application Procedure'}
            </h3>
            <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
              {scheme.applicationSteps.map((step, i) => (
                <li key={i} className="leading-relaxed">
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {scheme.guidelineSourceUrl && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {language === 'te' ? 'అధికారిక మార్గదర్శకాలు:' : 'Official Guidelines:'}
                </span>
                <a
                  href={scheme.guidelineSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                >
                  <span>{language === 'te' ? 'అధికారిక PDF చూడండి' : 'View Official PDF'}</span>
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
              {language === 'te' ? 'దరఖాస్తు గడువు:' : 'Application Deadline:'}{' '}
              <strong>
                {scheme.deadline || scheme.applicationDeadline || (language === 'te' ? 'నిరంతరం ఓపెన్ / ఆర్ధిక సంవత్సరం పొడవునా' : 'Rolling / Open through financial year')}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSetReminder}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>
                {reminderSet 
                  ? (language === 'te' ? 'రిమైండర్ సెట్ చేయబడింది!' : 'Reminder Scheduled!') 
                  : (language === 'te' ? 'గడువు రిమైండర్ సెట్ చేయండి' : 'Set Deadline Reminder')}
              </span>
            </button>
          </div>
        </div>

        {/* OFFICIAL REDIRECT SAFETY MODAL */}
        {redirectModalData && (
          <OfficialRedirectModal
            isOpen={Boolean(redirectModalData)}
            onClose={() => setRedirectModalData(null)}
            destinationUrl={redirectModalData.url}
            schemeName={scheme.name}
            portalName={redirectModalData.portalName}
            ministry={scheme.ministry}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
