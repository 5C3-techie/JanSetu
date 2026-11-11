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
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ProfileWizard from '@/components/ProfileWizard';
import ProtectedRoute from '@/components/ProtectedRoute';

const VoiceProfileTranslator = dynamic(
  () => import('@/components/VoiceProfileTranslator'),
  { ssr: false }
);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
            <button
              type="button"
              onClick={() => {
                document.getElementById('voice-profile-translator-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>🎙️ Voice Profile Intake</span>
            </button>
            <span className="hidden sm:flex text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Firestore Storage</span>
            </span>
          </div>
        </div>

        {/* INLINE VOICE SPEECH TRANSLATOR & AUTO-INTAKE (Replaces old collapsed banner) */}
        <div id="voice-profile-translator-section" className="scroll-mt-6">
          <VoiceProfileTranslator
            onProfileExtracted={handleVoiceExtracted}
            initialText={nlText}
          />
        </div>

        {/* STEP-BY-STEP PROGRESSIVE ONBOARDING WIZARD */}
        <ProfileWizard 
          initialProfile={profile} 
          onSave={handleSaveProfile} 
          isSaving={isSaving} 
        />

      </div>
    </ProtectedRoute>
  );
}
