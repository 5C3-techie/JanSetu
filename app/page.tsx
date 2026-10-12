'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getUnifiedProfile, isProfileComplete, CitizenProfile } from '@/lib/storage';

import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  FolderLock, 
  Building2, 
  Languages, 
  Lock,
  ExternalLink,
  Sliders,
  Check,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [profileDone, setProfileDone] = useState(false);

  useEffect(() => {
    if (user) {
      getUnifiedProfile(user.uid).then(p => {
        setProfile(p);
        setProfileDone(isProfileComplete(p));
      });
    }
  }, [user]);

  return (
    <div className="space-y-12 py-4 animate-fadeIn">

      {/* Atmospheric Frosted Glass Outer Container (Matching Image 1) */}
      <div className="relative rounded-[36px] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.06)] p-6 sm:p-10 md:p-12 overflow-hidden">
        
        {/* Soft Iridescent Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[420px] h-[420px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 -ml-20 w-[380px] h-[380px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Minimalist Top Bar (Image 1 style: Work // Profile // Journal // Contact) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200/60 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="/images/logo.png" 
                alt="Jan-Setu Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm uppercase tracking-wider font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              JAN-SETU
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-3 text-slate-400 text-[11px] font-semibold tracking-wider uppercase">
            <span className="text-slate-700">Civic Welfare</span>
            <span>{'//'}</span>
            <span>Deterministic Rules</span>
            <span>{'//'}</span>
            <span>Document Vault</span>
            <span>{'//'}</span>
            <span>Official Assistance</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Official Data
            </span>
          </div>
        </div>

        {/* HERO SECTION: IN THE VERY BEGINNING (Matching Image 2 on Right/Center) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Civic Presentation & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                Civic Technology Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {language === 'te' 
                ? 'పౌరుల సంక్షేమ పథకాల వారధి' 
                : 'Citizen Welfare Scheme Discovery & Application Assistance'}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {language === 'te'
                ? 'ఖచ్చితమైన అర్హత నిబంధనలు, డాక్యుమెంట్ రెడీనెస్ మరియు అధికారిక దరఖాస్తు లింకులు. సురక్షితమైన, పారదర్శకమైన ప్రజా సేవ.'
                : 'Discover eligible Central and State welfare schemes with 100% deterministic rule matching, private document vault readiness, and verified official government portals.'}
            </p>

            {/* 3 Step Flow Indicator (Safe & Smooth) */}
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-2.5 max-w-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 block">
                Platform Progression
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className={`p-2.5 rounded-xl border transition-all ${!user ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200/60 text-slate-500'}`}>
                  1. Sign in / Sign up
                </div>
                <div className={`p-2.5 rounded-xl border transition-all ${user && !profileDone ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200/60 text-slate-500'}`}>
                  2. Personal Details
                </div>
                <div className={`p-2.5 rounded-xl border transition-all ${user && profileDone ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200/60 text-slate-500'}`}>
                  3. Discover Schemes
                </div>
              </div>
            </div>

            {/* Featured Scheme Badges (AURA / NEXUS style from Image 1) */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Agriculture</span>
                <h4 className="text-xs font-bold text-slate-900">PM-KISAN</h4>
                <p className="text-[10px] text-slate-500">₹6,000 / yr Direct DBT</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Healthcare</span>
                <h4 className="text-xs font-bold text-slate-900">Ayushman Bharat</h4>
                <p className="text-[10px] text-slate-500">₹5 Lakh Free Cover</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/70 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Telangana</span>
                <h4 className="text-xs font-bold text-slate-900">Rythu Bharosa</h4>
                <p className="text-[10px] text-slate-500">₹7,500 / acre Season</p>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Rules</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Owner-Scoped Vault</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>English & Telugu</span>
              </span>
            </div>

          </div>

          {/* Right Column: In the Very Beginning -> AuthCard (Image 2) OR Citizen Profile Card (Image 1) */}
          <div className="lg:col-span-5 flex justify-center">
            {!user ? (
              <div className="w-full flex flex-col justify-center items-center p-8 bg-white/80 border border-slate-200/80 shadow-xs rounded-[32px] space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">Access Your Civic Benefits</h3>
                  <p className="text-sm text-slate-600 mt-2">Sign in or create an account to securely check eligibility.</p>
                </div>
                <div className="flex flex-col w-full max-w-xs gap-3">
                  <Link href="/login" className="w-full text-center py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md">
                    Sign In
                  </Link>
                  <Link href="/signup" className="w-full text-center py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold transition-all">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              /* Authenticated Citizen Profile Showcase (Matching "Alexander Chen / Designer Profile" in Image 1) */
              <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-100 space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Citizen Profile
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    Authenticated
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-500/20">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {profile?.name || user.email?.split('@')[0]}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {profile?.occupation ? profile.occupation.replace(/_/g, ' ') : 'Citizen Account'} • {profile?.state || 'India'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      UID: {user.uid.substring(0, 10)}...
                    </p>
                  </div>
                </div>

                {/* Profile Completion Bar */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Profile Completeness</span>
                    <span className="text-blue-600">{profileDone ? '100% Ready' : 'Incomplete'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${profileDone ? 'bg-emerald-500 w-full' : 'bg-amber-500 w-2/5'}`} 
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {profileDone 
                      ? 'Personal details saved. You can discover tailored schemes now.'
                      : 'Please complete your personal details to view personalized matches.'}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  {!profileDone ? (
                    <Link
                      href="/profile"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Complete Personal Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Go to Benefit Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  <Link
                    href="/schemes"
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore All Schemes</span>
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* PROJECT GALLERY / CURATED SCHEME CATALOGUE (Matching Image 1 "Project Gallery" Aesthetic) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verified Government Schemes
            </h2>
            <p className="text-xs text-slate-500">
              Curated Welfare Database • Central & State Government • Verified Official Portals
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View all 30+ schemes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Curated Frosted Cards (Like AURA, NEXUS, ELYSIUM, LUNA, AETHEL, SENTIENT in Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200/80 border border-slate-200/60 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-slate-700">RYTHU BHAROSA</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Telangana State</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Rythu Bharosa Support</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                ₹7,500 per acre investment support for agricultural crops directly credited per season.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-white">PM-KISAN</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Central Government</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">PM Kisan Samman Nidhi</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Income support of ₹6,000 per year in three installments to farmer households across India.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-100/70 border border-blue-200/50 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-blue-900">AYUSHMAN</span>
                <span className="block text-[10px] uppercase font-bold text-blue-500 mt-1">PM-JAY Health</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Ayushman Bharat (PM-JAY)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                ₹5 Lakh per family per year for secondary and tertiary care hospitalization across India.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-100/70 border border-amber-200/50 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-amber-900">AASARA</span>
                <span className="block text-[10px] uppercase font-bold text-amber-600 mt-1">Social Security</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Telangana Aasara Pension</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Monthly financial assistance to senior citizens, widows, and persons with disabilities.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-100/70 border border-teal-200/50 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-teal-900">PMAY</span>
                <span className="block text-[10px] uppercase font-bold text-teal-600 mt-1">Housing for All</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Pradhan Mantri Awas Yojana</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Financial subsidy for pucca house construction for homeless and rural/urban citizens.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[28px] space-y-4 group">
            <div className="h-32 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-100/70 border border-purple-200/50 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
              <div className="text-center">
                <span className="text-xl font-extrabold tracking-widest text-purple-900">SVANIDHI</span>
                <span className="block text-[10px] uppercase font-bold text-purple-600 mt-1">Micro Credit</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">PM SVANidhi Scheme</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Verified</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Collateral-free working capital loan for street vendors with digital transaction incentives.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CASE STUDY & CIVIC TRUST (Matching Image 1 "Case Study" section) */}
      <section className="rounded-[32px] bg-white p-8 sm:p-10 border border-slate-100 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)] space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Civic Trust Architecture</span>
          </div>
          <div className="flex items-center gap-3">
            <span>400</span>
            <span>#CFD6E0</span>
            <span className="text-emerald-700 font-bold">100% Deterministic</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero AI Hallucinations</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemini assists with natural intake and simple language explanations, but never calculates or invents scheme eligibility. All rules are evaluated by a transparent deterministic engine.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">Private Document Vault</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your sensitive identity and income certificates are stored strictly under your private Firebase UID in Firebase Cloud Storage. No other user can access your documents.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">Verified Official Destinations</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every single scheme lists its ministry, department, and direct official government link (.gov.in or .nic.in). Jan-Setu never redirects you to unauthorized intermediaries.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}
