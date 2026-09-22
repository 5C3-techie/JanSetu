'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  FolderLock, 
  BellRing, 
  Building2, 
  SlidersHorizontal, 
  Languages, 
  Zap, 
  HelpCircle,
  FileCheck,
  Award,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-16 py-4">
      
      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden gradient-hero text-white p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI-Enhanced Civic Technology Platform</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {t.heroTitle}
          </h1>

          <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>{t.btnCheckEligibility}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{t.btnExploreSchemes}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-xs">
            <div>
              <span className="text-2xl font-bold text-white block">15+</span>
              <span className="text-slate-300">Curated Welfare Schemes</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400 block">100%</span>
              <span className="text-slate-300">Rule-Based Deterministic</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-amber-300 block">EN | TE</span>
              <span className="text-slate-300">Bilingual Telugu & English</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-sky-300 block">Vault</span>
              <span className="text-slate-300">Citizen Document Readiness</span>
            </div>
          </div>
        </div>
      </section>

      {/* JUDGE DIFFERENTIATOR: HOW JAN-SETU WORKS (ARCHITECTURE) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            System Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            How Jan-Setu Delivers Trustworthy Matches
          </h2>
          <p className="text-xs text-slate-600">
            Jan-Setu is NOT a generic chatbot. Gemini handles natural intake and plain explanations, while eligibility decisions are 100% rule-driven.
          </p>
        </div>

        {/* Workflow Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">STEP 1</span>
            <h4 className="text-xs font-bold text-slate-900">Citizen Profile Intake</h4>
            <p className="text-[11px] text-slate-500">Natural text, form inputs or voice speech.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">STEP 2</span>
            <h4 className="text-xs font-bold text-slate-900">Gemini Profile Parsing</h4>
            <p className="text-[11px] text-slate-500">Converts input into validated JSON profile.</p>
          </div>
          <div className="bg-blue-900 text-white p-4 rounded-xl border border-blue-800 shadow-md space-y-2 relative">
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">STEP 3</span>
            <h4 className="text-xs font-bold text-white">Rule Matching Engine</h4>
            <p className="text-[11px] text-blue-200">Evaluates structured rules from Knowledge Base.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">STEP 4</span>
            <h4 className="text-xs font-bold text-slate-900">Gemini Explanation Layer</h4>
            <p className="text-[11px] text-slate-500">Generates friendly non-jargon explanations.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">STEP 5</span>
            <h4 className="text-xs font-bold text-slate-900">Document Readiness & Action</h4>
            <p className="text-[11px] text-slate-500">Vault checklist, deadlines & reminders.</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Core Platform Features</h2>
            <p className="text-xs text-slate-500">Designed for Citizens, CSC Operators, and NGO Workers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Profile Intake & Voice</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Type or speak naturally about your life details. Gemini extracts age, income, state, and occupation into a structured profile for confirmation.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Citizen Document Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload Aadhaar, Income Certificate, and Passbooks directly inside Jan-Setu to track real-time application readiness (e.g. 3/5 documents ready).
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">English & Telugu Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seamlessly switch between English and Telugu (తెలుగు) across navigation, scheme criteria, required documents, and AI assistant explanations.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">What-If Simulator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test income or land ownership changes to see how rule-based eligibility matching updates in real-time before applying.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Deadline Reminders</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track verified application windows and set target deadline reminders (30 days, 7 days before) so you never miss benefits.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">CSC / VLE Operator Mode</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assistance workflow for Common Service Centre operators to assess citizens and print clean Application Readiness Reports.
            </p>
          </div>
        </div>
      </section>

      {/* WHY JAN-SETU? TRUST & TRANSPARENCY SECTION */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Trust & Transparency
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">Why Citizens & Operators Trust Jan-Setu</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm text-slate-100">Rule-based Eligibility</h4>
            <p className="text-slate-400 leading-relaxed">Matching uses deterministic scheme criteria rather than generic AI guesses.</p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h4 className="font-bold text-sm text-slate-100">Gemini Plain Explanation</h4>
            <p className="text-slate-400 leading-relaxed">Translates complex government notification terms into simple everyday language.</p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <Search className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm text-slate-100">Source Transparency</h4>
            <p className="text-slate-400 leading-relaxed">Every scheme cites its official government source link and last verified date.</p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <Award className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-sm text-slate-100">No False Claims</h4>
            <p className="text-slate-400 leading-relaxed">Never claims official government approval. Provides honest application readiness support.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
