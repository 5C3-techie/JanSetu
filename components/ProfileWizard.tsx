'use client';

import React, { useState } from 'react';
import { CitizenProfile } from '@/lib/storage/types';
import { 
  User, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Users, 
  Sprout, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Save, 
  Sparkles,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface ProfileWizardProps {
  initialProfile: CitizenProfile;
  onSave: (profile: CitizenProfile) => Promise<void>;
  isSaving: boolean;
}

const TOTAL_STEPS = 6;

export default function ProfileWizard({ initialProfile, onSave, isSaving }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<CitizenProfile>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CitizenProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!profile.name || !profile.name.trim()) errs.name = 'Full name is required';
      if (!profile.age || profile.age <= 0 || profile.age > 120) errs.age = 'Please enter a valid age (1-120)';
      if (!profile.gender) errs.gender = 'Gender selection is required';
    }

    if (step === 2) {
      if (!profile.state || !profile.state.trim()) errs.state = 'State of residence is required';
      if (!profile.district || !profile.district.trim()) errs.district = 'District is required';
    }

    if (step === 3) {
      if (!profile.occupation || !profile.occupation.trim()) errs.occupation = 'Please select your primary occupation';
    }

    if (step === 4) {
      if (profile.annualIncome === undefined || profile.annualIncome < 0) {
        errs.annualIncome = 'Please provide your annual family income';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      await onSave(profile);
    }
  };

  const progressPercentage = Math.round((currentStep / TOTAL_STEPS) * 100);

  // Progressive conditional checks
  const isFarmer = ['farmer', 'small_farmer', 'agricultural_labourer'].includes(profile.occupation);
  const isStudent = profile.occupation === 'student' || (profile.age > 0 && profile.age <= 25);
  const isEntrepreneur = ['business_owner', 'self_employed', 'artisan'].includes(profile.occupation);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Wizard Progress Top Bar */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full inline-block mb-1.5">
              Citizen Onboarding • Step {currentStep} of {TOTAL_STEPS}
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              {currentStep === 1 && 'About You'}
              {currentStep === 2 && 'Location & Residence'}
              {currentStep === 3 && 'Work & Education'}
              {currentStep === 4 && 'Economic Information'}
              {currentStep === 5 && 'Social & Community Details'}
              {currentStep === 6 && 'Family & Agricultural Criteria'}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{progressPercentage}%</span>
            <span className="text-xs text-slate-400 block font-medium">Completed</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Indicator Icons */}
        <div className="grid grid-cols-6 gap-2 mt-4 pt-2 text-center text-[10px] font-semibold text-slate-400">
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? 'text-emerald-400' : ''}`}>
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Personal</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? 'text-emerald-400' : ''}`}>
            <MapPin className="w-4 h-4" />
            <span className="hidden md:inline">Location</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? 'text-emerald-400' : ''}`}>
            <Briefcase className="w-4 h-4" />
            <span className="hidden md:inline">Work/Edu</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 4 ? 'text-emerald-400' : ''}`}>
            <IndianRupee className="w-4 h-4" />
            <span className="hidden md:inline">Economic</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 5 ? 'text-emerald-400' : ''}`}>
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Social</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${currentStep >= 6 ? 'text-emerald-400' : ''}`}>
            <Sprout className="w-4 h-4" />
            <span className="hidden md:inline">Specifics</span>
          </div>
        </div>
      </div>

      {/* Step Body */}
      <form onSubmit={handleFinalSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* STEP 1: ABOUT YOU */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Please provide your real legal details. Government scheme eligibility rules evaluate age, gender, and identity criteria strictly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Full Name (as per Aadhaar / Official ID) *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    updateField('name', e.target.value);
                    updateField('fullName', e.target.value);
                  }}
                  placeholder="e.g. Ramesh Reddy"
                  className={`w-full p-3 rounded-xl border ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Age (in completed years) *
                </label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => updateField('age', parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 28"
                  min={1}
                  max={120}
                  className={`w-full p-3 rounded-xl border ${errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                {errors.age && <p className="text-[11px] text-rose-600 font-semibold">{errors.age}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Gender *
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Transgender</option>
                </select>
                {errors.gender && <p className="text-[11px] text-rose-600 font-semibold">{errors.gender}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Mobile Number (for scheme SMS alerts)
                </label>
                <input
                  type="tel"
                  value={profile.mobileNumber || ''}
                  onChange={(e) => updateField('mobileNumber', e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">
                  Marital Status
                </label>
                <select
                  value={profile.maritalStatus || 'unmarried'}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="unmarried">Single / Unmarried</option>
                  <option value="married">Married</option>
                  <option value="widow">Widow / Widower</option>
                  <option value="divorced">Divorced / Separated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                State welfare schemes (such as Telangana Kalyana Lakshmi, Rythu Bharosa, or Aasara) are tied directly to your resident domicile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  State Residence *
                </label>
                <select
                  value={profile.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={`w-full p-3 rounded-xl border ${errors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all`}
                >
                  <option value="">Select State</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other State / All India</option>
                </select>
                {errors.state && <p className="text-[11px] text-rose-600 font-semibold">{errors.state}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  District *
                </label>
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="e.g. Nalgonda, Hyderabad, Warangal"
                  className={`w-full p-3 rounded-xl border ${errors.district ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                {errors.district && <p className="text-[11px] text-rose-600 font-semibold">{errors.district}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Mandal / Taluk / Tehsil
                </label>
                <input
                  type="text"
                  value={profile.mandal || ''}
                  onChange={(e) => updateField('mandal', e.target.value)}
                  placeholder="e.g. Miryalaguda"
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Area Classification *
                </label>
                <select
                  value={profile.isRural ? 'rural' : 'urban'}
                  onChange={(e) => {
                    const isR = e.target.value === 'rural';
                    updateField('isRural', isR);
                    updateField('ruralOrUrban', e.target.value);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="rural">Rural (Village / Gram Panchayat)</option>
                  <option value="urban">Urban (Municipality / Corporation)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WORK & EDUCATION */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs text-amber-950 flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Jan-Setu activates progressive follow-up questions tailored specifically to your chosen occupation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">
                  Primary Occupation *
                </label>
                <select
                  value={profile.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  className={`w-full p-3 rounded-xl border ${errors.occupation ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all`}
                >
                  <option value="">Select Occupation</option>
                  <option value="student">Student</option>
                  <option value="farmer">Farmer (Cultivator)</option>
                  <option value="small_farmer">Small & Marginal Farmer</option>
                  <option value="agricultural_labourer">Agricultural Labourer</option>
                  <option value="unemployed">Unemployed / Job Seeker</option>
                  <option value="salaried">Salaried (Private / Public)</option>
                  <option value="self_employed">Self Employed / Trader</option>
                  <option value="business_owner">Entrepreneur / MSME Owner</option>
                  <option value="artisan">Artisan / Weaver / Craftsman</option>
                  <option value="senior_citizen">Senior Citizen / Retired</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="other">Other Worker</option>
                </select>
                {errors.occupation && <p className="text-[11px] text-rose-600 font-semibold">{errors.occupation}</p>}
              </div>

              {/* Progressive Student Details */}
              {isStudent && (
                <>
                  <div className="space-y-1.5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Student Profiling (for Scholarships & Skill Programs)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Education Level</label>
                        <select
                          value={profile.educationLevel || 'Undergraduate'}
                          onChange={(e) => updateField('educationLevel', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                        >
                          <option value="School">School (Class 1-10)</option>
                          <option value="Intermediate">Intermediate / +2 (Class 11-12)</option>
                          <option value="Diploma">Polytechnic / Diploma / ITI</option>
                          <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.A, B.Com)</option>
                          <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MBA, etc.)</option>
                          <option value="PhD">Doctorate / PhD</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Institution Type</label>
                        <select
                          value={profile.institutionType || 'Government'}
                          onChange={(e) => updateField('institutionType', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                        >
                          <option value="Government">Government Institution</option>
                          <option value="GovtAided">Government Aided</option>
                          <option value="Private">Private / Autonomous</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Highest Education Level for Non-students */}
              {!isStudent && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Highest Education Completed
                  </label>
                  <select
                    value={profile.educationLevel || 'None'}
                    onChange={(e) => updateField('educationLevel', e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                  >
                    <option value="None">No Formal Schooling</option>
                    <option value="Primary">Primary School (Up to 5th)</option>
                    <option value="Secondary">Secondary (10th Pass)</option>
                    <option value="Intermediate">Higher Secondary (+2)</option>
                    <option value="Graduate">Graduate Degree</option>
                    <option value="Postgraduate">Postgraduate or Higher</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: ECONOMIC INFORMATION */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-3">
              <IndianRupee className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Most government subsidies and welfare benefits apply income ceilings (e.g., ₹1.5 lakh for rural scholarships, ₹2 lakh for urban healthcare).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">
                  Annual Family Income (in ₹ INR) *
                </label>
                <input
                  type="number"
                  value={profile.annualIncome || ''}
                  onChange={(e) => {
                    const inc = parseInt(e.target.value, 10) || 0;
                    updateField('annualIncome', inc);
                    updateField('annualFamilyIncome', inc);
                  }}
                  placeholder="e.g. 150000"
                  step={5000}
                  min={0}
                  className={`w-full p-3 rounded-xl border ${errors.annualIncome ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'} text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                {errors.annualIncome && <p className="text-[11px] text-rose-600 font-semibold">{errors.annualIncome}</p>}
                <p className="text-[11px] text-slate-500">
                  Total combined income of all earning family members from all sources.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Ration Card Status
                </label>
                <select
                  value={profile.hasRationCard ? 'yes' : 'no'}
                  onChange={(e) => updateField('hasRationCard', e.target.value === 'yes')}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="yes">Possess BPL / White Food Security Card</option>
                  <option value="no">Do Not Possess Ration Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Housing Status
                </label>
                <select
                  value={profile.ownsPuccaHouse ? 'pucca' : 'kutcha'}
                  onChange={(e) => {
                    updateField('ownsPuccaHouse', e.target.value === 'pucca');
                    updateField('housingStatus', e.target.value);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="kutcha">Kutcha House / Rented / Homeless</option>
                  <option value="pucca">Own Pucca (Concrete) House</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SOCIAL INFORMATION */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Reserved categories and disability programs offer dedicated grants, concessions, and affirmative welfare benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Social Reservation Category *
                </label>
                <select
                  value={profile.category}
                  onChange={(e) => {
                    updateField('category', e.target.value);
                    updateField('socialCategory', e.target.value);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="All">General / Open Category</option>
                  <option value="BC">Backward Classes (BC / OBC)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EBC">Economically Backward Class (EBC / EWS)</option>
                  <option value="Minority">Linguistic or Religious Minority</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Persons with Disabilities (PwD) Status
                </label>
                <select
                  value={profile.hasDisabilityCert ? 'yes' : 'no'}
                  onChange={(e) => {
                    const isPwd = e.target.value === 'yes';
                    updateField('hasDisabilityCert', isPwd);
                    updateField('disabilityStatus', isPwd);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="no">No Disability / Not Applicable</option>
                  <option value="yes">Yes (40% or more certified disability)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-800 block">
                  Religious / Linguistic Minority Status
                </label>
                <select
                  value={profile.minorityStatus ? 'yes' : 'no'}
                  onChange={(e) => updateField('minorityStatus', e.target.value === 'yes')}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="no">Not a Minority</option>
                  <option value="yes">Yes (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: FAMILY & AGRICULTURAL CRITERIA */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs text-teal-950 flex items-start gap-3">
              <Sprout className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Agriculture welfare schemes (PM-Kisan, Rythu Bharosa) and family welfare programs require land and household composition details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Agricultural Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Agricultural Land Ownership</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Do you own cultivable agricultural land?
                    </label>
                    <select
                      value={profile.landOwnership ? 'yes' : 'no'}
                      onChange={(e) => {
                        const owns = e.target.value === 'yes';
                        updateField('landOwnership', owns);
                        updateField('ownsLand', owns);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      <option value="no">No Agricultural Land</option>
                      <option value="yes">Yes, Own Agricultural Land</option>
                    </select>
                  </div>

                  {profile.landOwnership && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Land Holding Size (Acres)
                      </label>
                      <input
                        type="number"
                        value={profile.landSize || ''}
                        onChange={(e) => updateField('landSize', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 2.5"
                        step={0.1}
                        min={0}
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Family Section */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Number of Dependents / Children
                </label>
                <input
                  type="number"
                  value={profile.dependents || 0}
                  onChange={(e) => {
                    const deps = parseInt(e.target.value, 10) || 0;
                    updateField('dependents', deps);
                    updateField('childrenCount', deps);
                  }}
                  min={0}
                  max={20}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Senior Citizens in Household (Age 60+)
                </label>
                <select
                  value={profile.seniorCitizenInHousehold ? 'yes' : 'no'}
                  onChange={(e) => updateField('seniorCitizenInHousehold', e.target.value === 'yes')}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Eligible for Old Age Pension / Healthcare)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                {isSaving ? (
                  <span>Saving Real Profile to Firestore...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile & Discover Schemes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
