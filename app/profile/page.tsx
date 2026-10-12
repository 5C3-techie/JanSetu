'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getUnifiedProfile,
  saveUnifiedProfile,
  CitizenProfile,
  EMPTY_CITIZEN_PROFILE,
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
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<CitizenProfile>(EMPTY_CITIZEN_PROFILE);
  const [nlText, setNlText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [wizardRevision, setWizardRevision] = useState(0);

  // Load account-specific profile when authentication state is resolved
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const loaded = await getUnifiedProfile(user?.uid);

        if (!isMounted) return;

        setProfile(loaded);

        if (loaded.rawInputText) {
          setNlText(loaded.rawInputText);
        }
      } catch (error) {
        console.error('Failed to load citizen profile:', error);

        if (isMounted) {
          setErrorMessage(
            'Unable to load your profile. Please refresh and try again.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.uid]);

  // Apply parsed attributes from text or voice into the profile and synchronize with ProfileWizard
  const applyParsedProfile = useCallback(
    (extracted: Partial<CitizenProfile>, textInput?: string) => {
      const populatedFields: string[] = [];

      setProfile((previous) => {
        const updated: CitizenProfile = { ...previous };

        if (extracted.name && extracted.name.trim()) {
          updated.name = extracted.name.trim();
          updated.fullName = extracted.name.trim();
          populatedFields.push('Name');
        }

        if (extracted.age != null && extracted.age > 0) {
          updated.age = extracted.age;
          populatedFields.push('Age');
        }

        if (extracted.gender) {
          updated.gender = extracted.gender;
          populatedFields.push('Gender');
        }

        if (extracted.state && extracted.state.trim()) {
          updated.state = extracted.state.trim();
          populatedFields.push('State');
        }

        if (extracted.district && extracted.district.trim()) {
          updated.district = extracted.district.trim();
          populatedFields.push('District');
        }

        if (extracted.occupation && extracted.occupation.trim()) {
          updated.occupation = extracted.occupation.trim();
          populatedFields.push('Occupation');
        }

        if (extracted.annualIncome != null && extracted.annualIncome >= 0) {
          updated.annualIncome = extracted.annualIncome;
          updated.annualFamilyIncome = extracted.annualIncome;
          populatedFields.push('Annual Income');
        }

        if (extracted.landOwnership != null) {
          updated.landOwnership = extracted.landOwnership;
          updated.ownsLand = extracted.landOwnership;
          populatedFields.push('Land Ownership');
        }

        if (extracted.isRural != null) {
          updated.isRural = extracted.isRural;
          updated.ruralOrUrban = extracted.isRural ? 'rural' : 'urban';
          populatedFields.push('Location Type');
        }

        if (extracted.category) {
          updated.category = extracted.category;
          updated.socialCategory = extracted.category;
          populatedFields.push('Category');
        }

        if (textInput) {
          updated.rawInputText = textInput;
        }

        return updated;
      });

      if (textInput) {
        setNlText(textInput);
      }

      // Remount the wizard with the newly extracted attributes
      setWizardRevision((prev) => prev + 1);

      if (populatedFields.length > 0) {
        setSuccessNotice(
          `Extracted and auto-filled: ${populatedFields.join(', ')}. Review and edit any field below before saving.`
        );
      } else {
        setSuccessNotice(
          'Profile intake processed. Please review and adjust the fields below before saving.'
        );
      }

      setErrorMessage('');
    },
    []
  );

  // Trigger Gemini AI parsing of natural language text
  const handleParseNL = async () => {
    if (!nlText.trim() || isParsing) return;

    setIsParsing(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const response = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: nlText.trim(),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Profile parsing failed (${response.status})`);
      }

      const data = await response.json();

      if (!data.profile) {
        throw new Error('No profile information was extracted.');
      }

      applyParsedProfile(data.profile, nlText.trim());
      setShowAiAssistant(false);
    } catch (error) {
      console.error('Failed to parse profile text:', error);

      setErrorMessage(
        'Could not extract profile details. Please try again or enter them manually into the wizard below.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  // Save the complete profile to account-specific storage (Firestore + local cache)
  const handleSaveProfile = async (updatedProfile: CitizenProfile) => {
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const profileToSave: CitizenProfile = {
        ...updatedProfile,
        rawInputText: nlText || updatedProfile.rawInputText,
      };

      await saveUnifiedProfile(profileToSave, user?.uid);

      setProfile(profileToSave);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save citizen profile:', error);

      setErrorMessage(
        'Your profile could not be saved. Please check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading citizen profile...
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute requireProfileCompletion={false}>
      <div className="mx-auto max-w-4xl space-y-6 py-4">
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-black text-slate-900">
              <UserCheck className="h-7 w-7 text-emerald-700" />
              Citizen Profile Onboarding
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Provide your details manually or speak naturally to discover eligible government welfare schemes.
            </p>

            {user?.email && (
              <p className="mt-1 text-xs text-slate-500">
                Signed in as <span className="font-semibold text-slate-700">{user.email}</span>
              </p>
            )}
          </div>

          <span className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Account-specific profile
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success / Auto-Fill Notice Alert */}
        {successNotice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-900 animate-in fade-in duration-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1">{successNotice}</div>
            <button
              onClick={() => setSuccessNotice('')}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* AI Text and Voice Intake Accordion Section */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-md">
          <button
            type="button"
            onClick={() => setShowAiAssistant((current) => !current)}
            aria-expanded={showAiAssistant}
            className="flex w-full items-center justify-between gap-3 text-left transition hover:opacity-95"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-300" />
              <span>
                <span className="block text-sm font-bold">
                  Fill with AI Voice or Natural Sentence
                </span>
                <span className="mt-1 block text-xs text-slate-300">
                  Speak or write your circumstances in Telugu or English to auto-populate the wizard.
                </span>
              </span>
            </span>

            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <span>{showAiAssistant ? 'Hide AI Assistant' : 'Try AI Assistant'}</span>
              {showAiAssistant ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </span>
          </button>

          {showAiAssistant && (
            <div className="space-y-4 border-t border-white/10 pt-4 animate-in fade-in duration-200">
              <p className="text-xs leading-relaxed text-slate-300">
                Example: &quot;Naaku 42 years, Telangana lo village lo untanu, agricultural labourer ni, annual income one lakh twenty thousand, land ledu.&quot;
                Gemini AI will extract your attributes and populate the wizard below. You can review and adjust every field before saving.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="profile-description"
                  className="text-xs font-semibold text-slate-200"
                >
                  Describe your background:
                </label>

                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
                >
                  <Mic className="h-4 w-4" />
                  <span>🎙️ Speak Details (Telugu / English)</span>
                </button>
              </div>

              <textarea
                id="profile-description"
                value={nlText}
                onChange={(event) => setNlText(event.target.value)}
                placeholder="Type your story or situation here in Telugu or English..."
                rows={3}
                className="w-full resize-y rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-xs font-medium"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseNL}
                  disabled={!nlText.trim() || isParsing}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Extracting with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-slate-950" />
                      <span>Extract and Populate Fields</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Step-by-Step Progressive Profile Wizard */}
        <ProfileWizard
          key={`profile-wizard-rev-${wizardRevision}-${profile.id || 'current'}`}
          initialProfile={profile}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />

        {/* Browser Web Speech API Voice Intake Modal */}
        <VoiceInputModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onParsed={(extracted: Partial<CitizenProfile>, textInput?: string) => {
            applyParsedProfile(extracted, textInput);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
