'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import ProtectedRoute from '@/components/ProtectedRoute';
import { Bookmark, GitCompare, Loader2, ArrowRight, Search, ShieldCheck } from 'lucide-react';

export default function SavedSchemesPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [savedResults, setSavedResults] = useState<EligibilityResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedSchemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getUnifiedProfile(user?.uid);
      const docs = await getUnifiedDocuments(user?.uid);
      const savedIds = await getUnifiedSavedSchemes(user?.uid);
      const allSchemes = schemeStore.getAllSchemes();

      const evaluated = evaluateAllSchemes(profile, allSchemes, docs, language);
      const filteredSaved = evaluated.filter(res => savedIds.includes(res.schemeId));
      setSavedResults(filteredSaved);
    } catch (err) {
      console.error('Error loading saved schemes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, language]);

  useEffect(() => {
    loadSavedSchemes();
  }, [loadSavedSchemes]);

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="space-y-6 py-2">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-700" />
            <span>{language === 'te' ? 'సేవ్ చేసిన ప్రభుత్వ పథకాలు' : 'Saved Government Schemes'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user 
              ? (language === 'te' ? `మీ ఖాతాకు భద్రపరచబడిన పథకాలు (${user.email})` : `Saved schemes tied to your account (${user.email})`)
              : (language === 'te' ? 'అతిథి మోడ్ — క్లౌడ్ ఫైర్‌స్టోర్‌కు సింక్ చేయడానికి సైన్ ఇన్ చేయండి' : 'Guest Mode — sign in to sync saved schemes to Cloud Firestore')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-all shadow-xs"
          >
            <GitCompare className="w-4 h-4" />
            <span>{language === 'te' ? 'పథకాలను పోల్చండి' : 'Compare Saved Schemes'}</span>
          </Link>
        </div>
      </div>

      {/* SCHEME CARDS GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 mt-2">
            {language === 'te' ? 'సేవ్ చేసిన పథకాలు లోడ్ అవుతున్నాయి...' : 'Loading saved schemes...'}
          </p>
        </div>
      ) : savedResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedResults.map(res => (
            <SchemeCard key={res.schemeId} result={res} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'te' ? 'ఇంకా ఏ పథకాలు భద్రపరచబడలేదు' : 'No Saved Schemes Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'te'
              ? 'మీరు ఇంకా ఎటువంటి ప్రభుత్వ పథకాలను దాచలేదు. ధృవీకరించబడిన పథకాలను అన్వేషించండి మరియు మీ అర్హత, పత్రాల సన్నద్ధతను ట్రాక్ చేయడానికి వాటిని బుక్‌మార్క్ చేయండి.'
              : 'You haven\'t saved any government schemes yet. Explore verified schemes and bookmark them to track eligibility and document readiness.'}
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all mt-2"
          >
            <Search className="w-4 h-4" />
            <span>{language === 'te' ? 'పథకాలను అన్వేషించండి' : 'Explore Schemes'}</span>
          </Link>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
