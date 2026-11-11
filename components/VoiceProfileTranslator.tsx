'use client';

import React, { useState, useEffect } from 'react';
import { useSpeechRecognition, SpeechLanguage } from '@/lib/hooks/useSpeechRecognition';
import { CitizenProfile } from '@/lib/storage/types';
import {
  Mic,
  Square,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Globe,
  Loader2,
  AlertCircle,
  ArrowRightLeft,
  Languages,
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface VoiceProfileTranslatorProps {
  onProfileExtracted: (extracted: Partial<CitizenProfile>, rawText: string) => void;
  initialText?: string;
}

export default function VoiceProfileTranslator({
  onProfileExtracted,
  initialText = '',
}: VoiceProfileTranslatorProps) {
  // Speech & Translation State
  const [speechLang, setSpeechLang] = useState<SpeechLanguage>('te-IN');
  const [targetLang, setTargetLang] = useState<'en' | 'te'>('en');
  const [inputText, setInputText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [extractedData, setExtractedData] = useState<Partial<CitizenProfile> | null>(null);

  // Loading & Error States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // UI Utilities
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);

  // Web Speech API Hook
  const {
    isSupported,
    isListening,
    transcript,
    recordingDuration,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    defaultLang: speechLang,
    continuous: true,
    interimResults: true,
    maxDurationSeconds: 60,
    onSpeechEnd: (finalText) => {
      if (finalText && finalText.trim().length > 0) {
        setInputText(finalText.trim());
        processTranslateAndExtract(finalText.trim());
      }
    },
  });

  // Keep input text synced while live listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    }
  }, [isListening, transcript]);

  // Language selection handlers
  const handleSelectSpeechLang = (lang: SpeechLanguage) => {
    if (isListening) stopListening();
    setSpeechLang(lang);
    setTargetLang(lang === 'te-IN' ? 'en' : 'te');
    resetTranscript();
    setErrorMessage(null);
  };

  const handleSwapLanguages = () => {
    if (isListening) stopListening();
    const nextSpeech: SpeechLanguage = speechLang === 'te-IN' ? 'en-IN' : 'te-IN';
    const nextTarget: 'en' | 'te' = targetLang === 'en' ? 'te' : 'en';
    setSpeechLang(nextSpeech);
    setTargetLang(nextTarget);
    resetTranscript();
    setErrorMessage(null);
  };

  // Toggle voice recording
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setErrorMessage(null);
      setSuccessMessage(null);
      resetTranscript();
      startListening(speechLang);
    }
  };

  // Core Processing: Gemini 3.1 Flash Lite Translation + Profile Extraction
  const processTranslateAndExtract = async (textToProcess?: string) => {
    const raw = (textToProcess || inputText || transcript).trim();
    if (!raw) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const sourceLangCode = speechLang === 'te-IN' ? 'te' : 'en';

    try {
      // Execute Gemini translation and profile parsing concurrently
      const [translateRes, parseRes] = await Promise.allSettled([
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: raw,
            sourceLang: sourceLangCode,
            targetLang: targetLang,
          }),
        }),
        fetch('/api/parse-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: raw }),
        }),
      ]);

      let translated = '';
      if (translateRes.status === 'fulfilled' && translateRes.value.ok) {
        const transJson = await translateRes.value.json();
        translated = transJson.translatedText || '';
        setTranslatedText(translated);
      }

      if (parseRes.status === 'fulfilled' && parseRes.value.ok) {
        const parseJson = await parseRes.value.json();
        if (parseJson.profile) {
          const extracted = parseJson.profile;
          setExtractedData(extracted);
          // Auto-fill the Profile Wizard form below
          onProfileExtracted(extracted, raw);
          setSuccessMessage('Profile fields extracted with Gemini 3.1 Flash Lite and auto-filled into questionnaire below!');
        }
      }
    } catch (err: any) {
      console.error('Translation & extraction error:', err);
      setErrorMessage(err?.message || 'Failed to process voice intake with Gemini.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy helper
  const copyToClipboard = async (text: string, type: 'original' | 'translated') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedTranslated(true);
        setTimeout(() => setCopiedTranslated(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Text-To-Speech Playback
  const handlePlayTts = () => {
    if (!translatedText || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeakingTts) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    if (isListening) stopListening();
    if (isSpeakingTts && typeof window !== 'undefined') window.speechSynthesis.cancel();
    resetTranscript();
    setInputText('');
    setTranslatedText('');
    setExtractedData(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Sample phrases for one-click testing
  const sampleTelugu = "నా పేరు రాములు, నాకు 45 సంవత్సరాలు, నేను వరంగల్ జిల్లాలోని ఒక పల్లెటూరిలో వ్యవసాయ కూలీని. మా కుటుంబ వార్షిక ఆదాయం ₹1.2 లక్షలు, మాకు సొంత భూమి లేదు. కేటగిరీ BC.";
  const sampleEnglish = "I am a 38-year-old small farmer from Nalgonda, Telangana. I live in a rural village, own 2 acres of land, and my annual family income is ₹1.5 lakh. Social category is BC.";

  const handleApplySample = (text: string, lang: SpeechLanguage) => {
    handleSelectSpeechLang(lang);
    setInputText(text);
    processTranslateAndExtract(text);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Voice Speech Translator & Profile Intake
              </h2>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Gemini 3.1 Flash Lite</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Speak or type in Telugu or English. Transcribed via Web Speech API, translated, and automatically extracted into the questionnaire below.
            </p>
          </div>
        </div>

        {/* Browser Voice Support Warning */}
        {!isSupported && (
          <div className="text-[11px] text-amber-300 bg-amber-950/70 border border-amber-600/60 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Use Google Chrome or Microsoft Edge for microphone voice recognition.</span>
          </div>
        )}
      </div>

      {/* Language Selector Bar & Quick Samples */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs backdrop-blur-md">
        
        {/* Spoken Language */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spoken Speech:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectSpeechLang('te-IN')}
              disabled={isListening}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                speechLang === 'te-IN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>తెలుగు (te-IN)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectSpeechLang('en-IN')}
              disabled={isListening}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                speechLang === 'en-IN'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>English (en-IN)</span>
            </button>
          </div>
        </div>

        {/* Swap Languages */}
        <button
          type="button"
          onClick={handleSwapLanguages}
          disabled={isListening}
          className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-all"
          title="Swap spoken and translated languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Translation Language */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>Translate To:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTargetLang('en')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                targetLang === 'en'
                  ? 'bg-blue-500 text-white shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetLang('te')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                targetLang === 'te'
                  ? 'bg-blue-500 text-white shadow-md font-extrabold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <span>తెలుగు</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Microphone Interaction Zone */}
      <div className="relative bg-slate-950/70 border border-white/10 rounded-2xl p-6 text-center overflow-hidden shadow-inner">
        
        {isListening && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute -inset-2.5 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                <span className="absolute -inset-5 rounded-full bg-emerald-500/15 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleListening}
              disabled={!isSupported}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-105'
                  : 'bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 hover:scale-105 font-bold'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Click to Stop Speaking' : 'Click to Speak Details'}
            >
              {isListening ? (
                <Square className="w-8 h-8 fill-white" />
              ) : (
                <Mic className="w-9 h-9 text-slate-950" />
              )}
            </button>
          </div>

          <div>
            {isListening ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Listening in {speechLang === 'te-IN' ? 'Telugu' : 'English'}...</span>
                </span>
                <p className="font-mono text-xs text-slate-400">
                  00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration} / 01:00
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">
                  {inputText ? 'Click mic to speak more, or edit text below' : 'Click microphone to speak your background details'}
                </span>
                <p className="text-xs text-slate-400">
                  {speechLang === 'te-IN'
                    ? 'తెలుగులో స్పష్టంగా చెప్పండి (వయస్సు, ఊరు, వృత్తి, వార్షిక ఆదాయం, భూమి వివరాలు...)'
                    : 'Speak age, occupation, village/town, annual income, land ownership, and social category'}
                </p>
              </div>
            )}
          </div>

          {/* Audio Wave Bars */}
          {isListening && (
            <div className="flex items-center gap-1.5 h-7">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(20, (h * (recordingDuration % 3 + 1)) / 3)}%`,
                    animationDelay: `${i * 75}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick Demo Sentence Chips */}
          {!isListening && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">Try sample voice sentence:</span>
              <button
                type="button"
                onClick={() => handleApplySample(sampleTelugu, 'te-IN')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-400 border border-white/15 text-[11px] text-emerald-300 font-medium transition-all text-left"
              >
                "నా పేరు రాములు, 45 ఏళ్ళు, వ్యవసాయ కూలీ, ఆదాయం ₹1.2 లక్షలు..."
              </button>
              <button
                type="button"
                onClick={() => handleApplySample(sampleEnglish, 'en-IN')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-blue-500/20 hover:border-blue-400 border border-white/15 text-[11px] text-blue-300 font-medium transition-all text-left"
              >
                "38-year-old small farmer from Nalgonda, 2 acres land, ₹1.5 lakh..."
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Errors or Success Notification */}
      {speechError && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-600/70 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{speechError}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-600/70 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/70 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Dual Transcripts: 1. Speech-to-Text Input/Edit & 2. Gemini Translation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Column 1: Verbatim Speech / Editable Text */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Speech-to-Text Input ({speechLang === 'te-IN' ? 'Telugu' : 'English'})</span>
              </span>
              {inputText && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(inputText, 'original')}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  title="Copy Transcript"
                >
                  {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Your speech transcript appears here in real-time. You can also type or edit directly..."
              className="w-full h-28 p-3 bg-black/40 text-white placeholder-slate-500 border border-white/15 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">Captured via Web Speech API</span>
            <button
              type="button"
              onClick={() => processTranslateAndExtract()}
              disabled={!inputText.trim() || isProcessing}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Translate & Populate Form</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Column 2: Gemini 3.1 Flash Lite Translation */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Gemini 3.1 Flash Lite Translation ({targetLang === 'en' ? 'English' : 'Telugu'})</span>
              </span>
              {translatedText && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayTts}
                    className={`text-slate-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors ${
                      isSpeakingTts ? 'text-blue-400 font-bold' : ''
                    }`}
                    title="Listen with Speech Synthesis"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isSpeakingTts ? 'Stop' : 'Listen'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(translatedText, 'translated')}
                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="Copy Translation"
                  >
                    {copiedTranslated ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copiedTranslated ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-28 overflow-y-auto p-3 bg-black/40 rounded-xl border border-white/15 text-xs text-slate-200 leading-relaxed font-normal">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-xs font-semibold">Gemini 3.1 Flash Lite translating & extracting...</span>
                </div>
              ) : translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-slate-500 italic">
                  Translation in {targetLang === 'en' ? 'English' : 'Telugu'} will appear here automatically when you speak or click Translate.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">Model: gemini-3.1-flash-lite</span>
            {translatedText && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Translation Ready</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Extracted Attributes Badges Preview */}
      {extractedData && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Extracted Profile Attributes (Auto-Populated in Form Below):</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Age</span>
              <strong className="text-white font-bold">{extractedData.age ? `${extractedData.age} Years` : '—'}</strong>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">State</span>
              <strong className="text-white font-bold">{extractedData.state || 'Telangana'}</strong>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">District</span>
              <strong className="text-white font-bold">{extractedData.district || '—'}</strong>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Occupation</span>
              <strong className="text-white font-bold capitalize">{extractedData.occupation ? extractedData.occupation.replace(/_/g, ' ') : '—'}</strong>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Annual Income</span>
              <strong className="text-white font-bold">{extractedData.annualIncome ? `₹${extractedData.annualIncome.toLocaleString('en-IN')}` : '—'}</strong>
            </div>

            <div className="p-2.5 bg-black/30 border border-white/10 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Category</span>
              <strong className="text-white font-bold">{extractedData.category || '—'}</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

