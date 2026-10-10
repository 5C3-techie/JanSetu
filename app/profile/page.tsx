'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getUnifiedProfile, 
  saveUnifiedProfile, 
  CitizenProfile, 
  EMPTY_CITIZEN_PROFILE 
} from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import VoiceInputModal from '@/components/VoiceInputModal';
import ProfileWizard from '@/components/ProfileWizard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  UserCheck, 
  Mic, 
  Sparkles, 
  Loader2, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<CitizenProfile>(EMPTY_CITIZEN_PROFILE);
  const [nlText, setNlText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const loaded = await getUnifiedProfile(user?.uid);
      setProfile(loaded);
      if (loaded.rawInputText) setNlText(loaded.rawInputText);
      setIsLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleParseNL = async () => {
    if (!nlText.trim()) return;
    setIsParsing(true);

    try {
      const res = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlText }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(prev => ({
          ...prev,
          ...data.profile,
          rawInputText: nlText,
        }));
      }
    } catch (err) {
      console.error('Failed to parse profile text:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleVoiceExtracted = (extracted: any, rawText: string) => {
    setNlText(rawText);
    setProfile(prev => ({
      ...prev,
      ...extracted,
      rawInputText: rawText,
    }));
  };

  const handleSaveProfile = async (updatedProfile: CitizenProfile) => {
    setIsSaving(true);
    try {
      await saveUnifiedProfile(updatedProfile, user?.uid);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading citizen profile...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requireProfileCompletion={false}>
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        
        {/* Page Top Title */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-7 h-7 text-emerald-700" />
              <span>Citizen Profile Onboarding</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your real details are securely isolated under your account ({user?.email || 'Authenticated User'}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Owner Isolated Firestore Storage</span>
            </span>
          </div>
        </div>

        {/* OPTIONAL AI & VOICE AUTO-INTAKE BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAiAssistant(!showAiAssistant)}>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Fill with Gemini AI Voice or Sentence</h3>
                <p className="text-[11px] text-slate-400">Speak or write your background in Telugu or English to auto-populate the questionnaire.</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:underline"
            >
              <span>{showAiAssistant ? 'Hide Assistant' : 'Try AI Assistant'}</span>
              {showAiAssistant ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showAiAssistant && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Example: "I am a 21-year-old undergraduate student from Nalgonda, family income ₹1.5 lakh."</span>
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Speak Details</span>
                </button>
              </div>

              <textarea
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder="Type or paste your background details..."
                className="w-full h-20 p-3 bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none backdrop-blur-xs font-medium"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseNL}
                  disabled={!nlText.trim() || isParsing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Extracting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Extract & Populate Fields</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP-BY-STEP PROGRESSIVE ONBOARDING WIZARD */}
        <ProfileWizard 
          key={profile.name + profile.age + profile.state}
          initialProfile={profile} 
          onSave={handleSaveProfile} 
          isSaving={isSaving} 
        />

        {/* Voice Input Modal */}
        <VoiceInputModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onExtractedProfile={handleVoiceExtracted}
        />

      </div>
    </ProtectedRoute>
  );
}
