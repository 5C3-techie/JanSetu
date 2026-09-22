'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileStore, CitizenProfile, DEMO_CITIZEN_PROFILE } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import VoiceInputModal from '@/components/VoiceInputModal';
import { 
  UserCheck, 
  Mic, 
  Sparkles, 
  Loader2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<CitizenProfile>(DEMO_CITIZEN_PROFILE);
  const [nlText, setNlText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const existing = profileStore.getProfile();
    setProfile(existing);
    if (existing.rawInputText) setNlText(existing.rawInputText);
  }, []);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    profileStore.saveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      router.push('/dashboard');
    }, 1000);
  };

  const handleLoadDemo = () => {
    const demo = profileStore.resetProfileToDemo();
    setProfile(demo);
    if (demo.rawInputText) setNlText(demo.rawInputText);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Citizen Profile & Eligibility Assessment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide your profile details manually or type naturally. Review and edit extracted attributes before matching.
          </p>
        </div>

        <button
          onClick={handleLoadDemo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Load Telangana Demo Citizen</span>
        </button>
      </div>

      {/* SECTION 1: NATURAL LANGUAGE & VOICE INTAKE */}
      <div className="bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">Natural Language & Voice Profile Intake</h2>
          </div>
          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Mic className="w-4 h-4" />
            <span>Speak Your Details</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Type a plain paragraph about yourself (e.g. "I am a 42 year old agricultural labourer from a village in Telangana. My annual income is around 1.2 lakh and I don't own land."). Gemini AI will auto-extract the structured fields below.
        </p>

        <div className="space-y-3">
          <textarea
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
            placeholder="Type your story or situation here..."
            className="w-full h-24 p-3 bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-xl text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none backdrop-blur-xs"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleParseNL}
              disabled={!nlText.trim() || isParsing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Extracting Attributes with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Parse Profile with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: STRUCTURED CITIZEN PROFILE FORM */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Review & Edit Extracted Attributes</h2>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Deterministic Engine Inputs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Citizen Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.age} (Years)</label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              required
              min={1}
              max={120}
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.state}</label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-white"
            >
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Occupation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.occupation}</label>
            <select
              value={profile.occupation}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-white"
            >
              <option value="agricultural_labourer">Agricultural Labourer</option>
              <option value="farmer">Landholding Farmer</option>
              <option value="small_farmer">Small / Marginal Farmer</option>
              <option value="unorganised_worker">Unorganised Sector Worker</option>
              <option value="artisan">Artisan / Craftsperson</option>
              <option value="street_vendor">Street Vendor</option>
              <option value="domestic_worker">Domestic Worker</option>
              <option value="student">Student</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>

          {/* Annual Income */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.annualIncome} (INR ₹)</label>
            <input
              type="number"
              value={profile.annualIncome || ''}
              onChange={(e) => setProfile({ ...profile, annualIncome: parseInt(e.target.value, 10) || 0 })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              placeholder="e.g. 120000"
              required
            />
          </div>

          {/* Social Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.category}</label>
            <select
              value={profile.category}
              onChange={(e) => setProfile({ ...profile, category: e.target.value as any })}
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-white"
            >
              <option value="BC">BC (Backward Class)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EBC">EBC (Economically Backward Class)</option>
              <option value="Minority">Minority</option>
              <option value="General">General Category</option>
            </select>
          </div>

          {/* Rural Resident Radio */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.ruralResident}</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="rural"
                  checked={profile.isRural === true}
                  onChange={() => setProfile({ ...profile, isRural: true })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Yes (Village / Gram Panchayat)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="rural"
                  checked={profile.isRural === false}
                  onChange={() => setProfile({ ...profile, isRural: false })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>No (Urban / Town)</span>
              </label>
            </div>
          </div>

          {/* Land Ownership Radio */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">{t.landOwnership}</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="land"
                  checked={profile.landOwnership === true}
                  onChange={() => setProfile({ ...profile, landOwnership: true })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Yes (Holds Land Title / Passbook)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="land"
                  checked={profile.landOwnership === false}
                  onChange={() => setProfile({ ...profile, landOwnership: false })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>No (Landless / Non-owner)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Existing Document Checklist Flags */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
            Current Document Verification Flags
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasAadhaar}
                onChange={(e) => setProfile({ ...profile, hasAadhaar: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Has Aadhaar Card</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasBankPassbook}
                onChange={(e) => setProfile({ ...profile, hasBankPassbook: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Has Bank Account</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasIncomeCert}
                onChange={(e) => setProfile({ ...profile, hasIncomeCert: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Has Income Certificate</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasLandDoc}
                onChange={(e) => setProfile({ ...profile, hasLandDoc: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Has Land Document</span>
            </label>
          </div>
        </div>

        {/* Submit & Redirect Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Click save to execute the deterministic rule matching engine across all schemes.
          </p>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved! Calculating Matches...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.btnSaveProfile}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Voice Modal Component */}
      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onExtractedProfile={handleVoiceExtracted}
      />
    </div>
  );
}
